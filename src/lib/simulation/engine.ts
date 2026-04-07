import { PrismaClient } from "@prisma/client";
import { generateAgents } from "../tribes/generator";
import { getAgentReaction, getAnalysisSummary } from "../llm/client";
import type { AgentReactionInput } from "../tribes/types";

const prisma = new PrismaClient();

interface SimulationConfig {
  simulationId: string;
  tribeId: string;
  agentCount: number;
  stimulusText: string;
  stimulusType: "TEXT" | "URL" | "PDF" | "IMAGE";
  chaosModes: {
    hater?: boolean;
    recession?: boolean;
    echoChamber?: boolean;
  };
  onProgress?: (completed: number, total: number) => void;
}

interface BayesianSampler {
  shouldContinue: (results: number[], targetSamples: number, currentSample: number) => boolean;
  getConfidence: (results: number[]) => number;
}

/**
 * Bayesian adaptive sampling
 * Stops early if consensus is high, saves cost
 */
function createBayesianSampler(): BayesianSampler {
  const MIN_SAMPLES = 30; // Minimum before we can stop
  const CONFIDENCE_THRESHOLD = 0.85; // Stop if 85% confident

  function getMean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  function getStdDev(values: number[]): number {
    const mean = getMean(values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  function getConfidence(results: number[]): number {
    if (results.length < MIN_SAMPLES) return 0;

    const stdDev = getStdDev(results);
    const standardError = stdDev / Math.sqrt(results.length);

    // Convert standard error to confidence (inverse relationship)
    // Lower error = higher confidence
    const confidence = Math.max(0, Math.min(1, 1 - standardError * 2));

    return confidence;
  }

  function shouldContinue(
    results: number[],
    targetSamples: number,
    currentSample: number
  ): boolean {
    // Always continue until minimum
    if (currentSample < MIN_SAMPLES) return true;

    // Always finish if we're at target
    if (currentSample >= targetSamples) return false;

    // Check if we have high confidence
    const confidence = getConfidence(results);

    // Stop early if confident
    if (confidence >= CONFIDENCE_THRESHOLD) {
      console.log(
        `Stopping early at ${currentSample}/${targetSamples} samples (confidence: ${(confidence * 100).toFixed(1)}%)`
      );
      return false;
    }

    return true;
  }

  return { shouldContinue, getConfidence };
}

/**
 * Process agents in parallel batches to respect rate limits
 */
async function processAgentBatch(
  agents: AgentReactionInput[],
  batchSize: number = 10
): Promise<Array<Awaited<ReturnType<typeof getAgentReaction>>>> {
  const results: Array<Awaited<ReturnType<typeof getAgentReaction>>> = [];

  for (let i = 0; i < agents.length; i += batchSize) {
    const batch = agents.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((agent) => getAgentReaction(agent, "deepseek"))
    );
    results.push(...batchResults);

    // Small delay between batches to avoid rate limits
    if (i + batchSize < agents.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Calculate Market Fit Index
 */
function calculateMFI(
  purchaseIntent: number,
  sentiment: number,
  virality: number
): number {
  // MFI = weighted average of key metrics
  return (0.5 * purchaseIntent + 0.3 * ((sentiment + 1) / 2) + 0.2 * virality) * 100;
}

/**
 * Generate timeline projections
 */
function generateTimelineProjections(
  mfiScore: number,
  avgSentiment: number,
  avgVirality: number
) {
  // Simple projection model (can be enhanced with ML later)
  const churnRiskBase = 1 - mfiScore / 100;

  return {
    day7: {
      churnRisk: churnRiskBase * 0.3, // 30% of baseline churn in first week
      viralityScore: avgVirality * 1.5, // Virality peaks early
      sentiment: avgSentiment * 0.9, // Slight sentiment drop
    },
    day30: {
      churnRisk: churnRiskBase * 0.6,
      viralityScore: avgVirality * 0.8,
      sentiment: avgSentiment * 0.85,
    },
    day90: {
      churnRisk: churnRiskBase,
      viralityScore: avgVirality * 0.4,
      sentiment: avgSentiment * 0.8,
    },
    day365: {
      churnRisk: churnRiskBase * 1.2,
      viralityScore: avgVirality * 0.2,
      sentiment: avgSentiment * 0.75,
    },
  };
}

/**
 * Main simulation runner
 */
export async function runSimulation(config: SimulationConfig): Promise<void> {
  const {
    simulationId,
    tribeId,
    agentCount,
    stimulusText,
    stimulusType,
    chaosModes,
    onProgress,
  } = config;

  try {
    // Update status to RUNNING
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { status: "RUNNING" },
    });

    // Generate agents
    console.log(`Generating ${agentCount} agents for tribe ${tribeId}...`);
    const agents = generateAgents(tribeId, agentCount);

    // Save agent profiles to database
    const agentProfiles = await Promise.all(
      agents.map((agent, index) =>
        prisma.agentProfile.create({
          data: {
            simulationId,
            skeleton: agent.skeleton as never,
            soul: agent.soul as never,
            shadow: agent.shadow as never,
            memorySeed: agent.memorySeed as never,
            emotionalState: agent.emotionalState as never,
            socialRole: agent.socialRole,
            clusterIndex: agent.clusterIndex,
          },
        })
      )
    );

    // Prepare agent inputs with social context for echo chamber mode
    const agentInputs: AgentReactionInput[] = agents.map((agent, index) => ({
      agent,
      stimulus: {
        type: stimulusType.toLowerCase() as "text" | "url" | "pdf" | "image",
        content: stimulusText,
      },
      chaosModes,
      socialContext: chaosModes.echoChamber
        ? {
            peersReactions: [], // Will be populated as we go
            influencerEndorsed: agent.socialRole === "influencer" ? true : false,
          }
        : undefined,
    }));

    // Bayesian sampling
    const sampler = createBayesianSampler();
    const responses: Awaited<ReturnType<typeof getAgentReaction>>[] = [];
    const purchaseIntents: number[] = [];
    let totalCost = 0;

    console.log(`Running simulation with adaptive sampling...`);
    console.log(`DEBUG: About to start processing ${agentInputs.length} agents`);

    // Process in batches with Bayesian stopping
    let processedCount = 0;
    for (let i = 0; i < agentInputs.length; i++) {
      const input = agentInputs[i]!;
      console.log(`DEBUG: Processing agent ${i + 1}/${agentInputs.length}`);

      // Update social context if echo chamber mode
      if (chaosModes.echoChamber && responses.length > 0) {
        const recentReactions = responses.slice(-5);
        input.socialContext = {
          peersReactions: recentReactions.map((r) => ({
            sentiment: r.sentiment,
            purchaseIntent: r.purchaseIntent,
            virality: r.virality,
          })),
          influencerEndorsed: input.agent.socialRole === "influencer",
        };
      }

      // Get reaction
      console.log(`DEBUG: Calling DeepSeek API for agent ${i + 1}`);
      const reaction = await getAgentReaction(input, "deepseek");
      console.log(`DEBUG: Got reaction for agent ${i + 1}: sentiment=${reaction.sentiment}, purchaseIntent=${reaction.purchaseIntent}`);
      responses.push(reaction);
      purchaseIntents.push(reaction.purchaseIntent);
      totalCost += reaction.costInCents;

      // Save response to database
      await prisma.agentResponse.create({
        data: {
          simulationId,
          agentProfileId: agentProfiles[i]!.id,
          rawResponse: reaction.reaction,
          sentimentScore: reaction.sentiment,
          purchaseIntentScore: reaction.purchaseIntent,
          viralityScore: reaction.virality,
          objectionTags: JSON.stringify(reaction.objections),
          emotionalTriggers: reaction.emotionalTriggers as never,
        },
      });

      processedCount++;
      onProgress?.(processedCount, agentCount);

      // Check if we should stop early
      if (!sampler.shouldContinue(purchaseIntents, agentCount, processedCount)) {
        console.log(`Stopped early after ${processedCount} agents`);
        break;
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Calculate aggregates
    const avgSentiment =
      responses.reduce((sum, r) => sum + r.sentiment, 0) / responses.length;
    const avgPurchaseIntent =
      responses.reduce((sum, r) => sum + r.purchaseIntent, 0) / responses.length;
    const avgVirality =
      responses.reduce((sum, r) => sum + r.virality, 0) / responses.length;

    const mfiScore = calculateMFI(avgPurchaseIntent, avgSentiment, avgVirality);
    const confidence = sampler.getConfidence(purchaseIntents);

    // Objection histogram
    const objectionCounts: Record<string, number> = {};
    responses.forEach((r) => {
      r.objections.forEach((obj) => {
        objectionCounts[obj] = (objectionCounts[obj] ?? 0) + 1;
      });
    });

    // Get top objections
    const topObjections = Object.entries(objectionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([objection, count]) => ({
        objection,
        count,
        severity: count / responses.length,
      }));

    // Generate analysis using DeepSeek
    console.log("Generating analysis summary...");
    const tribe = tribeId; // Get tribe name
    const analysis = await getAnalysisSummary(
      responses.map((r) => r.reaction),
      objectionCounts,
      { sentiment: avgSentiment, purchaseIntent: avgPurchaseIntent, virality: avgVirality },
      mfiScore,
      stimulusText,
      tribe,
      "deepseek" // Use DeepSeek instead of Claude
    );

    totalCost += analysis.costInCents;

    // Generate timeline projections
    const projections = generateTimelineProjections(mfiScore, avgSentiment, avgVirality);

    // Save report
    await prisma.simulationReport.create({
      data: {
        simulationId,
        mfiScore,
        confidenceLevel: confidence,
        topObjections: topObjections as never,
        sentimentSummary: `Average sentiment: ${avgSentiment.toFixed(2)} (-1 to 1)`,
        recommendations: analysis.recommendations as never,
        fullAnalysis: analysis.analysis,
        day7Projection: projections.day7 as never,
        day30Projection: projections.day30 as never,
        day90Projection: projections.day90 as never,
        day365Projection: projections.day365 as never,
      },
    });

    // Update simulation status
    await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        status: "COMPLETE",
        completedAt: new Date(),
        costInCents: Math.round(totalCost),
      },
    });

    console.log(
      `Simulation complete! MFI: ${mfiScore.toFixed(1)}/100, Cost: $${(totalCost / 100).toFixed(2)}`
    );
  } catch (error) {
    console.error("Simulation error:", error);

    // Update status to FAILED
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}

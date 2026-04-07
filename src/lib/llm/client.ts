import { env } from "~/env";
import type { AgentReactionInput, AgentReactionOutput } from "../tribes/types";
import { agentReactionSchema } from "./schemas";

export type LLMModel = "deepseek" | "gpt-4" | "claude";

interface LLMResponse {
  content: string;
  tokensUsed: number;
  costInCents: number;
  model: LLMModel;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

/**
 * Pricing per 1M tokens (input/output avg)
 */
const MODEL_PRICING: Record<LLMModel, number> = {
  deepseek: 0.2, // Very cheap
  "gpt-4": 15.0,
  claude: 12.0,
};

/**
 * Exponential backoff with jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = Math.min(
    config.baseDelay * Math.pow(2, attempt),
    config.maxDelay
  );
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return exponentialDelay + jitter;
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt < config.maxRetries - 1) {
        const delay = calculateDelay(attempt, config);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error("Retry failed with unknown error");
}

/**
 * Call DeepSeek API (cheaper model for agent reactions)
 */
async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  console.log(`DEBUG: Calling DeepSeek API with key: ${env.DEEPSEEK_API_KEY?.slice(0, 10)}...`);
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });
  console.log(`DEBUG: DeepSeek API response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`DEBUG: DeepSeek API error response:`, errorText);
    throw new Error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage: { total_tokens: number };
  };
  console.log(`DEBUG: DeepSeek API returned ${data.usage.total_tokens} tokens`);

  const content = data.choices[0]?.message.content ?? "";
  const tokensUsed = data.usage.total_tokens;
  const costInCents = (tokensUsed / 1000000) * MODEL_PRICING.deepseek;

  return {
    content,
    tokensUsed,
    costInCents,
    model: "deepseek",
  };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage: { total_tokens: number };
  };

  const content = data.choices[0]?.message.content ?? "";
  const tokensUsed = data.usage.total_tokens;
  const costInCents = (tokensUsed / 1000000) * MODEL_PRICING["gpt-4"];

  return {
    content,
    tokensUsed,
    costInCents,
    model: "gpt-4",
  };
}

/**
 * Call Claude API
 */
async function callClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    content: Array<{ text: string }>;
    usage: { input_tokens: number; output_tokens: number };
  };

  const content = data.content[0]?.text ?? "";
  const tokensUsed = data.usage.input_tokens + data.usage.output_tokens;
  const costInCents = (tokensUsed / 1000000) * MODEL_PRICING.claude;

  return {
    content,
    tokensUsed,
    costInCents,
    model: "claude",
  };
}

/**
 * Generic LLM caller with model selection
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  model: LLMModel = "deepseek"
): Promise<LLMResponse> {
  return withRetry(async () => {
    switch (model) {
      case "deepseek":
        return await callDeepSeek(systemPrompt, userPrompt);
      case "gpt-4":
        return await callOpenAI(systemPrompt, userPrompt);
      case "claude":
        return await callClaude(systemPrompt, userPrompt);
      default:
        throw new Error(`Unknown model: ${model}`);
    }
  });
}

/**
 * Get agent reaction using LLM
 */
export async function getAgentReaction(
  input: AgentReactionInput,
  model: LLMModel = "deepseek"
): Promise<AgentReactionOutput & { costInCents: number }> {
  const { agent, stimulus, chaosModes, socialContext } = input;

  // Build system prompt
  const systemPrompt = buildAgentSystemPrompt(agent, chaosModes);

  // Build user prompt
  const userPrompt = buildAgentUserPrompt(agent, stimulus, socialContext);

  // Call LLM
  const response = await callLLM(systemPrompt, userPrompt, model);

  // Parse and validate response
  let parsed;
  try {
    const jsonContent = JSON.parse(response.content) as unknown;
    parsed = agentReactionSchema.parse(jsonContent);
  } catch (error) {
    console.error("Failed to parse agent reaction:", error);
    console.error("Raw response:", response.content);
    throw new Error("Invalid agent reaction format");
  }

  return {
    ...parsed,
    costInCents: response.costInCents,
  };
}

/**
 * Get analysis summary using LLM
 */
export async function getAnalysisSummary(
  sampleReactions: string[],
  objectionHistogram: Record<string, number>,
  averages: {
    sentiment: number;
    purchaseIntent: number;
    virality: number;
  },
  mfiScore: number,
  stimulusText: string,
  tribeName: string,
  model: LLMModel = "deepseek"
): Promise<{ analysis: string; recommendations: Array<{ priority: string; action: string; expectedImpact: string }>; costInCents: number }> {
  const systemPrompt = `You are an expert product analyst. Analyze simulation results and provide:
1. Top 3 objections with clear explanations
2. Key emotional drivers
3. Concrete, actionable recommendations
4. A go/no-go statement

Be brutally honest. Focus on what matters. Be specific.`;

  const userPrompt = `Analyze this product test simulation:

**Product/Stimulus:**
${stimulusText}

**Target Audience:** ${tribeName}

**Market Fit Index:** ${mfiScore.toFixed(1)}/100

**Metrics:**
- Average Sentiment: ${averages.sentiment.toFixed(2)} (-1 to 1)
- Purchase Intent: ${(averages.purchaseIntent * 100).toFixed(1)}%
- Virality Potential: ${(averages.virality * 100).toFixed(1)}%

**Top Objections:**
${Object.entries(objectionHistogram)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([obj, count]) => `- ${obj}: ${count} mentions`)
  .join("\n")}

**Sample Agent Reactions:**
${sampleReactions.slice(0, 10).map((r, i) => `${i + 1}. ${r}`).join("\n\n")}

Provide analysis as JSON:
{
  "topObjections": [{"objection": "...", "explanation": "..."}],
  "emotionalDrivers": ["...", "..."],
  "recommendations": [{"priority": "high|medium|low", "action": "...", "expectedImpact": "..."}],
  "goNoGo": "GO|NO-GO|CONDITIONAL",
  "reasoning": "..."
}`;

  const response = await callLLM(systemPrompt, userPrompt, model);

  // Parse and validate JSON response with error handling
  let parsed;
  try {
    // Try to parse the response
    const jsonContent = JSON.parse(response.content) as {
      recommendations: Array<{ priority: string; action: string; expectedImpact: string }>;
    };
    parsed = jsonContent;
  } catch (error) {
    console.error("Failed to parse analysis JSON:", error);
    console.error("Raw response:", response.content);

    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]!) as {
          recommendations: Array<{ priority: string; action: string; expectedImpact: string }>;
        };
        console.log("Successfully extracted JSON from markdown block");
      } catch (e) {
        console.error("Failed to parse extracted JSON:", e);
        // Return fallback response
        return {
          analysis: JSON.stringify({
            error: "Failed to parse LLM response",
            rawResponse: response.content.substring(0, 500)
          }),
          recommendations: [],
          costInCents: response.costInCents,
        };
      }
    } else {
      // Return fallback response
      return {
        analysis: JSON.stringify({
          error: "Failed to parse LLM response",
          rawResponse: response.content.substring(0, 500)
        }),
        recommendations: [],
        costInCents: response.costInCents,
      };
    }
  }

  return {
    analysis: response.content,
    recommendations: parsed.recommendations ?? [],
    costInCents: response.costInCents,
  };
}

/**
 * Build system prompt for agent
 */
function buildAgentSystemPrompt(
  agent: AgentReactionInput["agent"],
  chaosModes: AgentReactionInput["chaosModes"]
): string {
  const { skeleton, soul, shadow, emotionalState } = agent;

  let prompt = `You are a realistic human with the following profile. React honestly and specifically as this person would.

**Your Demographics:**
- Age: ${skeleton.age}
- Income: $${skeleton.income.toLocaleString()}/year
- Location: ${skeleton.location}
- Education: ${skeleton.education}
- Employment: ${skeleton.employment}

**Your Values & Identity (${soul.tribe}):**
- Core Values: ${soul.coreValues.join(", ")}
- Top Fears: ${soul.topFears.join(", ")}
- Motivations: ${soul.primaryMotivations.join(", ")}

**Your Communication Style:**
${soul.communicationStyle}. Use slang naturally: ${soul.slangUsage.join(", ")}

**Your Market Awareness:**
Currently using: ${shadow.currentSolutions.join(", ")}
Aware of: ${shadow.knownCompetitors.slice(0, 3).join(", ")}

**Your Emotional State Right Now:**
- Fear level: ${(emotionalState.fear * 100).toFixed(0)}%
- Excitement: ${(emotionalState.excitement * 100).toFixed(0)}%
- Trust: ${(emotionalState.trust * 100).toFixed(0)}%
- Stress: ${(emotionalState.stress * 100).toFixed(0)}%
- Risk aversion: ${(emotionalState.riskAversion * 100).toFixed(0)}%

**Deal-breakers:** ${soul.dealbreakers.join(", ")}
**Trust signals:** ${soul.trustSignals.join(", ")}`;

  // Add chaos mode modifiers
  if (chaosModes.hater) {
    prompt += `\n\n⚠️ HATER MODE: Be highly skeptical. Look for hypocrisy, empty promises, greenwashing, or corporate BS. Don't hold back criticism.`;
  }

  if (chaosModes.recession) {
    prompt += `\n\n💰 RECESSION MODE: You're under significant financial stress. Every dollar counts. Prioritize affordability and necessity.`;
  }

  if (chaosModes.echoChamber) {
    prompt += `\n\n👥 ECHO CHAMBER MODE: You've seen similar opinions from peers. Their sentiment influences your reaction.`;
  }

  prompt += `\n\nRespond as this person would. If you dislike it, explain why specifically. If you like it, say what would make you actually buy.`;

  return prompt;
}

/**
 * Build user prompt for agent
 */
function buildAgentUserPrompt(
  agent: AgentReactionInput["agent"],
  stimulus: AgentReactionInput["stimulus"],
  socialContext?: AgentReactionInput["socialContext"]
): string {
  let prompt = `You're being shown a new product/offering:\n\n${stimulus.content}\n\n`;

  if (socialContext?.peersReactions && socialContext.peersReactions.length > 0) {
    const avgSentiment =
      socialContext.peersReactions.reduce((sum, r) => sum + r.sentiment, 0) /
      socialContext.peersReactions.length;
    prompt += `\n**What others in your community are saying:**\n`;
    prompt += avgSentiment > 0.3
      ? "Generally positive reactions, people seem interested.\n"
      : avgSentiment < -0.3
        ? "Lots of skepticism and criticism in the community.\n"
        : "Mixed reactions, some interest but also concerns.\n";
  }

  if (socialContext?.influencerEndorsed) {
    prompt += `\n**Note:** An influencer you follow has endorsed this.\n`;
  }

  prompt += `\nProvide your honest reaction as a JSON object with this exact structure:
{
  "reaction": "your detailed reaction in 2-4 sentences as this person",
  "sentiment": -1 to 1 (negative to positive),
  "purchaseIntent": 0 to 1 (0=never, 1=definitely buying),
  "virality": 0 to 1 (0=won't share, 1=must tell everyone),
  "objections": ["specific objection 1", "objection 2"],
  "emotionalTriggers": {
    "confusion": 0 to 1,
    "anger": 0 to 1,
    "excitement": 0 to 1,
    "fear": 0 to 1,
    "trust": 0 to 1
  }
}`;

  return prompt;
}

import tribesData from "~/data/tribes.json";
import type { Tribe, AgentProfileData, SocialRole } from "./types";

const tribes = tribesData.tribes as Tribe[];

/**
 * Random number generators with seed support for reproducibility
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function normalRandom(mean: number, stdDev: number, seed: number): number {
  // Box-Muller transform for normal distribution
  const u1 = seededRandom(seed);
  const u2 = seededRandom(seed + 1);
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

function randomChoice<T>(array: T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index]!;
}

function sample<T>(array: T[], count: number, seed: number): T[] {
  const shuffled = [...array].sort(() => seededRandom(seed++) - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate skeleton (demographic constraints)
 */
function generateSkeleton(tribe: Tribe, seed: number): AgentProfileData["skeleton"] {
  const age = Math.round(
    Math.max(
      tribe.demographic.ageRange[0]!,
      Math.min(
        tribe.demographic.ageRange[1]!,
        normalRandom(
          (tribe.demographic.ageRange[0]! + tribe.demographic.ageRange[1]!) / 2,
          (tribe.demographic.ageRange[1]! - tribe.demographic.ageRange[0]!) / 4,
          seed
        )
      )
    )
  );

  const income = Math.max(
    0,
    normalRandom(tribe.demographic.avgIncome, tribe.demographic.incomeStdDev, seed + 1)
  );

  const location = randomChoice(tribe.demographic.regions, seed + 2);
  const education = randomChoice(tribe.demographic.education, seed + 3);
  const employment = randomChoice(tribe.demographic.employment, seed + 4);

  // Calculate purchasing power and financial constraints
  const disposableIncome = income * 0.2; // Rough estimate
  const purchasingPower = Math.min(1, income / 100000);
  const financialStress = income < 40000 ? 0.7 : income < 70000 ? 0.4 : 0.2;

  return {
    age,
    income,
    location,
    education,
    employment,
    disposableIncome,
    purchasingPower,
    financialStress,
    constraints: {
      budgetCeiling: disposableIncome * 0.3,
      riskTolerance: purchasingPower * 0.5,
      timeAvailability: employment === "Full-time" ? 0.3 : 0.6,
    },
  };
}

/**
 * Generate soul (tribal psychographics)
 */
function generateSoul(tribe: Tribe, seed: number): AgentProfileData["soul"] {
  const coreValues = sample(tribe.psychographic.values, 3, seed);
  const topFears = sample(tribe.psychographic.fears, 2, seed + 1);
  const primaryMotivations = sample(tribe.psychographic.motivations, 3, seed + 2);
  const slangUsage = sample(tribe.psychographic.slang, 4, seed + 3);
  const keyHotButtons = sample(tribe.psychographic.hotButtons, 3, seed + 4);

  return {
    tribe: tribe.name,
    tribeId: tribe.id,
    coreValues,
    topFears,
    primaryMotivations,
    slangUsage,
    keyHotButtons,
    trustSignals: tribe.psychographic.trustSignals,
    dealbreakers: tribe.psychographic.dealbreakers,
    communicationStyle: tribe.tone.style,
  };
}

/**
 * Generate shadow (market awareness)
 */
function generateShadow(tribe: Tribe, seed: number): AgentProfileData["shadow"] {
  const knownCompetitors = sample(
    tribe.shadow.competitors,
    Math.min(tribe.shadow.competitors.length, Math.floor(seededRandom(seed) * 5) + 2),
    seed + 1
  );

  return {
    competitors: tribe.shadow.competitors,
    knownCompetitors,
    awarenessLevel: tribe.shadow.awarenessLevel,
    switchingCost: tribe.shadow.switchingCost,
    currentSolutions: knownCompetitors.slice(0, 2), // Using 1-2 competitors currently
  };
}

/**
 * Generate memory seed (for longitudinal learning)
 */
function generateMemorySeed(): AgentProfileData["memorySeed"] {
  return {
    pastInteractions: [],
    trustLevel: 0.5, // Neutral starting point
    brandFamiliarity: 0,
    previousExposures: 0,
  };
}

/**
 * Generate emotional state (emotional engine)
 */
function generateEmotionalState(
  tribe: Tribe,
  skeleton: AgentProfileData["skeleton"],
  seed: number
): AgentProfileData["emotionalState"] {
  // Base emotions from tribe profile with individual variation
  const variance = 0.15;

  const fear = Math.max(
    0,
    Math.min(1, tribe.emotionalProfile.baseFear + normalRandom(0, variance, seed))
  );
  const excitement = Math.max(
    0,
    Math.min(1, tribe.emotionalProfile.baseExcitement + normalRandom(0, variance, seed + 1))
  );
  const trust = Math.max(
    0,
    Math.min(1, tribe.emotionalProfile.baseTrust + normalRandom(0, variance, seed + 2))
  );
  const stress = Math.max(
    0,
    Math.min(
      1,
      skeleton.financialStress * 0.5 +
        tribe.emotionalProfile.baseStress * 0.5 +
        normalRandom(0, variance, seed + 3)
    )
  );

  return {
    fear,
    excitement,
    trust,
    stress,
    noveltyBias: tribe.emotionalProfile.noveltyBias,
    riskAversion: tribe.emotionalProfile.riskAversion,
    socialApprovalSensitivity: tribe.emotionalProfile.socialApproval,
  };
}

/**
 * Assign social role based on tribe distribution
 */
function assignSocialRole(tribe: Tribe, seed: number): SocialRole {
  const roll = seededRandom(seed);
  const dist = tribe.socialDistribution;

  let cumulative = 0;
  const roles: Array<{ role: SocialRole; prob: number }> = [
    { role: "influencer", prob: dist.influencer },
    { role: "earlyAdopter", prob: dist.earlyAdopter },
    { role: "contrarian", prob: dist.contrarian },
    { role: "skeptic", prob: dist.skeptic },
    { role: "fanatic", prob: dist.fanatic },
    { role: "follower", prob: dist.follower },
  ];

  for (const { role, prob } of roles) {
    cumulative += prob;
    if (roll <= cumulative) {
      return role;
    }
  }

  return "follower"; // Fallback
}

/**
 * Generate a single agent profile
 */
export function generateAgent(
  tribeId: string,
  agentIndex: number,
  totalAgents: number,
  baseSeed: number = Date.now()
): AgentProfileData {
  const tribe = tribes.find((t) => t.id === tribeId);
  if (!tribe) {
    throw new Error(`Tribe ${tribeId} not found`);
  }

  const seed = baseSeed + agentIndex;

  const skeleton = generateSkeleton(tribe, seed);
  const soul = generateSoul(tribe, seed + 1000);
  const shadow = generateShadow(tribe, seed + 2000);
  const memorySeed = generateMemorySeed();
  const emotionalState = generateEmotionalState(tribe, skeleton, seed + 3000);
  const socialRole = assignSocialRole(tribe, seed + 4000);

  // Cluster assignment for social graph (divide agents into ~5 clusters)
  const clusterIndex = Math.floor((agentIndex / totalAgents) * 5);

  return {
    skeleton,
    soul,
    shadow,
    memorySeed,
    emotionalState,
    socialRole,
    clusterIndex,
  };
}

/**
 * Generate all agents for a simulation
 */
export function generateAgents(
  tribeId: string,
  count: number,
  baseSeed?: number
): AgentProfileData[] {
  const agents: AgentProfileData[] = [];

  for (let i = 0; i < count; i++) {
    agents.push(generateAgent(tribeId, i, count, baseSeed));
  }

  return agents;
}

/**
 * Get tribe by ID
 */
export function getTribe(tribeId: string): Tribe | undefined {
  return tribes.find((t) => t.id === tribeId);
}

/**
 * Get all tribes
 */
export function getAllTribes(): Tribe[] {
  return tribes;
}

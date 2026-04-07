export type SocialRole =
  | "influencer"
  | "earlyAdopter"
  | "contrarian"
  | "skeptic"
  | "fanatic"
  | "follower";

export interface Tribe {
  id: string;
  name: string;
  description: string;
  demographic: {
    ageRange: [number, number];
    avgIncome: number;
    incomeStdDev: number;
    regions: string[];
    education: string[];
    employment: string[];
  };
  psychographic: {
    values: string[];
    fears: string[];
    motivations: string[];
    slang: string[];
    hotButtons: string[];
    trustSignals: string[];
    dealbreakers: string[];
  };
  shadow: {
    competitors: string[];
    awarenessLevel: string;
    switchingCost: string;
  };
  tone: {
    style: string;
    cynicism: number;
    enthusiasm: number;
    formality: number;
  };
  emotionalProfile: {
    baseFear: number;
    baseExcitement: number;
    baseTrust: number;
    baseStress: number;
    noveltyBias: number;
    riskAversion: number;
    socialApproval: number;
  };
  socialDistribution: {
    influencer: number;
    earlyAdopter: number;
    contrarian: number;
    skeptic: number;
    fanatic: number;
    follower: number;
  };
}

export interface AgentProfileData {
  skeleton: {
    age: number;
    income: number;
    location: string;
    education: string;
    employment: string;
    disposableIncome: number;
    purchasingPower: number;
    financialStress: number;
    constraints: {
      budgetCeiling: number;
      riskTolerance: number;
      timeAvailability: number;
    };
  };
  soul: {
    tribe: string;
    tribeId: string;
    coreValues: string[];
    topFears: string[];
    primaryMotivations: string[];
    slangUsage: string[];
    keyHotButtons: string[];
    trustSignals: string[];
    dealbreakers: string[];
    communicationStyle: string;
  };
  shadow: {
    competitors: string[];
    knownCompetitors: string[];
    awarenessLevel: string;
    switchingCost: string;
    currentSolutions: string[];
  };
  memorySeed: {
    pastInteractions: unknown[];
    trustLevel: number;
    brandFamiliarity: number;
    previousExposures: number;
  };
  emotionalState: {
    fear: number;
    excitement: number;
    trust: number;
    stress: number;
    noveltyBias: number;
    riskAversion: number;
    socialApprovalSensitivity: number;
  };
  socialRole: SocialRole;
  clusterIndex: number;
}

export interface AgentReactionInput {
  agent: AgentProfileData;
  stimulus: {
    type: "text" | "url" | "pdf" | "image";
    content: string;
    meta?: Record<string, unknown>;
  };
  chaosModes: {
    hater?: boolean;
    recession?: boolean;
    echoC hamber?: boolean;
  };
  socialContext?: {
    peersReactions?: Array<{
      sentiment: number;
      purchaseIntent: number;
      virality: number;
    }>;
    influencerEndorsed?: boolean;
  };
}

export interface AgentReactionOutput {
  reaction: string;
  sentiment: number; // -1 to 1
  purchaseIntent: number; // 0 to 1
  virality: number; // 0 to 1
  objections: string[];
  emotionalTriggers?: {
    confusion?: number;
    anger?: number;
    excitement?: number;
    fear?: number;
    trust?: number;
  };
}

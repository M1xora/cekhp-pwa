// src/types/knowledge-base.ts

export interface Symptom {
  id: string;          // unique slug, e.g. "battery-drain-fast"
  name: string;        // human-readable label
  description: string; // brief explanation shown to user
  category: string;    // e.g. "Battery" | "Screen" | "Performance" | ...
}

export interface Condition {
  id: string;                 // unique slug, e.g. "battery-degradation"
  name: string;               // e.g. "Battery Degradation"
  description: string;        // explanation of the condition
  recommendedAction: string;  // e.g. "Replace the battery at an authorized service center."
}

export interface Rule {
  id: string;           // unique identifier, e.g. "rule-battery-01"
  symptomIds: string[]; // non-empty; all must match for full confidence
  conditionId: string;  // references Condition.id
}

export interface DiagnosisResult {
  conditionId: string;
  conditionName: string;
  confidenceScore: number; // [0, 1] inclusive
  inferenceLog: string[];  // step-by-step trace of how the engine matched this rule,
                           // e.g. ["Checked rule-battery-01: matched 2/3 symptoms → score 0.67"]
}

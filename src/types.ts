/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameState {
  HOME = "HOME",
  PLAYING = "PLAYING",
  ZEN_JAAP = "ZEN_JAAP", // Unlimited zen mode (no health, just chanting)
  DIRECTIONS = "DIRECTIONS",
  AI_GURU = "AI_GURU", // Swadhyay / Chatting with Terapanth Spiritual Guide
}

export type DroppingItemType =
  | "bead"            // Standard mala bead (+1 chant)
  | "golden_bead"     // Auspicious golden bead (+5 chants)
  | "white_lotus"     // Shvetambara white lotus (+10% Concentration)
  | "navkar_leaf"     // Leaf containing part of Navkar Mantra (+10 chants)
  | "vikaar_anger"    // Impure thought: Anger (Krodh) - Reduces concentration
  | "vikaar_ego"      // Impure thought: Ego (Ahankar) - Reduces concentration
  | "vikaar_greed";   // Impure thought: Greed (Lobh) - Reduces concentration

export interface DroppingItem {
  id: string;
  type: DroppingItemType;
  x: number; // percentage from left, 5% to 95%
  y: number; // percentage from top, 0% to 100%
  speed: number;
  size: number;
  label?: string; // Om, Navkar text, etc.
  angle: number;
  wobbleSpeed: number;
  wobbleAmount: number;
  wobbleOffset: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "guru";
  text: string;
  timestamp: string;
}

export interface Sankalp {
  malaTarget: number; // target completed malas
  completed: number;
}

export interface JainFact {
  title: string;
  description: string;
  significance: string;
}

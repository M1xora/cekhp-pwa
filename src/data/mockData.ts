// src/data/mockData.ts
// Mock Knowledge Base for CekHP Diagnostic Tool

import type { Condition, Symptom, Rule } from '../types/knowledge-base';

// ─── 5 Conditions ────────────────────────────────────────────────────────────

export const mockConditions: Condition[] = [
  {
    id: 'battery-degradation',
    name: 'Battery Degradation',
    description:
      'The battery has lost significant capacity due to chemical aging, resulting in poor battery life and unreliable power delivery.',
    recommendedAction:
      'Replace the battery at an authorized service center. Avoid overnight charging and exposure to extreme temperatures to extend the new battery lifespan.',
  },
  {
    id: 'gpu-failure',
    name: 'GPU Failure',
    description:
      'The Graphics Processing Unit (GPU) is malfunctioning, causing visual artifacts, screen flickering, or display rendering issues.',
    recommendedAction:
      'Back up your data immediately. Bring the device to an authorized repair center for GPU or mainboard diagnostics and replacement.',
  },
  {
    id: 'ram-overflow',
    name: 'RAM Overflow',
    description:
      'The device is running out of available RAM, causing slowdowns, app crashes, and unresponsive behavior under normal workloads.',
    recommendedAction:
      'Close background apps, clear the app cache, and consider a factory reset if problems persist. If the issue continues, the RAM module may need inspection.',
  },
  {
    id: 'camera-module-failure',
    name: 'Camera Module Failure',
    description:
      'One or more camera modules are faulty, leading to blurry images, app crashes, or a completely unresponsive camera.',
    recommendedAction:
      'Clean the camera lens gently. If the problem persists, take the device to a service center for camera module replacement.',
  },
  {
    id: 'charging-port-damage',
    name: 'Charging Port Damage',
    description:
      'The charging port is physically damaged or corroded, preventing reliable charging or data transfer connections.',
    recommendedAction:
      'Avoid forcefully inserting cables. Use wireless charging as a temporary workaround and visit a service center for port cleaning or replacement.',
  },
];

// ─── 20 Symptoms ─────────────────────────────────────────────────────────────
// Categories: Battery (4), Screen (4), Performance (4), Camera (3),
//             Connectivity (3), Audio (2)  → total: 20

export const mockSymptoms: Symptom[] = [
  // Battery (4)
  {
    id: 'battery-drain-fast',
    name: 'Battery drains fast',
    description: 'The battery percentage drops unusually quickly even during light usage.',
    category: 'Battery',
  },
  {
    id: 'battery-overheating',
    name: 'Device overheats while charging',
    description: 'The device becomes excessively hot when connected to a charger.',
    category: 'Battery',
  },
  {
    id: 'battery-swollen',
    name: 'Battery appears swollen',
    description: 'The back cover is pushed outward, indicating a swollen or bulging battery.',
    category: 'Battery',
  },
  {
    id: 'charging-slow',
    name: 'Charges very slowly or intermittently',
    description: 'The device takes much longer than usual to charge, or charging stops and starts unpredictably.',
    category: 'Battery',
  },

  // Screen (4)
  {
    id: 'screen-flickering',
    name: 'Screen flickering',
    description: 'The display flickers or flashes intermittently, especially under certain brightness levels.',
    category: 'Screen',
  },
  {
    id: 'screen-dead-pixels',
    name: 'Dead or stuck pixels',
    description: 'One or more pixels on the screen appear permanently dark, white, or a fixed color.',
    category: 'Screen',
  },
  {
    id: 'screen-color-distortion',
    name: 'Color distortion or green tint',
    description: 'Colors on the display appear washed out, overly green, or otherwise incorrect.',
    category: 'Screen',
  },
  {
    id: 'screen-horizontal-lines',
    name: 'Horizontal lines across display',
    description: 'Thin horizontal or vertical lines appear across the screen during normal use.',
    category: 'Screen',
  },

  // Performance (4)
  {
    id: 'app-crashes-frequently',
    name: 'Apps crash frequently',
    description: 'Multiple applications close unexpectedly or stop responding without warning.',
    category: 'Performance',
  },
  {
    id: 'device-lag-slow',
    name: 'Device is slow and laggy',
    description: 'The interface stutters and takes several seconds to respond to taps or swipes.',
    category: 'Performance',
  },
  {
    id: 'phone-freezes',
    name: 'Phone freezes or becomes unresponsive',
    description: 'The entire device freezes and requires a forced restart to recover.',
    category: 'Performance',
  },
  {
    id: 'high-ram-usage',
    name: 'Constantly high RAM usage',
    description: 'System monitors show RAM usage near 100% even with no apps open.',
    category: 'Performance',
  },

  // Camera (3)
  {
    id: 'camera-blurry-photos',
    name: 'Camera takes blurry photos',
    description: 'Photos are consistently out of focus regardless of lighting conditions.',
    category: 'Camera',
  },
  {
    id: 'camera-app-crash',
    name: 'Camera app crashes on open',
    description: 'The default or third-party camera application crashes immediately upon launch.',
    category: 'Camera',
  },
  {
    id: 'camera-black-screen',
    name: 'Camera shows black screen',
    description: 'The camera viewfinder displays a completely black screen instead of a live preview.',
    category: 'Camera',
  },

  // Connectivity (3)
  {
    id: 'charging-cable-loose',
    name: 'Charging cable feels loose',
    description: 'The USB cable fits loosely into the charging port and disconnects easily.',
    category: 'Connectivity',
  },
  {
    id: 'usb-not-recognized',
    name: 'Device not recognized by computer',
    description: 'When connected via USB, the computer does not detect the device.',
    category: 'Connectivity',
  },
  {
    id: 'wifi-drops-frequently',
    name: 'Wi-Fi drops frequently',
    description: 'The device disconnects from Wi-Fi networks repeatedly without user action.',
    category: 'Connectivity',
  },

  // Audio (2)
  {
    id: 'speaker-distorted-sound',
    name: 'Speaker produces distorted sound',
    description: 'Audio from the speaker sounds crackling, muffled, or distorted at any volume.',
    category: 'Audio',
  },
  {
    id: 'microphone-not-working',
    name: 'Microphone not working during calls',
    description: 'The other party cannot hear anything during phone or video calls.',
    category: 'Audio',
  },
];

// ─── 10 Rules ─────────────────────────────────────────────────────────────────
// ≥2 Battery rules, ≥2 Screen rules, ≥2 Performance rules
// Each rule references valid Condition.id and valid Symptom.id values

export const mockRules: Rule[] = [
  // Battery rules (3) → battery-degradation & charging-port-damage
  {
    id: 'rule-battery-01',
    conditionId: 'battery-degradation',
    symptomIds: ['battery-drain-fast', 'battery-overheating', 'battery-swollen'],
  },
  {
    id: 'rule-battery-02',
    conditionId: 'battery-degradation',
    symptomIds: ['battery-drain-fast', 'charging-slow'],
  },
  {
    id: 'rule-battery-03',
    conditionId: 'charging-port-damage',
    symptomIds: ['charging-slow', 'charging-cable-loose', 'usb-not-recognized'],
  },

  // Screen rules (3) → gpu-failure
  {
    id: 'rule-screen-01',
    conditionId: 'gpu-failure',
    symptomIds: ['screen-flickering', 'screen-color-distortion', 'screen-horizontal-lines'],
  },
  {
    id: 'rule-screen-02',
    conditionId: 'gpu-failure',
    symptomIds: ['screen-dead-pixels', 'screen-color-distortion'],
  },
  {
    id: 'rule-screen-03',
    conditionId: 'gpu-failure',
    symptomIds: ['screen-flickering', 'screen-horizontal-lines'],
  },

  // Performance rules (2) → ram-overflow
  {
    id: 'rule-performance-01',
    conditionId: 'ram-overflow',
    symptomIds: ['app-crashes-frequently', 'device-lag-slow', 'high-ram-usage'],
  },
  {
    id: 'rule-performance-02',
    conditionId: 'ram-overflow',
    symptomIds: ['phone-freezes', 'app-crashes-frequently', 'device-lag-slow'],
  },

  // Camera rule (1) → camera-module-failure
  {
    id: 'rule-camera-01',
    conditionId: 'camera-module-failure',
    symptomIds: ['camera-blurry-photos', 'camera-app-crash', 'camera-black-screen'],
  },

  // Charging port rule (1) → charging-port-damage
  {
    id: 'rule-charging-01',
    conditionId: 'charging-port-damage',
    symptomIds: ['charging-cable-loose', 'charging-slow', 'battery-overheating'],
  },
];

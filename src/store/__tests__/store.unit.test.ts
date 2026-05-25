import { describe, it, expect, beforeEach } from 'vitest';
import { useDiagnosaStore } from '../useDiagnosaStore';

// Reset store to a clean initial state before each test
beforeEach(() => {
  useDiagnosaStore.getState().resetStore();
});

describe('useDiagnosaStore — initial state', () => {
  it('has all four fields at their initial values', () => {
    const state = useDiagnosaStore.getState();
    expect(state.selectedDeviceCategory).toBe('');
    expect(state.selectedSymptomCategory).toBe('');
    expect(state.activeFacts).toEqual([]);
    expect(state.diagnosisResults).toEqual([]);
  });
});

describe('useDiagnosaStore — setDeviceCategory', () => {
  it('updates selectedDeviceCategory to the provided value', () => {
    useDiagnosaStore.getState().setDeviceCategory('samsung');
    expect(useDiagnosaStore.getState().selectedDeviceCategory).toBe('samsung');
  });

  it('overwrites a previously set category', () => {
    useDiagnosaStore.getState().setDeviceCategory('iphone');
    useDiagnosaStore.getState().setDeviceCategory('xiaomi');
    expect(useDiagnosaStore.getState().selectedDeviceCategory).toBe('xiaomi');
  });
});

describe('useDiagnosaStore — toggleFact (add path)', () => {
  it('adds a fact ID when it is not yet in activeFacts', () => {
    useDiagnosaStore.getState().toggleFact('battery-drain-fast');
    expect(useDiagnosaStore.getState().activeFacts).toContain('battery-drain-fast');
  });

  it('adds multiple distinct facts independently', () => {
    useDiagnosaStore.getState().toggleFact('fact-a');
    useDiagnosaStore.getState().toggleFact('fact-b');
    const { activeFacts } = useDiagnosaStore.getState();
    expect(activeFacts).toContain('fact-a');
    expect(activeFacts).toContain('fact-b');
    expect(activeFacts).toHaveLength(2);
  });
});

describe('useDiagnosaStore — toggleFact (remove path)', () => {
  it('removes a fact ID when it is already in activeFacts', () => {
    // First add the fact
    useDiagnosaStore.getState().toggleFact('some-id');
    expect(useDiagnosaStore.getState().activeFacts).toContain('some-id');

    // Then toggle again to remove
    useDiagnosaStore.getState().toggleFact('some-id');
    expect(useDiagnosaStore.getState().activeFacts).not.toContain('some-id');
  });

  it('leaves other facts untouched when removing one', () => {
    useDiagnosaStore.getState().toggleFact('keep-me');
    useDiagnosaStore.getState().toggleFact('remove-me');
    useDiagnosaStore.getState().toggleFact('remove-me');

    const { activeFacts } = useDiagnosaStore.getState();
    expect(activeFacts).toContain('keep-me');
    expect(activeFacts).not.toContain('remove-me');
  });
});

describe('useDiagnosaStore — toggleFact("") no-op', () => {
  it('leaves activeFacts unchanged when called with an empty string on empty state', () => {
    useDiagnosaStore.getState().toggleFact('');
    expect(useDiagnosaStore.getState().activeFacts).toEqual([]);
  });

  it('leaves activeFacts unchanged when called with an empty string on non-empty state', () => {
    useDiagnosaStore.getState().toggleFact('existing-fact');
    const before = [...useDiagnosaStore.getState().activeFacts];

    useDiagnosaStore.getState().toggleFact('');

    expect(useDiagnosaStore.getState().activeFacts).toEqual(before);
  });
});

describe('useDiagnosaStore — resetStore', () => {
  it('clears all four fields back to their initial values', () => {
    // Set non-initial values for all fields
    const store = useDiagnosaStore.getState();
    store.setDeviceCategory('oppo');
    store.setSymptomCategory('Battery');
    store.toggleFact('battery-drain-fast');
    store.setResults([
      {
        conditionId: 'condition-battery-damage',
        conditionCode: 'K01',
        conditionName: 'Kerusakan Baterai',
        description: 'Kerusakan baterai',
        recommendedAction: 'Ganti baterai.',
        matchedRuleId: 'rule-r01-battery',
        matchedRuleCode: 'R01',
        matchedSymptomIds: ['symptom-battery-drain', 'symptom-device-hot'],
        matchedSymptomCodes: ['G01', 'G02'],
        inferenceLog: ['Rule rule-r01-battery (R01): semua 2 gejala terpenuhi → COCOK'],
        confidenceScore: 1.0,
      },
    ]);

    // Verify they were actually set
    expect(useDiagnosaStore.getState().selectedDeviceCategory).toBe('oppo');
    expect(useDiagnosaStore.getState().selectedSymptomCategory).toBe('Battery');
    expect(useDiagnosaStore.getState().activeFacts).toHaveLength(1);
    expect(useDiagnosaStore.getState().diagnosisResults).toHaveLength(1);

    // Reset
    useDiagnosaStore.getState().resetStore();

    // All fields should be back to initial
    const state = useDiagnosaStore.getState();
    expect(state.selectedDeviceCategory).toBe('');
    expect(state.selectedSymptomCategory).toBe('');
    expect(state.activeFacts).toEqual([]);
    expect(state.diagnosisResults).toEqual([]);
  });
});

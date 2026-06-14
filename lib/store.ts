"use client";

import { create } from "zustand";
import { SelectionCriteria, SelectionResult, selectProducts } from "./selectionEngine";
import { TOTAL_STEPS } from "./questions";

type AnswerValue = string | string[] | boolean;

interface SelectorState {
  currentStep: number;
  answers: Record<string, AnswerValue | undefined>;
  result: SelectionResult | null;
  isComplete: boolean;

  setAnswer: (key: string, value: AnswerValue) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  compute: () => void;
}

export const useSelectorStore = create<SelectorState>((set, get) => ({
  currentStep: 0,
  answers: {},
  result: null,
  isComplete: false,

  setAnswer: (key, value) => {
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    }));
  },

  nextStep: () => {
    const { currentStep, compute } = get();
    if (currentStep < TOTAL_STEPS - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      compute();
      set({ isComplete: true });
    }
  },

  prevStep: () => {
    const { currentStep, isComplete } = get();
    if (isComplete) {
      set({ isComplete: false, currentStep: TOTAL_STEPS - 1 });
      return;
    }
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  reset: () => {
    set({ currentStep: 0, answers: {}, result: null, isComplete: false });
  },

  compute: () => {
    const { answers } = get();
    const criteria: SelectionCriteria = {
      category: (answers.category as string) ?? "",
      application: Array.isArray(answers.application) ? answers.application : answers.application ? [answers.application as string] : [],
      substrateA: (answers.substrateA as string) ?? "",
      substrateB: (answers.substrateB as string) ?? "",
      environment: Array.isArray(answers.environment) ? answers.environment : answers.environment ? [answers.environment as string] : [],
      features: Array.isArray(answers.features) ? answers.features : answers.features ? [answers.features as string] : [],
      thickness: (answers.thickness as string) ?? "指定なし",
      processingMethod: (answers.processingMethod as string) ?? "",
      priceSensitive: answers.priceSensitive === "true" || answers.priceSensitive === true,
      permanent: answers.permanent === "true" || answers.permanent === true,
    };
    const result = selectProducts(criteria);
    set({ result });
  },
}));

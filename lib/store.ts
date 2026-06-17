"use client";

import { create } from "zustand";
import { SelectionCriteria, SelectionResult, selectProducts } from "./selectionEngine";
import { getVisibleQuestions, questions, shouldShowPermanentQuestion } from "./questions";

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
    const { currentStep, answers, compute } = get();
    const nextQuestion = questions.slice(currentStep + 1).find((question) => getVisibleQuestions(answers).includes(question));

    if (nextQuestion) {
      set({ currentStep: questions.indexOf(nextQuestion) });
    } else {
      compute();
      set({ isComplete: true });
    }
  },

  prevStep: () => {
    const { currentStep, answers, isComplete } = get();
    const visibleQuestions = getVisibleQuestions(answers);

    if (isComplete) {
      const lastQuestion = visibleQuestions[visibleQuestions.length - 1];
      set({ isComplete: false, currentStep: lastQuestion ? questions.indexOf(lastQuestion) : 0 });
      return;
    }

    const previousQuestion = questions
      .slice(0, currentStep)
      .reverse()
      .find((question) => visibleQuestions.includes(question));

    if (previousQuestion) {
      set({ currentStep: questions.indexOf(previousQuestion) });
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
      permanent: shouldShowPermanentQuestion(answers)
        ? answers.permanent === "true" || answers.permanent === true
        : true,
    };
    const result = selectProducts(criteria);
    set({ result });
  },
}));

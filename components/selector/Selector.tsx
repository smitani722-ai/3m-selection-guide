"use client";

import { useSelectorStore } from "@/lib/store";
import { categoryQuestion, getQuestionsForCategory, getQuestionsForCategoryAndAnswers, getTotalStepsForAnswers } from "@/lib/questions";
import type { Question, QuestionOption } from "@/lib/questions";
import { QuestionCard } from "./QuestionCard";
import { ResultCard } from "./ResultCard";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Zap } from "lucide-react";

type Answers = Partial<Record<string, string | string[] | boolean>>;

function getOptionLabel(question: Question, value: string): string {
  return question.options.find((o: QuestionOption) => o.value === value)?.label ?? value;
}

function AnswerChips({ answers, currentStep }: { answers: Answers; currentStep: number }) {
  const category = answers.category as string | undefined;
  const allQuestions = category
    ? [categoryQuestion, ...getQuestionsForCategoryAndAnswers(category, answers)]
    : [categoryQuestion];

  const chips: string[] = [];
  for (let i = 0; i < currentStep; i++) {
    const q = allQuestions[i];
    if (!q) continue;
    const val = answers[q.criteriaKey];
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val)) {
      for (const v of val as string[]) {
        if (v === "none") continue;
        chips.push(getOptionLabel(q, v));
      }
    } else {
      chips.push(getOptionLabel(q, String(val)));
    }
  }

  if (chips.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {chips.map((c, i) => (
        <span key={i} className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
          {c}
        </span>
      ))}
    </div>
  );
}

export function Selector() {
  const { currentStep, answers, result, noMatchReason, isComplete, nextStep, prevStep, reset } = useSelectorStore();

  const category = answers.category as string | undefined;
  const totalSteps = category ? getTotalStepsForAnswers(category, answers) : 1;

  const currentQuestion =
    currentStep === 0
      ? categoryQuestion
      : category
        ? getQuestionsForCategoryAndAnswers(category, answers)[currentStep - 1]
        : null;

  const progressPercent = isComplete
    ? 100
    : category
      ? Math.round((currentStep / totalSteps) * 100)
      : 0;

  const currentAnswer = currentQuestion ? answers[currentQuestion.criteriaKey] : undefined;
  const hasAnswer =
    currentAnswer !== undefined &&
    (Array.isArray(currentAnswer) ? (currentAnswer as string[]).length > 0 : currentAnswer !== "");

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-red-200 uppercase tracking-[0.15em]">3M Industrial</div>
            <h1 className="text-base font-black tracking-tight leading-tight">製品セレクションガイド</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-red-700/50 rounded-full px-3 py-1.5">
            <Zap size={11} className="text-red-200" />
            <span className="text-[10px] text-red-100 font-semibold">AI選定エンジン</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 w-full flex-1">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="font-medium">
              {isComplete
                ? "選定完了"
                : category
                  ? `STEP ${currentStep + 1} / ${totalSteps}`
                  : "STEP 1 / ?"}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-gray-200" />
        </div>

        {/* Selected answers summary */}
        {!isComplete && currentStep > 0 && (
          <AnswerChips answers={answers} currentStep={currentStep} />
        )}

        {/* Content */}
        {!isComplete && currentQuestion ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Question header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                <Sparkles size={10} />
                {category && currentStep > 0 ? category : "カテゴリ選択"}
              </div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{currentQuestion.text}</h2>
              {currentQuestion.subtext && (
                <p className="text-sm text-gray-400 mt-1">{currentQuestion.subtext}</p>
              )}
            </div>

            {/* Options */}
            <div className="px-6 py-5">
              <QuestionCard question={currentQuestion} />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/60">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={14} />
                戻る
              </button>

              <button
                onClick={nextStep}
                disabled={!hasAnswer}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.97]"
              >
                {isLastStep ? (
                  <>
                    <Sparkles size={13} />
                    製品を選定する
                  </>
                ) : (
                  <>
                    次へ
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : !isComplete ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-sm">読み込み中...</p>
          </div>
        ) : (
          <div>
            {/* Result header */}
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Selection Result</div>
                <h2 className="text-2xl font-black text-gray-900">推奨製品</h2>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1.5 text-xs text-gray-700 border border-gray-300 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={12} />
                  条件を変更
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs text-white bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-900 transition-colors"
                >
                  <RotateCcw size={12} />
                  最初から
                </button>
              </div>
            </div>

            {result ? (
              <ResultCard result={result} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <div className="text-5xl mb-4">
                  {noMatchReason === "floor_handTear" ? "⚠️" : "🔍"}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  現在の条件に一致する製品が見つかりませんでした。
                </h3>
                <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
                  {noMatchReason === "floor_handTear"
                    ? "床ライン用途では、耐久性・施工性を優先するため、通常はカッター施工タイプをご使用いただきます。「手でカット不要」を選択してご確認ください。"
                    : "入力条件に合う製品がデータベースに見つかりませんでした。条件を変更してお試しください。"}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={prevStep}
                    className="inline-flex items-center gap-2 text-sm text-gray-700 border border-gray-300 px-5 py-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={13} />
                    条件を変更
                  </button>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 text-sm text-red-600 border border-red-300 px-5 py-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <RotateCcw size={13} />
                    最初から
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center space-y-1">
          <p className="text-xs text-gray-400">本ツールは製品選定の参考情報を提供するものです。</p>
          <p className="text-xs text-gray-400">最終的な選定は3M担当者または正式な技術資料でご確認ください。</p>
        </footer>
      </div>
    </div>
  );
}

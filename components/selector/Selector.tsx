"use client";

import { useSelectorStore } from "@/lib/store";
import { getVisibleOptions, getVisibleQuestions, questions } from "@/lib/questions";
import { getSingleSidedTapeDisplayLabel, isSingleSidedTapeQuestion } from "@/lib/singleSidedTapeLogic";
import { QuestionCard } from "./QuestionCard";
import { ResultCard } from "./ResultCard";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

export function Selector() {
  const { currentStep, answers, result, isComplete, nextStep, prevStep, reset } = useSelectorStore();

  const question = questions[currentStep];
  const visibleQuestions = getVisibleQuestions(answers);
  const visibleStepIndex = Math.max(
    0,
    visibleQuestions.findIndex((visibleQuestion) => visibleQuestion.id === question?.id),
  );
  const visibleStepCount = visibleQuestions.length;
  const isLastVisibleQuestion = visibleStepIndex === visibleStepCount - 1;
  const progressPercent = isComplete ? 100 : Math.round((visibleStepIndex / visibleStepCount) * 100);

  const currentAnswer = answers[question?.criteriaKey as keyof typeof answers] as
    | string
    | string[]
    | boolean
    | undefined;
  const visibleOptionValues = question ? getVisibleOptions(question, answers).map((option) => option.value) : [];
  const hasAnswer =
    currentAnswer !== undefined &&
    (Array.isArray(currentAnswer)
      ? currentAnswer.some((answer) => visibleOptionValues.includes(answer))
      : visibleOptionValues.includes(String(currentAnswer)));
  const showIntro = currentStep === 0 && Object.keys(answers).length === 0 && !isComplete;
  const termHelps = [
    { term: "VHB", text: "ビスやリベットの代替にも使える高強度フォーム両面テープです。" },
    { term: "LSE", text: "PP・PE・TPOなど、通常の粘着剤が付きにくい素材のことです。" },
    { term: "低VOC", text: "においや揮発成分を抑えたい電子機器・車載・光学用途で重視します。" },
    { term: "再剥離", text: "後で剥がす用途です。貼った糊を再利用する意味ではありません。" },
    { term: "Dual Lock", text: "繰り返し着脱できる3Mの高保持力ファスナーです。" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-red-200 uppercase tracking-widest">3M Industrial</div>
            <h1 className="text-lg font-black tracking-tight">製品セレクションガイド</h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-red-200">テープ・接着剤・ファスナー</div>
            <div className="text-xs text-red-100 mt-0.5">AI選定エンジン</div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {showIntro && (
          <section className="mb-6 space-y-4">
            <div className="rounded-lg border border-red-100 bg-white p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-widest text-red-600">
                Sales Selection Guide
              </div>
              <p className="mt-2 text-2xl font-black leading-tight text-gray-900">
                質問に答えるだけで、おすすめの3M製品、代替候補、データシートを表示します。
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                被着体、用途、温度、必要特性を順番に選ぶと、営業現場のルールに沿って推奨製品を表示します。
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                用語ヘルプ
              </div>
              <div className="grid gap-3">
                {termHelps.map((item) => (
                  <div key={item.term} className="flex gap-3 text-sm">
                    <span className="w-20 shrink-0 font-bold text-gray-900">{item.term}</span>
                    <span className="text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>{isComplete ? "選定完了" : `STEP ${visibleStepIndex + 1} / ${visibleStepCount}`}</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Answer Summary (breadcrumb) */}
        {Object.keys(answers).length > 0 && !isComplete && (
          <div className="mb-4 p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-500 flex flex-wrap gap-2">
            {Object.entries(answers).map(([k, v]) => {
              if (!v || (Array.isArray(v) && v.length === 0)) return null;
              const formatValue = (value: string | boolean) => {
                if (value === "true" || value === true) return "はい";
                if (value === "false" || value === false) return "いいえ";
                const rawValue = value as string;
                return isSingleSidedTapeQuestion(k) ? getSingleSidedTapeDisplayLabel(k, rawValue) : rawValue;
              };
              const label = Array.isArray(v) ? v.map(formatValue).join("・") : formatValue(v);
              return (
                <span key={k} className="bg-gray-100 px-2 py-0.5 rounded-full">{label}</span>
              );
            })}
          </div>
        )}

        {/* Main Content */}
        {!isComplete ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Question Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full mb-3">
                <Sparkles size={12} />
                Q{currentStep + 1}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{question.text}</h2>
              {question.subtext && (
                <p className="text-sm text-gray-500 mt-1">{question.subtext}</p>
              )}
            </div>

            {/* Options */}
            <QuestionCard question={question} />

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={16} />
                戻る
              </button>

              <button
                onClick={nextStep}
                disabled={!hasAnswer}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isLastVisibleQuestion ? (
                  <>
                    <Sparkles size={14} />
                    製品を選定する
                  </>
                ) : (
                  <>
                    次へ
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Result Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">選定結果</div>
                <h2 className="text-2xl font-black text-gray-900">推奨製品</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={14} />
                  条件を変更
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-sm text-white bg-gray-700 px-3 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <RotateCcw size={14} />
                  最初から
                </button>
              </div>
            </div>

            {result ? (
              <ResultCard result={result} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">該当製品が見つかりません</h3>
                <p className="text-gray-500 text-sm mb-4">
                  入力された条件に合う製品がデータベースに見つかりませんでした。
                  条件を変更してもう一度お試しください。
                </p>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 mx-auto text-sm text-red-600 border border-red-300 px-4 py-2 rounded-full hover:bg-red-50"
                >
                  <RotateCcw size={14} />
                  条件をリセット
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-400">
          <p>本ツールは製品選定の参考情報を提供するものです。</p>
          <p>最終的な選定は3M担当者または正式な技術資料でご確認ください。</p>
          <p className="mt-1">© 3M Japan — Industrial Selection Guide</p>
        </footer>
      </div>
    </div>
  );
}

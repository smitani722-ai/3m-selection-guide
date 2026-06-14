"use client";

import { Question } from "@/lib/questions";
import { useSelectorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { answers, setAnswer } = useSelectorStore();
  const current = answers[question.criteriaKey as keyof typeof answers] as
    | string
    | string[]
    | boolean
    | undefined;

  const isSelected = (value: string) => {
    if (question.type === "multi") {
      return Array.isArray(current) && current.includes(value);
    }
    return current === value;
  };

  const handleSelect = (value: string) => {
    if (question.type === "multi") {
      const prev = Array.isArray(current) ? current : [];
      if (prev.includes(value)) {
        setAnswer(question.criteriaKey, prev.filter((v) => v !== value));
      } else {
        setAnswer(question.criteriaKey, [...prev, value]);
      }
    } else {
      setAnswer(question.criteriaKey, value);
    }
  };

  return (
    <div className="grid gap-3">
      {question.options.map((opt) => {
        const selected = isSelected(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200",
              "hover:border-red-400 hover:bg-red-50",
              selected
                ? "border-red-600 bg-red-50 text-red-900 shadow-sm"
                : "border-gray-200 bg-white text-gray-700"
            )}
          >
            <span className={cn("flex-shrink-0", selected ? "text-red-600" : "text-gray-400")}>
              {selected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </span>
            {opt.icon && <span className="text-xl">{opt.icon}</span>}
            <span>
              <span className="block font-medium">{opt.label}</span>
              {opt.help && (
                <span className={cn("mt-1 block text-xs", selected ? "text-red-700" : "text-gray-500")}>
                  {opt.help}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

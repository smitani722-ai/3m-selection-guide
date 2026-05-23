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
  const current = answers[question.criteriaKey];

  const isSelected = (value: string) => {
    if (question.type === "multi") {
      return Array.isArray(current) && (current as string[]).includes(value);
    }
    return current === value;
  };

  const handleSelect = (value: string) => {
    if (question.type === "multi") {
      const prev = Array.isArray(current) ? (current as string[]) : [];
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
    <div className="grid gap-2.5">
      {question.options.map((opt) => {
        const selected = isSelected(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={cn(
              "flex items-start gap-3 rounded-xl border-2 px-5 py-3.5 text-left transition-all duration-150",
              "hover:border-red-400 hover:bg-red-50/60",
              selected
                ? "border-red-600 bg-red-50 text-red-900 shadow-sm"
                : "border-gray-200 bg-white text-gray-700"
            )}
          >
            <span className={cn("flex-shrink-0 mt-0.5 transition-colors", selected ? "text-red-600" : "text-gray-300")}>
              {selected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </span>
            {opt.icon && <span className="text-lg leading-none flex-shrink-0 mt-0.5">{opt.icon}</span>}
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-medium leading-snug">{opt.label}</span>
              {opt.description && (
                <span className={cn("text-xs mt-0.5 leading-snug", selected ? "text-red-600/70" : "text-gray-400")}>
                  {opt.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

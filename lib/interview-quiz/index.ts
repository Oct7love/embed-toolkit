import cLanguageJson from "./questions/c-language.json";
import rtosJson from "./questions/rtos.json";
import protocolJson from "./questions/protocol.json";
import hardwareJson from "./questions/hardware.json";
import type { Question, QuestionCategory, Difficulty } from "@/types/interview-quiz";

const rawQuestions: Question[] = [
  ...(cLanguageJson as Question[]),
  ...(rtosJson as Question[]),
  ...(protocolJson as Question[]),
  ...(hardwareJson as Question[]),
];

export const ALL_QUESTIONS: readonly Question[] = Object.freeze(rawQuestions);

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function filterQuestions(
  category: QuestionCategory | "all",
  difficulty: Difficulty | "all",
  excludeIds: string[] = []
): Question[] {
  return ALL_QUESTIONS.filter(
    (q) =>
      (category === "all" || q.category === category) &&
      (difficulty === "all" || q.difficulty === difficulty) &&
      !excludeIds.includes(q.id)
  );
}

export function pickRandomQuestion(pool: Question[]): Question | null {
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function getCategoryCount(category: QuestionCategory): number {
  return ALL_QUESTIONS.filter((q) => q.category === category).length;
}

export function getTotalCount(): number {
  return ALL_QUESTIONS.length;
}

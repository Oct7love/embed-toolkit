export type QuestionCategory = "c-language" | "rtos" | "protocol" | "hardware";
export type QuestionType = "single-choice" | "true-false";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  category: QuestionCategory;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface CategoryStats {
  total: number;
  correct: number;
}

export interface QuizStats {
  totalAnswered: number;
  correctCount: number;
  categoryStats: Record<string, CategoryStats>;
}

export interface QuizStore {
  // Persistent state
  favorites: string[];
  wrongAnswers: string[];
  stats: QuizStats;

  // Session state (not persisted)
  answeredIds: string[];
  currentCategory: QuestionCategory | "all";
  currentDifficulty: Difficulty | "all";
  currentView: "quiz" | "favorites" | "wrong-answers" | "stats";

  // Actions
  toggleFavorite: (id: string) => void;
  recordAnswer: (questionId: string, category: string, isCorrect: boolean) => void;
  removeFromWrongAnswers: (id: string) => void;
  resetSession: () => void;
  resetAllData: () => void;
  setCategory: (category: QuestionCategory | "all") => void;
  setDifficulty: (difficulty: Difficulty | "all") => void;
  setView: (view: "quiz" | "favorites" | "wrong-answers" | "stats") => void;
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  "c-language": "C 语言陷阱",
  rtos: "RTOS 概念",
  protocol: "通信协议",
  hardware: "硬件基础",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  "c-language": "text-blue-600 dark:text-blue-400",
  rtos: "text-purple-600 dark:text-purple-400",
  protocol: "text-green-600 dark:text-green-400",
  hardware: "text-orange-600 dark:text-orange-400",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

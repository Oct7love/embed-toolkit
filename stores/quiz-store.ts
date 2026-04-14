import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  QuestionCategory,
  Difficulty,
  QuizStats,
} from "@/types/interview-quiz";

interface QuizState {
  favorites: string[];
  wrongAnswers: string[];
  stats: QuizStats;

  answeredIds: string[];
  currentCategory: QuestionCategory | "all";
  currentDifficulty: Difficulty | "all";
  currentView: "quiz" | "favorites" | "wrong-answers" | "stats";

  toggleFavorite: (id: string) => void;
  recordAnswer: (questionId: string, category: string, isCorrect: boolean) => void;
  removeFromWrongAnswers: (id: string) => void;
  resetSession: () => void;
  resetAllData: () => void;
  setCategory: (category: QuestionCategory | "all") => void;
  setDifficulty: (difficulty: Difficulty | "all") => void;
  setView: (view: "quiz" | "favorites" | "wrong-answers" | "stats") => void;
}

const emptyStats: QuizStats = {
  totalAnswered: 0,
  correctCount: 0,
  categoryStats: {},
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      favorites: [],
      wrongAnswers: [],
      stats: emptyStats,

      answeredIds: [],
      currentCategory: "all",
      currentDifficulty: "all",
      currentView: "quiz",

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),

      recordAnswer: (questionId, category, isCorrect) =>
        set((state) => {
          const categoryStats = { ...state.stats.categoryStats };
          const existing = categoryStats[category] ?? { total: 0, correct: 0 };
          categoryStats[category] = {
            total: existing.total + 1,
            correct: existing.correct + (isCorrect ? 1 : 0),
          };

          const wrongAnswers = new Set(state.wrongAnswers);
          if (!isCorrect) wrongAnswers.add(questionId);
          else wrongAnswers.delete(questionId);

          const answeredIds = state.answeredIds.includes(questionId)
            ? state.answeredIds
            : [...state.answeredIds, questionId];

          return {
            stats: {
              totalAnswered: state.stats.totalAnswered + 1,
              correctCount: state.stats.correctCount + (isCorrect ? 1 : 0),
              categoryStats,
            },
            wrongAnswers: Array.from(wrongAnswers),
            answeredIds,
          };
        }),

      removeFromWrongAnswers: (id) =>
        set((state) => ({
          wrongAnswers: state.wrongAnswers.filter((w) => w !== id),
        })),

      resetSession: () => set({ answeredIds: [] }),

      resetAllData: () =>
        set({
          favorites: [],
          wrongAnswers: [],
          stats: emptyStats,
          answeredIds: [],
        }),

      setCategory: (category) => set({ currentCategory: category, answeredIds: [] }),
      setDifficulty: (difficulty) => set({ currentDifficulty: difficulty, answeredIds: [] }),
      setView: (view) => set({ currentView: view }),
    }),
    {
      name: "embed-toolkit-quiz",
      partialize: (state) => ({
        favorites: state.favorites,
        wrongAnswers: state.wrongAnswers,
        stats: state.stats,
      }),
    }
  )
);

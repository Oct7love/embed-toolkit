"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useQuizStore } from "@/stores/quiz-store";
import {
  loadQuestions,
  filterQuestions,
  pickRandomQuestion,
  getCategoryCount,
  getQuestionById,
} from "@/lib/interview-quiz";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  CATEGORY_COLORS,
  DIFFICULTY_COLORS,
} from "@/types/interview-quiz";
import type {
  Question,
  QuestionCategory,
  Difficulty,
} from "@/types/interview-quiz";
import {
  Star,
  CheckCircle2,
  XCircle,
  SkipForward,
  RotateCcw,
  BookOpen,
  BarChart3,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES: (QuestionCategory | "all")[] = [
  "all",
  "c-language",
  "rtos",
  "protocol",
  "hardware",
];
const DIFFICULTIES: (Difficulty | "all")[] = ["all", "easy", "medium", "hard"];

export function InterviewQuiz() {
  const {
    favorites,
    wrongAnswers,
    stats,
    answeredIds,
    currentCategory,
    currentDifficulty,
    currentView,
    toggleFavorite,
    recordAnswer,
    removeFromWrongAnswers,
    resetSession,
    resetAllData,
    setCategory,
    setDifficulty,
    setView,
  } = useQuizStore();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loadedPool, setLoadedPool] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 当分类变化时，动态加载对应题库（已加载过的分类会走缓存）
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    loadQuestions(currentCategory).then((qs) => {
      if (!cancelled) {
        setLoadedPool(qs);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentCategory]);

  const pool = useMemo(
    () => filterQuestions(loadedPool, currentDifficulty, answeredIds),
    [loadedPool, currentDifficulty, answeredIds]
  );

  const pickNext = useCallback(() => {
    const next = pickRandomQuestion(pool);
    setCurrentQuestion(next);
    setSelectedOption(null);
    setShowAnswer(false);
  }, [pool]);

  // 显示用：currentQuestion 为空或不在当前 pool 时（切换分类后），派生一道题兜底
  // —— 用派生值代替 useEffect 内的 setState 级联，避免 react-hooks/set-state-in-effect
  const displayQuestion = useMemo(() => {
    if (currentQuestion && pool.some((q) => q.id === currentQuestion.id)) {
      return currentQuestion;
    }
    return pool.length > 0 ? pickRandomQuestion(pool) : null;
  }, [currentQuestion, pool]);

  const handleSubmit = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    recordAnswer(currentQuestion.id, currentQuestion.category, isCorrect);
    setShowAnswer(true);
  }, [selectedOption, currentQuestion, recordAnswer]);

  const handleNext = useCallback(() => {
    pickNext();
  }, [pickNext]);

  const handleReset = useCallback(() => {
    resetSession();
    setCurrentQuestion(null);
  }, [resetSession]);

  const accuracy =
    stats.totalAnswered > 0
      ? ((stats.correctCount / stats.totalAnswered) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-4">
      {/* View Tabs */}
      <Tabs value={currentView} onValueChange={(v) => v && setView(v as typeof currentView)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quiz">
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            刷题
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="mr-1.5 h-3.5 w-3.5" />
            收藏 ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="wrong-answers">
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            错题 ({wrongAnswers.length})
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            统计
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="space-y-4">
          {/* Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">分类</label>
                  <Select
                    value={currentCategory}
                    onValueChange={(v) =>
                      v && setCategory(v as QuestionCategory | "all")
                    }
                  >
                    <SelectTrigger className="w-[140px]" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c === "all" ? "全部" : CATEGORY_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">难度</label>
                  <Select
                    value={currentDifficulty}
                    onValueChange={(v) =>
                      v && setDifficulty(v as Difficulty | "all")
                    }
                  >
                    <SelectTrigger className="w-[120px]" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d === "all" ? "全部" : DIFFICULTY_LABELS[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  本轮进度 {answeredIds.length} / {answeredIds.length + pool.length + (currentQuestion ? 1 : 0)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-7"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    重置本轮
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                加载题库中...
              </CardContent>
            </Card>
          ) : displayQuestion ? (
            <QuestionCard
              question={displayQuestion}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              showAnswer={showAnswer}
              onSubmit={handleSubmit}
              onNext={handleNext}
              isFavorite={favorites.includes(displayQuestion.id)}
              onToggleFavorite={() => toggleFavorite(displayQuestion.id)}
            />
          ) : pool.length === 0 && answeredIds.length > 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg font-medium">本轮题目已全部完成！</p>
                <p className="text-sm text-muted-foreground mt-1">
                  共答 {answeredIds.length} 道题，正确率 {accuracy}%
                </p>
                <Button className="mt-4" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  开始新一轮
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                当前筛选下没有题目
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <QuestionList
            ids={favorites}
            emptyText="还没有收藏的题目"
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
          />
        </TabsContent>

        <TabsContent value="wrong-answers">
          <QuestionList
            ids={wrongAnswers}
            emptyText="还没有错题"
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onRemove={removeFromWrongAnswers}
            showRemove
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="总答题数" value={stats.totalAnswered.toString()} />
            <StatCard label="正确题数" value={stats.correctCount.toString()} />
            <StatCard label="总正确率" value={`${accuracy}%`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>分类统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["c-language", "rtos", "protocol", "hardware"] as QuestionCategory[]).map(
                (cat) => {
                  const s = stats.categoryStats[cat];
                  const total = s?.total ?? 0;
                  const correct = s?.correct ?? 0;
                  const rate = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";
                  const pool = getCategoryCount(cat);

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={cn("font-medium", CATEGORY_COLORS[cat])}>
                          {CATEGORY_LABELS[cat]}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {correct}/{total} ({rate}%) | 题库 {pool} 题
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: total > 0 ? `${(correct / total) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">危险操作</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("确定要清除所有答题记录、收藏和错题吗？此操作不可撤销。")) {
                    resetAllData();
                    setCurrentQuestion(null);
                  }
                }}
              >
                清除所有数据
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuestionCard({
  question,
  selectedOption,
  setSelectedOption,
  showAnswer,
  onSubmit,
  onNext,
  isFavorite,
  onToggleFavorite,
}: {
  question: Question;
  selectedOption: number | null;
  setSelectedOption: (v: number | null) => void;
  showAnswer: boolean;
  onSubmit: () => void;
  onNext: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={CATEGORY_COLORS[question.category]}
            >
              {CATEGORY_LABELS[question.category]}
            </Badge>
            <Badge className={DIFFICULTY_COLORS[question.difficulty]}>
              {DIFFICULTY_LABELS[question.difficulty]}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              #{question.id}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "取消收藏" : "收藏"}
          >
            <Star
              className={cn(
                "h-5 w-5",
                isFavorite && "fill-yellow-400 text-yellow-400"
              )}
            />
          </Button>
        </div>
        <CardTitle className="text-base font-normal whitespace-pre-wrap leading-relaxed mt-2">
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((opt, i) => {
          const isSelected = selectedOption === i;
          const isRight = i === question.correctAnswer;

          return (
            <button
              key={i}
              onClick={() => !showAnswer && setSelectedOption(i)}
              disabled={showAnswer}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                !showAnswer && isSelected && "border-primary bg-primary/10",
                !showAnswer && !isSelected && "border-border hover:border-primary/50",
                showAnswer && isRight && "border-green-500 bg-green-500/10",
                showAnswer && isSelected && !isRight && "border-red-500 bg-red-500/10",
                showAnswer && !isSelected && !isRight && "border-border opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-sm font-medium shrink-0">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="text-sm flex-1">{opt}</span>
                {showAnswer && isRight && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                )}
                {showAnswer && isSelected && !isRight && (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
            </button>
          );
        })}

        {showAnswer && (
          <div
            className={cn(
              "mt-4 rounded-lg border p-4",
              isCorrect
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
            )}
          >
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 dark:text-green-400">回答正确</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-700 dark:text-red-400">
                    回答错误（正确答案 {String.fromCharCode(65 + question.correctAnswer)}）
                  </span>
                </>
              )}
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {question.explanation}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!showAnswer ? (
            <Button onClick={onSubmit} disabled={selectedOption === null}>
              提交答案
            </Button>
          ) : (
            <Button onClick={onNext}>
              <SkipForward className="mr-2 h-4 w-4" />
              下一题
            </Button>
          )}
          {!showAnswer && (
            <Button variant="outline" onClick={onNext}>
              跳过
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionList({
  ids,
  emptyText,
  favorites,
  onToggleFavorite,
  onRemove,
  showRemove,
}: {
  ids: string[];
  emptyText: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onRemove?: (id: string) => void;
  showRemove?: boolean;
}) {
  const questions = ids
    .map((id) => getQuestionById(id))
    .filter((q): q is Question => q !== undefined);

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {emptyText}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={CATEGORY_COLORS[q.category]}>
                  {CATEGORY_LABELS[q.category]}
                </Badge>
                <Badge className={DIFFICULTY_COLORS[q.difficulty]}>
                  {DIFFICULTY_LABELS[q.difficulty]}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  #{q.id}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFavorite(q.id)}
                  aria-label={favorites.includes(q.id) ? "取消收藏" : "收藏"}
                  aria-pressed={favorites.includes(q.id)}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      favorites.includes(q.id) &&
                        "fill-yellow-400 text-yellow-400"
                    )}
                  />
                </Button>
                {showRemove && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(q.id)}
                  >
                    标记为已掌握
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm whitespace-pre-wrap">{q.question}</p>
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                正确答案 {String.fromCharCode(65 + q.correctAnswer)}:{" "}
                {q.options[q.correctAnswer]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                {q.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold font-mono">{value}</p>
      </CardContent>
    </Card>
  );
}

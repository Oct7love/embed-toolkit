import { Lightbulb } from "lucide-react";

interface ToolIntroProps {
  title: string;
  description: string;
  /** 可选：使用场景或典型示例（1-2 句话） */
  example?: string;
}

export function ToolIntro({ title, description, example }: ToolIntroProps) {
  return (
    <div className="mb-6 space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      {example && (
        <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-foreground/80">{example}</p>
        </div>
      )}
    </div>
  );
}

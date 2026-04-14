"use client";

import { useMemo } from "react";
import { useStateMachineStore } from "@/stores/state-machine-store";
import { generateCCode } from "@/lib/state-machine";
import { CodeBlock } from "@/components/shared/code-block";

export function CodePanel() {
  const getActiveProject = useStateMachineStore((s) => s.getActiveProject);
  const project = getActiveProject();

  const code = useMemo(
    () => generateCCode(project.states, project.transitions, project.name),
    [project.states, project.transitions, project.name]
  );

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Generated C Code</h3>
      <CodeBlock code={code} language="c" />
    </div>
  );
}

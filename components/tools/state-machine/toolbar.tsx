"use client";

import { useStateMachineStore } from "@/stores/state-machine-store";
import { Button } from "@/components/ui/button";
import {
  MousePointerIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  Trash2Icon,
  UndoIcon,
} from "lucide-react";
import type { CanvasMode } from "@/types/state-machine";

export function CanvasToolbar() {
  const canvasMode = useStateMachineStore((s) => s.canvasMode);
  const selectedId = useStateMachineStore((s) => s.selectedId);
  const setCanvasMode = useStateMachineStore((s) => s.setCanvasMode);
  const deleteSelected = useStateMachineStore((s) => s.deleteSelected);
  const getActiveProject = useStateMachineStore((s) => s.getActiveProject);
  const setInitialState = useStateMachineStore((s) => s.setInitialState);
  const toggleFinalState = useStateMachineStore((s) => s.toggleFinalState);

  const project = getActiveProject();
  const selectedState = selectedId
    ? project.states.find((s) => s.id === selectedId)
    : null;
  const selectedTransition = selectedId
    ? project.transitions.find((t) => t.id === selectedId)
    : null;

  const tools: { mode: CanvasMode; icon: React.ReactNode; label: string }[] = [
    {
      mode: "select",
      icon: <MousePointerIcon className="size-4" />,
      label: "Select",
    },
    {
      mode: "add-state",
      icon: <PlusCircleIcon className="size-4" />,
      label: "Add State",
    },
    {
      mode: "add-transition",
      icon: <ArrowRightIcon className="size-4" />,
      label: "Add Transition",
    },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Mode tools */}
      {tools.map((tool) => (
        <Button
          key={tool.mode}
          variant={canvasMode === tool.mode ? "secondary" : "outline"}
          size="sm"
          onClick={() => setCanvasMode(tool.mode)}
        >
          {tool.icon}
          <span className="hidden sm:inline">{tool.label}</span>
        </Button>
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      {/* Context actions for selected state */}
      {selectedState && (
        <>
          {!selectedState.isInitial && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInitialState(selectedState.id)}
            >
              <UndoIcon className="size-4" />
              <span className="hidden sm:inline">Set Initial</span>
            </Button>
          )}
          <Button
            variant={selectedState.isFinal ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleFinalState(selectedState.id)}
          >
            {selectedState.isFinal ? "Unset Final" : "Set Final"}
          </Button>
        </>
      )}

      {/* Delete */}
      {(selectedState || selectedTransition) && (
        <Button variant="destructive" size="sm" onClick={deleteSelected}>
          <Trash2Icon className="size-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      )}
    </div>
  );
}

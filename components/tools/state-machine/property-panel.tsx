"use client";

import { useStateMachineStore } from "@/stores/state-machine-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PropertyPanel() {
  const selectedId = useStateMachineStore((s) => s.selectedId);
  const getActiveProject = useStateMachineStore((s) => s.getActiveProject);
  const updateState = useStateMachineStore((s) => s.updateState);
  const updateTransition = useStateMachineStore((s) => s.updateTransition);
  const setInitialState = useStateMachineStore((s) => s.setInitialState);
  const toggleFinalState = useStateMachineStore((s) => s.toggleFinalState);

  const project = getActiveProject();

  if (!selectedId) {
    return (
      <div className="text-sm text-muted-foreground p-3">
        Select a state or transition to edit its properties.
      </div>
    );
  }

  const selectedState = project.states.find((s) => s.id === selectedId);
  const selectedTransition = project.transitions.find(
    (t) => t.id === selectedId
  );

  if (selectedState) {
    return (
      <div className="flex flex-col gap-3 p-3">
        <h3 className="text-sm font-medium">State Properties</h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Name</label>
          <Input
            value={selectedState.name}
            onChange={(e) =>
              updateState(selectedState.id, {
                name: (e.target as HTMLInputElement).value,
              })
            }
            className="font-mono text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Position</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              X:
              <span className="font-mono">{selectedState.x}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              Y:
              <span className="font-mono">{selectedState.y}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Flags</label>
          <div className="flex gap-2">
            <Button
              variant={selectedState.isInitial ? "default" : "outline"}
              size="xs"
              onClick={() => setInitialState(selectedState.id)}
              disabled={selectedState.isInitial}
            >
              Initial
            </Button>
            <Button
              variant={selectedState.isFinal ? "default" : "outline"}
              size="xs"
              onClick={() => toggleFinalState(selectedState.id)}
            >
              Final
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTransition) {
    const fromState = project.states.find(
      (s) => s.id === selectedTransition.from
    );
    const toState = project.states.find(
      (s) => s.id === selectedTransition.to
    );

    return (
      <div className="flex flex-col gap-3 p-3">
        <h3 className="text-sm font-medium">Transition Properties</h3>

        <div className="text-xs text-muted-foreground">
          {fromState?.name ?? "?"} &rarr; {toState?.name ?? "?"}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Event</label>
          <Input
            value={selectedTransition.event}
            onChange={(e) =>
              updateTransition(selectedTransition.id, {
                event: (e.target as HTMLInputElement).value,
              })
            }
            placeholder="e.g. BTN_PRESS"
            className="font-mono text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">Action</label>
          <Input
            value={selectedTransition.action}
            onChange={(e) =>
              updateTransition(selectedTransition.id, {
                action: (e.target as HTMLInputElement).value,
              })
            }
            placeholder="e.g. start_motor"
            className="font-mono text-sm"
          />
        </div>
      </div>
    );
  }

  return null;
}

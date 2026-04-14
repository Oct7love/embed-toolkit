"use client";

import { useEffect, useCallback } from "react";
import { useStateMachineStore } from "@/stores/state-machine-store";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StateMachineCanvas } from "./canvas";
import { CanvasToolbar } from "./toolbar";
import { PropertyPanel } from "./property-panel";
import { ProjectSelector } from "./project-selector";
import { CodePanel } from "./code-panel";

export function StateMachineEditor() {
  const deleteSelected = useStateMachineStore((s) => s.deleteSelected);
  const selectedId = useStateMachineStore((s) => s.selectedId);
  const setCanvasMode = useStateMachineStore((s) => s.setCanvasMode);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Delete/Backspace to delete selected element
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        deleteSelected();
      }

      // Escape to return to select mode
      if (e.key === "Escape") {
        setCanvasMode("select");
      }
    },
    [deleteSelected, selectedId, setCanvasMode]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>State Machine Editor</CardTitle>
              <CardDescription>
                Drag-and-drop state diagram editor with C code generation
              </CardDescription>
            </div>
            <ProjectSelector />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Left: Canvas area */}
        <div className="flex flex-col gap-2">
          <CanvasToolbar />
          <StateMachineCanvas />
        </div>

        {/* Right: Sidebar with tabs */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Tabs defaultValue="properties">
            <TabsList className="w-full rounded-none border-b border-border">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="p-0">
              <PropertyPanel />
            </TabsContent>
            <TabsContent value="code" className="p-3">
              <CodePanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

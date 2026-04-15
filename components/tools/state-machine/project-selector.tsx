"use client";

import { useState } from "react";
import { useStateMachineStore } from "@/stores/state-machine-store";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusIcon, Trash2Icon, PencilIcon } from "lucide-react";

export function ProjectSelector() {
  const projects = useStateMachineStore((s) => s.projects);
  const activeProjectId = useStateMachineStore((s) => s.activeProjectId);
  const setActiveProjectId = useStateMachineStore((s) => s.setActiveProjectId);
  const createProject = useStateMachineStore((s) => s.createProject);
  const deleteProject = useStateMachineStore((s) => s.deleteProject);
  const renameProject = useStateMachineStore((s) => s.renameProject);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newName, setNewName] = useState("");

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleCreate = () => {
    const name = newName.trim() || "Untitled";
    createProject(name);
    setNewName("");
    setShowNewDialog(false);
  };

  const handleRename = () => {
    const name = newName.trim();
    if (name) {
      renameProject(name);
    }
    setNewName("");
    setShowRenameDialog(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={activeProjectId}
        onValueChange={(val) => {
          if (val) setActiveProjectId(val);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => {
          setNewName("");
          setShowNewDialog(true);
        }}
        aria-label="新建状态机项目"
      >
        <PlusIcon className="size-4" />
      </Button>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => {
          setNewName(activeProject?.name ?? "");
          setShowRenameDialog(true);
        }}
        aria-label="重命名当前项目"
      >
        <PencilIcon className="size-3.5" />
      </Button>

      {projects.length > 1 && (
        <Button
          variant="destructive"
          size="icon-sm"
          onClick={() => deleteProject(activeProjectId)}
          aria-label="删除当前项目"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      )}

      {/* New project dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName((e.target as HTMLInputElement).value)}
            placeholder="Project name"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={newName}
            onChange={(e) => setNewName((e.target as HTMLInputElement).value)}
            placeholder="New name"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
          />
          <DialogFooter>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

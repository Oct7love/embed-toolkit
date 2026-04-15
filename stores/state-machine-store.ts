import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StateMachineProject,
  StateMachineState,
  StateTransition,
  CanvasMode,
} from "@/types/state-machine";
import { isRecord, makeSafeMerge } from "./_schema-guards";

function isValidProject(v: unknown): v is StateMachineProject {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    Array.isArray(v.states) &&
    Array.isArray(v.transitions)
  );
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createDefaultProject(): StateMachineProject {
  const idleId = generateId();
  return {
    id: "default",
    name: "Untitled",
    states: [
      {
        id: idleId,
        name: "IDLE",
        x: 200,
        y: 200,
        isInitial: true,
        isFinal: false,
      },
    ],
    transitions: [],
    createdAt: Date.now(),
  };
}

interface StateMachineStoreState {
  /** All saved projects */
  projects: StateMachineProject[];
  /** Currently active project ID */
  activeProjectId: string;
  /** Canvas interaction mode */
  canvasMode: CanvasMode;
  /** Currently selected element ID (state or transition) */
  selectedId: string | null;
  /** ID of state being used as transition source (during add-transition mode) */
  transitionSourceId: string | null;

  // ---- Project CRUD ----
  /** Get the active project */
  getActiveProject: () => StateMachineProject;
  /** Create a new project and switch to it */
  createProject: (name: string) => void;
  /** Delete a project */
  deleteProject: (id: string) => void;
  /** Set active project */
  setActiveProjectId: (id: string) => void;
  /** Rename the active project */
  renameProject: (name: string) => void;

  // ---- Canvas mode ----
  setCanvasMode: (mode: CanvasMode) => void;
  setSelectedId: (id: string | null) => void;
  setTransitionSourceId: (id: string | null) => void;

  // ---- State nodes ----
  addState: (x: number, y: number) => void;
  updateState: (id: string, patch: Partial<Omit<StateMachineState, "id">>) => void;
  moveState: (id: string, x: number, y: number) => void;
  deleteState: (id: string) => void;
  setInitialState: (id: string) => void;
  toggleFinalState: (id: string) => void;

  // ---- Transitions ----
  addTransition: (from: string, to: string) => void;
  updateTransition: (
    id: string,
    patch: Partial<Omit<StateTransition, "id" | "from" | "to">>
  ) => void;
  deleteTransition: (id: string) => void;

  // ---- Delete selected ----
  deleteSelected: () => void;
}

export const useStateMachineStore = create<StateMachineStoreState>()(
  persist(
    (set, get) => {
      /** Utility: update the active project inside the projects array */
      function updateActiveProject(
        updater: (project: StateMachineProject) => StateMachineProject
      ) {
        const { projects, activeProjectId } = get();
        set({
          projects: projects.map((p) =>
            p.id === activeProjectId ? updater(p) : p
          ),
        });
      }

      return {
        projects: [createDefaultProject()],
        activeProjectId: "default",
        canvasMode: "select",
        selectedId: null,
        transitionSourceId: null,

        getActiveProject: () => {
          const { projects, activeProjectId } = get();
          return (
            projects.find((p) => p.id === activeProjectId) ?? projects[0]
          );
        },

        createProject: (name) => {
          const newProject: StateMachineProject = {
            id: generateId(),
            name,
            states: [],
            transitions: [],
            createdAt: Date.now(),
          };
          set((s) => ({
            projects: [...s.projects, newProject],
            activeProjectId: newProject.id,
            selectedId: null,
          }));
        },

        deleteProject: (id) => {
          const { projects, activeProjectId } = get();
          let filtered = projects.filter((p) => p.id !== id);
          if (filtered.length === 0) {
            filtered = [createDefaultProject()];
          }
          set({
            projects: filtered,
            activeProjectId:
              activeProjectId === id ? filtered[0].id : activeProjectId,
            selectedId: null,
          });
        },

        setActiveProjectId: (id) =>
          set({ activeProjectId: id, selectedId: null }),

        renameProject: (name) => {
          updateActiveProject((p) => ({ ...p, name }));
        },

        setCanvasMode: (mode) =>
          set({ canvasMode: mode, transitionSourceId: null }),
        setSelectedId: (id) => set({ selectedId: id }),
        setTransitionSourceId: (id) => set({ transitionSourceId: id }),

        addState: (x, y) => {
          const project = get().getActiveProject();
          const existingCount = project.states.length;
          const newState: StateMachineState = {
            id: generateId(),
            name: `S${existingCount}`,
            x,
            y,
            isInitial: existingCount === 0,
            isFinal: false,
          };
          updateActiveProject((p) => ({
            ...p,
            states: [...p.states, newState],
          }));
          set({ selectedId: newState.id, canvasMode: "select" });
        },

        updateState: (id, patch) => {
          updateActiveProject((p) => ({
            ...p,
            states: p.states.map((s) =>
              s.id === id ? { ...s, ...patch } : s
            ),
          }));
        },

        moveState: (id, x, y) => {
          updateActiveProject((p) => ({
            ...p,
            states: p.states.map((s) =>
              s.id === id ? { ...s, x, y } : s
            ),
          }));
        },

        deleteState: (id) => {
          updateActiveProject((p) => ({
            ...p,
            states: p.states.filter((s) => s.id !== id),
            transitions: p.transitions.filter(
              (t) => t.from !== id && t.to !== id
            ),
          }));
          set({ selectedId: null });
        },

        setInitialState: (id) => {
          updateActiveProject((p) => ({
            ...p,
            states: p.states.map((s) => ({
              ...s,
              isInitial: s.id === id,
            })),
          }));
        },

        toggleFinalState: (id) => {
          updateActiveProject((p) => ({
            ...p,
            states: p.states.map((s) =>
              s.id === id ? { ...s, isFinal: !s.isFinal } : s
            ),
          }));
        },

        addTransition: (from, to) => {
          const newTransition: StateTransition = {
            id: generateId(),
            from,
            to,
            event: "",
            action: "",
          };
          updateActiveProject((p) => ({
            ...p,
            transitions: [...p.transitions, newTransition],
          }));
          set({
            selectedId: newTransition.id,
            canvasMode: "select",
            transitionSourceId: null,
          });
        },

        updateTransition: (id, patch) => {
          updateActiveProject((p) => ({
            ...p,
            transitions: p.transitions.map((t) =>
              t.id === id ? { ...t, ...patch } : t
            ),
          }));
        },

        deleteTransition: (id) => {
          updateActiveProject((p) => ({
            ...p,
            transitions: p.transitions.filter((t) => t.id !== id),
          }));
          set({ selectedId: null });
        },

        deleteSelected: () => {
          const { selectedId } = get();
          if (!selectedId) return;
          const project = get().getActiveProject();
          const isState = project.states.some((s) => s.id === selectedId);
          if (isState) {
            get().deleteState(selectedId);
          } else {
            get().deleteTransition(selectedId);
          }
        },
      };
    },
    {
      name: "embed-toolkit-state-machine",
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
      merge: makeSafeMerge<StateMachineStoreState>((p) => {
        if (!isRecord(p)) return null;
        if (!Array.isArray(p.projects)) return null;
        const projects = p.projects.filter(isValidProject);
        if (projects.length === 0) return null;
        const activeProjectId =
          typeof p.activeProjectId === "string" &&
          projects.some((pr) => pr.id === p.activeProjectId)
            ? p.activeProjectId
            : projects[0].id;
        return { projects, activeProjectId };
      }),
    }
  )
);

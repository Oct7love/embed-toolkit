"use client";

import { useCallback, useRef, useState } from "react";
import { useStateMachineStore } from "@/stores/state-machine-store";
import {
  STATE_NODE_WIDTH,
  STATE_NODE_HEIGHT,
  STATE_NODE_RADIUS,
} from "@/types/state-machine";
import type { StateMachineState, StateTransition } from "@/types/state-machine";

// ---- Geometry helpers ----

/** Find the intersection point of a line from center of a rounded-rect to an external point */
function rectEdgePoint(
  cx: number,
  cy: number,
  w: number,
  h: number,
  tx: number,
  ty: number
): { x: number; y: number } {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const hw = w / 2;
  const hh = h / 2;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let scale: number;
  if (absDx * hh > absDy * hw) {
    scale = hw / absDx;
  } else {
    scale = hh / absDy;
  }

  return { x: cx + dx * scale, y: cy + dy * scale };
}

/** Compute a quadratic bezier control point for a transition curve */
function computeControlPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  offset: number
): { cx: number; cy: number } {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Normal vector perpendicular to the line
  const nx = -dy / len;
  const ny = dx / len;
  return { cx: mx + nx * offset, cy: my + ny * offset };
}

/** Point on a quadratic bezier at t */
function quadBezierPoint(
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  t: number
) {
  const mt = 1 - t;
  return {
    x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
    y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
  };
}

// ---- Sub-components ----

function StateNode({
  state,
  isSelected,
  onMouseDown,
  onDoubleClick,
  onTransitionClick,
}: {
  state: StateMachineState;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onTransitionClick: (e: React.MouseEvent) => void;
}) {
  const x = state.x - STATE_NODE_WIDTH / 2;
  const y = state.y - STATE_NODE_HEIGHT / 2;

  let strokeColor = "var(--color-border)";
  const fillColor = "var(--color-card)";
  let strokeWidth = 1.5;

  if (isSelected) {
    strokeColor = "var(--color-ring)";
    strokeWidth = 2.5;
  } else if (state.isInitial) {
    strokeColor = "#3b82f6";
  } else if (state.isFinal) {
    strokeColor = "#ef4444";
  }

  return (
    <g
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      className="cursor-pointer"
    >
      {/* Initial state indicator arrow */}
      {state.isInitial && (
        <path
          d={`M ${x - 30} ${state.y} L ${x - 4} ${state.y}`}
          stroke="#3b82f6"
          strokeWidth={2}
          fill="none"
          markerEnd="url(#arrow-blue)"
        />
      )}

      {/* Main rectangle */}
      <rect
        x={x}
        y={y}
        width={STATE_NODE_WIDTH}
        height={STATE_NODE_HEIGHT}
        rx={STATE_NODE_RADIUS}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Final state double border */}
      {state.isFinal && (
        <rect
          x={x + 4}
          y={y + 4}
          width={STATE_NODE_WIDTH - 8}
          height={STATE_NODE_HEIGHT - 8}
          rx={STATE_NODE_RADIUS - 2}
          fill="none"
          stroke="#ef4444"
          strokeWidth={1}
        />
      )}

      {/* State name */}
      <text
        x={state.x}
        y={state.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="select-none fill-foreground text-xs font-mono font-medium pointer-events-none"
      >
        {state.name || "(unnamed)"}
      </text>

      {/* Transition mode: click target indicator */}
      <circle
        cx={state.x + STATE_NODE_WIDTH / 2 - 2}
        cy={state.y}
        r={6}
        className="fill-primary/20 stroke-primary/50 opacity-0 hover:opacity-100 transition-opacity"
        strokeWidth={1.5}
        onClick={onTransitionClick}
      />
    </g>
  );
}

function TransitionLine({
  transition,
  fromState,
  toState,
  isSelected,
  curveOffset,
  onClick,
  onDoubleClick,
}: {
  transition: StateTransition;
  fromState: StateMachineState;
  toState: StateMachineState;
  isSelected: boolean;
  curveOffset: number;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}) {
  const isSelfLoop = transition.from === transition.to;
  const strokeColor = isSelected ? "var(--color-ring)" : "var(--color-foreground)";
  const strokeWidth = isSelected ? 2.5 : 1.5;
  const markerEnd = isSelected ? "url(#arrow-selected)" : "url(#arrow-default)";

  if (isSelfLoop) {
    // Self-loop: draw a loop above the node
    const cx = fromState.x;
    const cy = fromState.y - STATE_NODE_HEIGHT / 2;
    const loopR = 25;

    const label = [transition.event, transition.action]
      .filter(Boolean)
      .join(" / ");

    return (
      <g onClick={onClick} onDoubleClick={onDoubleClick} className="cursor-pointer">
        {/* Invisible wider hitbox */}
        <path
          d={`M ${cx - 12} ${cy} A ${loopR} ${loopR} 0 1 1 ${cx + 12} ${cy}`}
          fill="none"
          stroke="transparent"
          strokeWidth={12}
        />
        <path
          d={`M ${cx - 12} ${cy} A ${loopR} ${loopR} 0 1 1 ${cx + 12} ${cy}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          markerEnd={markerEnd}
          strokeOpacity={0.7}
        />
        {label && (
          <text
            x={cx}
            y={cy - loopR - 12}
            textAnchor="middle"
            className="select-none fill-foreground text-[10px] font-mono pointer-events-none"
          >
            {label}
          </text>
        )}
      </g>
    );
  }

  // Normal transition with quadratic bezier
  const hw = STATE_NODE_WIDTH / 2;
  const hh = STATE_NODE_HEIGHT / 2;

  const { cx: ctrlX, cy: ctrlY } = computeControlPoint(
    fromState.x,
    fromState.y,
    toState.x,
    toState.y,
    curveOffset
  );

  // Compute edge intersection points
  const fromEdge = rectEdgePoint(
    fromState.x,
    fromState.y,
    hw * 2,
    hh * 2,
    ctrlX,
    ctrlY
  );
  const toEdge = rectEdgePoint(
    toState.x,
    toState.y,
    hw * 2,
    hh * 2,
    ctrlX,
    ctrlY
  );

  const pathD = `M ${fromEdge.x} ${fromEdge.y} Q ${ctrlX} ${ctrlY} ${toEdge.x} ${toEdge.y}`;

  // Label position at midpoint of curve
  const labelPt = quadBezierPoint(
    fromEdge.x,
    fromEdge.y,
    ctrlX,
    ctrlY,
    toEdge.x,
    toEdge.y,
    0.5
  );

  const label = [transition.event, transition.action]
    .filter(Boolean)
    .join(" / ");

  return (
    <g onClick={onClick} onDoubleClick={onDoubleClick} className="cursor-pointer">
      {/* Invisible wider hitbox for easier clicking */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={12} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={markerEnd}
        strokeOpacity={0.7}
      />
      {label && (
        <>
          <rect
            x={labelPt.x - label.length * 3.2 - 4}
            y={labelPt.y - 10}
            width={label.length * 6.4 + 8}
            height={16}
            rx={3}
            className="fill-card stroke-border"
            strokeWidth={0.5}
          />
          <text
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="select-none fill-foreground text-[10px] font-mono pointer-events-none"
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

function PendingTransitionLine({
  canvasMode,
  transitionSourceId,
  pendingLineEnd,
  states,
}: {
  canvasMode: string;
  transitionSourceId: string | null;
  pendingLineEnd: { x: number; y: number } | null;
  states: StateMachineState[];
}) {
  if (canvasMode !== "add-transition" || !transitionSourceId || !pendingLineEnd)
    return null;
  const src = states.find((s) => s.id === transitionSourceId);
  if (!src) return null;
  return (
    <line
      x1={src.x}
      y1={src.y}
      x2={pendingLineEnd.x}
      y2={pendingLineEnd.y}
      stroke="var(--color-ring)"
      strokeWidth={1.5}
      strokeDasharray="6 3"
      pointerEvents="none"
    />
  );
}

// ---- Main Canvas ----

export function StateMachineCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingTransId, setEditingTransId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEvent, setEditEvent] = useState("");
  const [editAction, setEditAction] = useState("");
  const [dragInfo, setDragInfo] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  // 拖拽期间的临时位置覆盖（避免每次 mousemove 都写 persisted store）
  const [dragOverride, setDragOverride] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [pendingLineEnd, setPendingLineEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const canvasMode = useStateMachineStore((s) => s.canvasMode);
  const selectedId = useStateMachineStore((s) => s.selectedId);
  const transitionSourceId = useStateMachineStore((s) => s.transitionSourceId);
  const setSelectedId = useStateMachineStore((s) => s.setSelectedId);
  const setTransitionSourceId = useStateMachineStore(
    (s) => s.setTransitionSourceId
  );
  const setCanvasMode = useStateMachineStore((s) => s.setCanvasMode);
  const addState = useStateMachineStore((s) => s.addState);
  const moveState = useStateMachineStore((s) => s.moveState);
  const updateState = useStateMachineStore((s) => s.updateState);
  const addTransition = useStateMachineStore((s) => s.addTransition);
  const updateTransition = useStateMachineStore((s) => s.updateTransition);
  const getActiveProject = useStateMachineStore((s) => s.getActiveProject);

  const project = getActiveProject();
  const rawStates = project.states;
  const transitions = project.transitions;

  // 拖拽期间覆盖目标节点的位置（来自本地临时 state，不走持久化）
  const states = dragOverride
    ? rawStates.map((s) =>
        s.id === dragOverride.id ? { ...s, x: dragOverride.x, y: dragOverride.y } : s
      )
    : rawStates;

  // Build a map of curve offsets for transitions between same pair of states
  const pairOffsets = new Map<string, number>();
  const pairCounts = new Map<string, number>();
  for (const t of transitions) {
    const key = [t.from, t.to].sort().join("|");
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
  }
  const pairIndices = new Map<string, number>();
  for (const t of transitions) {
    const key = [t.from, t.to].sort().join("|");
    const count = pairCounts.get(key) ?? 1;
    const idx = pairIndices.get(key) ?? 0;
    pairIndices.set(key, idx + 1);
    if (count <= 1) {
      pairOffsets.set(t.id, 0);
    } else {
      const spread = 30;
      pairOffsets.set(t.id, (idx - (count - 1) / 2) * spread);
    }
  }

  const getSvgPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: clientX, y: clientY };
      const rect = svgRef.current.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    []
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Only handle clicks on the SVG background (the svg itself or the grid rect)
      const target = e.target as Element;
      const isBackground =
        target === svgRef.current ||
        target.getAttribute("data-canvas-bg") === "true";
      if (!isBackground) return;

      const pt = getSvgPoint(e.clientX, e.clientY);

      if (canvasMode === "add-state") {
        addState(pt.x, pt.y);
        return;
      }

      // Click on empty area => deselect
      setSelectedId(null);
      setTransitionSourceId(null);
    },
    [canvasMode, addState, getSvgPoint, setSelectedId, setTransitionSourceId]
  );

  const handleNodeMouseDown = useCallback(
    (stateId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      if (canvasMode === "add-transition") {
        if (!transitionSourceId) {
          setTransitionSourceId(stateId);
          setSelectedId(stateId);
        } else {
          addTransition(transitionSourceId, stateId);
        }
        return;
      }

      setSelectedId(stateId);

      const state = states.find((s) => s.id === stateId);
      if (!state) return;

      const pt = getSvgPoint(e.clientX, e.clientY);
      setDragInfo({
        id: stateId,
        offsetX: pt.x - state.x,
        offsetY: pt.y - state.y,
      });
    },
    [
      canvasMode,
      transitionSourceId,
      states,
      getSvgPoint,
      setSelectedId,
      setTransitionSourceId,
      addTransition,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (dragInfo) {
        const pt = getSvgPoint(e.clientX, e.clientY);
        // 拖拽期间只更新本地 override，不写持久化 store
        setDragOverride({
          id: dragInfo.id,
          x: Math.round(pt.x - dragInfo.offsetX),
          y: Math.round(pt.y - dragInfo.offsetY),
        });
      }

      if (canvasMode === "add-transition" && transitionSourceId) {
        const pt = getSvgPoint(e.clientX, e.clientY);
        setPendingLineEnd(pt);
      }
    },
    [dragInfo, canvasMode, transitionSourceId, getSvgPoint]
  );

  const handleMouseUp = useCallback(() => {
    // 释放时一次性提交最终位置到 store（此时触发 localStorage 写入）
    if (dragOverride) {
      moveState(dragOverride.id, dragOverride.x, dragOverride.y);
    }
    setDragInfo(null);
    setDragOverride(null);
  }, [dragOverride, moveState]);

  const handleNodeDoubleClick = useCallback(
    (stateId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const state = states.find((s) => s.id === stateId);
      if (!state) return;
      setEditingNodeId(stateId);
      setEditName(state.name);
    },
    [states]
  );

  const handleTransitionDoubleClick = useCallback(
    (transId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const trans = transitions.find((t) => t.id === transId);
      if (!trans) return;
      setEditingTransId(transId);
      setEditEvent(trans.event);
      setEditAction(trans.action);
    },
    [transitions]
  );

  const commitNodeEdit = useCallback(() => {
    if (editingNodeId) {
      updateState(editingNodeId, { name: editName.trim() });
      setEditingNodeId(null);
    }
  }, [editingNodeId, editName, updateState]);

  const commitTransEdit = useCallback(() => {
    if (editingTransId) {
      updateTransition(editingTransId, {
        event: editEvent.trim(),
        action: editAction.trim(),
      });
      setEditingTransId(null);
    }
  }, [editingTransId, editEvent, editAction, updateTransition]);

  // Find the editing node/trans for positioning the inline editor
  const editingNode = editingNodeId
    ? states.find((s) => s.id === editingNodeId)
    : null;
  const editingTrans = editingTransId
    ? transitions.find((t) => t.id === editingTransId)
    : null;
  const editingTransFromState = editingTrans
    ? states.find((s) => s.id === editingTrans.from)
    : null;
  const editingTransToState = editingTrans
    ? states.find((s) => s.id === editingTrans.to)
    : null;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg border border-border bg-card">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: 500 }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Default arrow marker */}
          <marker
            id="arrow-default"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="10"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 3 L 0 6 z"
              className="fill-foreground"
              fillOpacity={0.7}
            />
          </marker>
          {/* Selected arrow marker */}
          <marker
            id="arrow-selected"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="10"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 3 L 0 6 z" fill="var(--color-ring)" />
          </marker>
          {/* Blue arrow for initial state */}
          <marker
            id="arrow-blue"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="10"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 3 L 0 6 z" fill="#3b82f6" />
          </marker>
          {/* Grid pattern */}
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              className="stroke-border"
              strokeWidth={0.3}
              strokeOpacity={0.5}
            />
          </pattern>
        </defs>

        {/* Grid background - clickable area */}
        <rect width="100%" height="100%" fill="url(#grid)" data-canvas-bg="true" />

        {/* Pending transition line (while in add-transition mode) */}
        <PendingTransitionLine
          canvasMode={canvasMode}
          transitionSourceId={transitionSourceId}
          pendingLineEnd={pendingLineEnd}
          states={states}
        />

        {/* Render transitions first (below nodes) */}
        {transitions.map((t) => {
          const fromState = states.find((s) => s.id === t.from);
          const toState = states.find((s) => s.id === t.to);
          if (!fromState || !toState) return null;

          return (
            <TransitionLine
              key={t.id}
              transition={t}
              fromState={fromState}
              toState={toState}
              isSelected={selectedId === t.id}
              curveOffset={pairOffsets.get(t.id) ?? 0}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(t.id);
              }}
              onDoubleClick={(e) => handleTransitionDoubleClick(t.id, e)}
            />
          );
        })}

        {/* Render state nodes */}
        {states.map((s) => (
          <StateNode
            key={s.id}
            state={s}
            isSelected={selectedId === s.id}
            onMouseDown={(e) => handleNodeMouseDown(s.id, e)}
            onDoubleClick={(e) => handleNodeDoubleClick(s.id, e)}
            onTransitionClick={(e) => {
              e.stopPropagation();
              if (canvasMode !== "add-transition") {
                setCanvasMode("add-transition");
                setTransitionSourceId(s.id);
                setSelectedId(s.id);
              }
            }}
          />
        ))}
      </svg>

      {/* Inline node name editor */}
      {editingNode && (
        <div
          className="absolute z-10"
          style={{
            left: editingNode.x - STATE_NODE_WIDTH / 2,
            top: editingNode.y - STATE_NODE_HEIGHT / 2,
          }}
        >
          <input
            autoFocus
            className="w-[140px] h-[50px] bg-card border border-ring rounded-lg text-center text-xs font-mono font-medium outline-none"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitNodeEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitNodeEdit();
              if (e.key === "Escape") setEditingNodeId(null);
            }}
          />
        </div>
      )}

      {/* Inline transition editor */}
      {editingTrans && editingTransFromState && editingTransToState && (
        <div
          className="absolute z-10 flex flex-col gap-1 bg-card border border-ring rounded-lg p-2 shadow-lg"
          style={{
            left:
              (editingTransFromState.x + editingTransToState.x) / 2 - 80,
            top:
              (editingTransFromState.y + editingTransToState.y) / 2 - 40,
          }}
        >
          <input
            autoFocus
            placeholder="Event"
            className="w-[160px] h-7 bg-transparent border border-input rounded px-2 text-xs font-mono outline-none focus:border-ring"
            value={editEvent}
            onChange={(e) => setEditEvent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTransEdit();
              if (e.key === "Escape") setEditingTransId(null);
            }}
          />
          <input
            placeholder="Action"
            className="w-[160px] h-7 bg-transparent border border-input rounded px-2 text-xs font-mono outline-none focus:border-ring"
            value={editAction}
            onChange={(e) => setEditAction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTransEdit();
              if (e.key === "Escape") setEditingTransId(null);
            }}
            onBlur={commitTransEdit}
          />
        </div>
      )}

      {/* Mode indicator overlay */}
      {canvasMode !== "select" && (
        <div className="absolute top-2 left-2 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-md border border-primary/20">
          {canvasMode === "add-state"
            ? "Click canvas to add state"
            : transitionSourceId
              ? "Click target state"
              : "Click source state"}
        </div>
      )}
    </div>
  );
}

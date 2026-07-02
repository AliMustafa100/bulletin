"use client";

import type { Edge, Node } from "@xyflow/react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Controls,
  Handle,
  MiniMap,
  NodeProps,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PieceData = { label: string };

const handleClass =
  "!min-h-[14px] !min-w-[14px] !border-0 !bg-emerald-400/0 transition-[opacity,background-color] duration-150 hover:!bg-emerald-400/35 group-hover:!bg-emerald-400/25";

function WorkspacePieceNode({ data, selected }: NodeProps) {
  const d = data as PieceData;
  const handleVisibility = selected
    ? "!opacity-100 !bg-emerald-400/35"
    : "!opacity-0 hover:!opacity-100 group-hover:!opacity-90";
  return (
    <div className="group relative flex flex-col items-center">
      <Handle
        type="target"
        position={Position.Top}
        className={`${handleClass} ${handleVisibility}`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${handleClass} ${handleVisibility}`}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={`${handleClass} ${handleVisibility}`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`${handleClass} ${handleVisibility}`}
      />
      <div className="h-2 w-2 rounded-full bg-emerald-400/95 shadow-[0_0_10px_rgba(52,211,153,0.35)]" />
      <span className="mt-1.5 max-w-[120px] truncate text-center text-[10px] font-medium leading-tight text-emerald-100/85">
        {d.label}
      </span>
    </div>
  );
}

const workspaceNodeTypes = {
  piece: WorkspacePieceNode,
};

const wsEdgeDefaults = {
  style: {
    stroke: "rgba(52, 211, 153, 0.5)",
    strokeWidth: 1.5,
    strokeDasharray: "6 4",
  },
  type: "smoothstep" as const,
};

function FitWorkspaceView({ hasNodes }: { hasNodes: boolean }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (!hasNodes) return;
    const id = requestAnimationFrame(() => {
      fitView({ padding: 0.22, duration: 240 });
    });
    return () => cancelAnimationFrame(id);
  }, [hasNodes, fitView]);
  return null;
}

function WorkspaceToolbar({
  setNodes,
}: {
  setNodes: Dispatch<SetStateAction<Node[]>>;
}) {
  const { screenToFlowPosition } = useReactFlow();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const addPiece = useCallback(
    (label: string) => {
      const trimmed = label.trim() || "Untitled";
      const id = `piece-${crypto.randomUUID()}`;
      const pane = document.querySelector(
        ".idea-workspace-flow .react-flow__pane",
      ) as HTMLElement | null;
      const r = pane?.getBoundingClientRect();
      const cx = r ? r.left + r.width / 2 : window.innerWidth / 2;
      const cy = r ? r.top + r.height / 2 : window.innerHeight / 2;
      const position = screenToFlowPosition({ x: cx, y: cy });
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: "piece",
          position,
          data: { label: trimmed },
        },
      ]);
    },
    [screenToFlowPosition, setNodes],
  );

  const dialog =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div className="pointer-events-none fixed inset-0 z-[300]">
        <button
          type="button"
          className="pointer-events-auto absolute inset-0 bg-black/65 backdrop-blur-[2px]"
          aria-label="Close"
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="piece-name-title"
          className="pointer-events-auto fixed left-1/2 top-1/2 z-10 w-[min(100%-2rem,24rem)] max-h-[min(90dvh,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-white/12 bg-[#0c0c0c] p-5 shadow-2xl"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <h2
            id="piece-name-title"
            className="text-sm font-semibold text-white"
          >
            Name this piece
          </h2>
          <p className="mt-1 text-xs text-white/55">
            A step, project, or sub-idea inside this workspace.
          </p>
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              addPiece(draft);
              setDraft("");
              setOpen(false);
            }}
          >
            <Input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Wireframes"
              autoComplete="off"
              className="border-white/15 bg-black/40 text-white placeholder:text-white/35"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold">
                Add
              </Button>
            </div>
          </form>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      {dialog}
      <Panel
        position="top-left"
        className="!left-0 !right-0 !z-[40] !m-0 !w-auto !max-w-none !translate-x-0 !transform-none !rounded-none border-b border-white/10 bg-[#080808]/95 px-4 py-3 backdrop-blur-md sm:px-5"
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="max-w-xl text-xs leading-relaxed text-white/65 sm:text-sm">
            <span className="text-white/90">This workspace is empty</span> until
            you add pieces. Link them the same way as on the map—emerald dots &
            dashed lines.
          </p>
          <button
            type="button"
            onClick={() => {
              setDraft("");
              setOpen(true);
            }}
            className="shrink-0 rounded-lg border border-emerald-500/45 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-100 shadow-[0_0_18px_rgba(52,211,153,0.12)] transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/25"
          >
            New piece
          </button>
        </div>
      </Panel>
    </>
  );
}

export type WorkspaceGraph = { nodes: Node[]; edges: Edge[] };

type IdeaWorkspaceProps = {
  ideaTitle: string;
  onBack: () => void;
  initial: WorkspaceGraph;
  onPersist: (g: WorkspaceGraph) => void;
};

export function IdeaWorkspace({
  ideaTitle,
  onBack,
  initial,
  onPersist,
}: IdeaWorkspaceProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  useEffect(() => {
    persistRef.current({ nodes, edges });
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const dup = eds.some(
          (e) =>
            (e.source === params.source && e.target === params.target) ||
            (e.source === params.target && e.target === params.source),
        );
        if (dup) return eds;
        return addEdge(
          {
            ...params,
            style: wsEdgeDefaults.style,
            type: wsEdgeDefaults.type,
          },
          eds,
        );
      });
    },
    [setEdges],
  );

  const miniMapStyle = useMemo(
    () => ({
      backgroundColor: "rgba(8,8,8,0.92)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
    }),
    [],
  );

  const hasNodes = nodes.length > 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#080808]/95 px-4 py-3 backdrop-blur-md sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
            Workspace
          </p>
          <h2 className="truncate text-base font-semibold text-white">
            {ideaTitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg border border-white/20 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white transition-colors hover:border-white/35 hover:bg-white/10"
        >
          ← Map
        </button>
      </div>
      <div className="relative flex min-h-[min(60dvh,48rem)] min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#070707]/90">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={workspaceNodeTypes}
          connectionMode={ConnectionMode.Loose}
          minZoom={0.35}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={wsEdgeDefaults}
          className="idea-workspace-flow !bg-transparent h-full w-full min-h-0 flex-1"
          nodesDraggable
          nodesConnectable
          elementsSelectable
          connectionLineStyle={{
            ...wsEdgeDefaults.style,
            strokeDasharray: undefined,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="rgba(255,255,255,0.045)"
          />
          <Controls
            className="!overflow-hidden !rounded-lg !border !border-white/12 !bg-[#0c0c0c]/95 !shadow-lg [&_button]:!border-white/10 [&_button]:!bg-neutral-900 [&_button]:!fill-white [&_button:hover]:!bg-neutral-800"
            showInteractive={false}
          />
          <MiniMap
            pannable
            zoomable
            style={miniMapStyle}
            maskColor="rgba(0,0,0,0.78)"
            nodeColor={() => "rgba(52,211,153,0.85)"}
          />
          <FitWorkspaceView hasNodes={hasNodes} />
          <WorkspaceToolbar setNodes={setNodes} />
        </ReactFlow>
      </div>
    </div>
  );
}

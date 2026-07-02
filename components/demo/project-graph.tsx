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
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  IdeaWorkspace,
  type WorkspaceGraph,
} from "@/components/demo/idea-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type IdeaData = { label: string };

const handleClass =
  "!min-h-[14px] !min-w-[14px] !border-0 !bg-sky-400/0 transition-[opacity,background-color] duration-150 hover:!bg-sky-400/35 group-hover:!bg-sky-400/25";

function IdeaNode({ data, selected }: NodeProps) {
  const d = data as IdeaData;
  const handleVisibility = selected
    ? "!opacity-100 !bg-sky-400/35"
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
      <div className="h-2 w-2 rounded-full bg-sky-400/95 shadow-[0_0_10px_rgba(56,189,248,0.4)]" />
      <span className="mt-1.5 max-w-[120px] truncate text-center text-[10px] font-medium leading-tight text-white/75">
        {d.label}
      </span>
    </div>
  );
}

const nodeTypes = {
  idea: IdeaNode,
};

const defaultEdgeOptions = {
  style: {
    stroke: "rgba(56, 189, 248, 0.55)",
    strokeWidth: 1.5,
    strokeDasharray: "6 4",
  },
  type: "smoothstep" as const,
};

function FitViewOnReady({ hasNodes }: { hasNodes: boolean }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    if (!hasNodes) return;
    const id = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 280 });
    });
    return () => cancelAnimationFrame(id);
  }, [hasNodes, fitView]);
  return null;
}

function DemoGraphToolbar({
  setNodes,
}: {
  setNodes: Dispatch<SetStateAction<Node[]>>;
}) {
  const { screenToFlowPosition } = useReactFlow();
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!nameDialogOpen) return;
    const t = requestAnimationFrame(() => nameInputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [nameDialogOpen]);

  useEffect(() => {
    if (!nameDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNameDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nameDialogOpen]);

  const addIdeaAtCenter = useCallback(
    (label: string) => {
      const trimmed = label.trim() || "Untitled";
      const id = `idea-${crypto.randomUUID()}`;
      const pane = document.querySelector(
        ".react-flow__pane",
      ) as HTMLElement | null;
      const r = pane?.getBoundingClientRect();
      const cx = r ? r.left + r.width / 2 : window.innerWidth / 2;
      const cy = r ? r.top + r.height / 2 : window.innerHeight / 2;
      const position = screenToFlowPosition({ x: cx, y: cy });
      const ideaNode: Node = {
        id,
        type: "idea",
        position,
        data: { label: trimmed },
      };
      setNodes((nds) => [...nds, ideaNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  const confirmName = useCallback(() => {
    addIdeaAtCenter(nameDraft);
    setNameDraft("");
    setNameDialogOpen(false);
  }, [addIdeaAtCenter, nameDraft]);

  const nameDialog =
    nameDialogOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div className="pointer-events-none fixed inset-0 z-[300]">
        <button
          type="button"
          className="pointer-events-auto absolute inset-0 bg-black/65 backdrop-blur-[2px]"
          aria-label="Close"
          onClick={() => setNameDialogOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="idea-name-title"
          className="pointer-events-auto fixed left-1/2 top-1/2 z-10 w-[min(100%-2rem,24rem)] max-h-[min(90dvh,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-white/12 bg-[#0c0c0c] p-5 shadow-2xl"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <h2
            id="idea-name-title"
            className="text-sm font-semibold text-white"
          >
            Name this idea
          </h2>
          <p className="mt-1 text-xs text-white/55">
            Shown under the dot on the canvas.
          </p>
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              confirmName();
            }}
          >
            <Input
              ref={nameInputRef}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="e.g. Ship search MVP"
              autoComplete="off"
              className="border-white/15 bg-black/40 text-white placeholder:text-white/35"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => setNameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold">
                Add to map
              </Button>
            </div>
          </form>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      {nameDialog}
      <Panel
        position="top-left"
        className="!left-0 !right-0 !z-[40] !m-0 !w-auto !max-w-none !translate-x-0 !transform-none !rounded-none border-b border-white/10 bg-[#080808]/95 px-4 py-3 backdrop-blur-md sm:px-5"
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="max-w-xl text-xs leading-relaxed text-white/65 sm:text-sm">
            <span className="text-white/90">Add ideas</span> with{" "}
            <span className="font-medium text-sky-300/95">New idea</span>.{" "}
            <span className="text-white/90">Click</span> a dot for a preview;{" "}
            <span className="text-white/90">double-click</span> or{" "}
            <span className="text-white/85">Open workspace</span> for a clean
            board inside. <span className="text-white/90">Correlate</span> with
            handles + dashed lines.
          </p>
          <button
            type="button"
            onClick={() => {
              setNameDraft("");
              setNameDialogOpen(true);
            }}
            className="shrink-0 rounded-lg border border-sky-400/50 bg-sky-500/15 px-4 py-2.5 text-sm font-semibold text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.12)] transition-colors hover:border-sky-300/70 hover:bg-sky-500/25"
          >
            New idea
          </button>
        </div>
      </Panel>
    </>
  );
}

function NodePreviewModal({
  node,
  onClose,
  onOpenWorkspace,
}: {
  node: Node;
  onClose: () => void;
  onOpenWorkspace: () => void;
}) {
  const label = (node.data as IdeaData).label ?? "Idea";
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[280]">
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 bg-black/55 backdrop-blur-[1px]"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-preview-title"
        className="pointer-events-auto fixed left-1/2 top-1/2 z-10 w-[min(100%-2rem,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/12 bg-[#0c0c0c] p-5 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
          Preview
        </p>
        <h2
          id="node-preview-title"
          className="mt-1 text-lg font-semibold text-white"
        >
          {label}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Open a dedicated workspace for a clean board—break down projects,
          steps, and sub-ideas separately from the map.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            className="font-semibold"
            onClick={() => {
              onOpenWorkspace();
              onClose();
            }}
          >
            Open workspace
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function MapCanvas({
  onEnterWorkspace,
}: {
  onEnterWorkspace: (id: string, title: string) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const previewNode = useMemo(
    () => (previewNodeId ? nodes.find((n) => n.id === previewNodeId) : null),
    [nodes, previewNodeId],
  );

  const openWorkspaceForId = useCallback(
    (id: string) => {
      const n = nodes.find((x) => x.id === id);
      const title = n ? (n.data as IdeaData).label : "Idea";
      onEnterWorkspace(id, title);
    },
    [nodes, onEnterWorkspace],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        setPreviewNodeId(node.id);
        clickTimerRef.current = null;
      }, 260);
    },
    [],
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      setPreviewNodeId(null);
      openWorkspaceForId(node.id);
    },
    [openWorkspaceForId],
  );

  const onPaneClick = useCallback(() => {
    setPreviewNodeId(null);
  }, []);

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
            style: defaultEdgeOptions.style,
            type: defaultEdgeOptions.type,
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
      <div className="relative flex min-h-[min(68dvh,52rem)] w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#070707]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {previewNode && (
          <NodePreviewModal
            node={previewNode}
            onClose={() => setPreviewNodeId(null)}
            onOpenWorkspace={() => openWorkspaceForId(previewNode.id)}
          />
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          minZoom={0.35}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={defaultEdgeOptions}
          className="!bg-transparent h-full w-full min-h-0 flex-1"
          nodesDraggable
          nodesConnectable
          elementsSelectable
          connectionLineStyle={{
            ...defaultEdgeOptions.style,
            strokeDasharray: undefined,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255,255,255,0.055)"
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
            nodeColor={() => "rgba(56,189,248,0.85)"}
          />
          <FitViewOnReady hasNodes={hasNodes} />
          <DemoGraphToolbar setNodes={setNodes} />
        </ReactFlow>
      </div>
    </div>
  );
}

export function ProjectGraph() {
  const [workspaceNodeId, setWorkspaceNodeId] = useState<string | null>(null);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceGraphs, setWorkspaceGraphs] = useState<
    Record<string, WorkspaceGraph>
  >({});

  const onEnterWorkspace = useCallback((id: string, title: string) => {
    setWorkspaceTitle(title);
    setWorkspaceNodeId(id);
    setWorkspaceGraphs((prev) =>
      prev[id] ? prev : { ...prev, [id]: { nodes: [], edges: [] } },
    );
  }, []);

  const onPersistWorkspace = useCallback((id: string, g: WorkspaceGraph) => {
    setWorkspaceGraphs((prev) => ({ ...prev, [id]: g }));
  }, []);

  const shellClass = "flex h-full min-h-0 w-full flex-1 flex-col";

  if (workspaceNodeId) {
    const initial = workspaceGraphs[workspaceNodeId] ?? {
      nodes: [],
      edges: [],
    };
    return (
      <div className={shellClass}>
        <ReactFlowProvider key={workspaceNodeId}>
          <IdeaWorkspace
            ideaTitle={workspaceTitle}
            onBack={() => setWorkspaceNodeId(null)}
            initial={initial}
            onPersist={(g) => onPersistWorkspace(workspaceNodeId, g)}
          />
        </ReactFlowProvider>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <ReactFlowProvider>
        <MapCanvas onEnterWorkspace={onEnterWorkspace} />
      </ReactFlowProvider>
    </div>
  );
}

import { ProjectGraph } from "@/components/demo/project-graph";

export default function DemoPage() {
  return (
    <div className="demo-flow flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
        <h1 className="text-base font-semibold text-white">Project map</h1>
        <p className="mt-0.5 text-sm text-white/60">
          Build the map with ideas and links. Click a dot for a preview;
          double-click or open its workspace for a separate board to plan
          projects and sub-ideas. Preview only; no sign-in.
        </p>
      </div>
      <div className="flex min-h-[min(72dvh,56rem)] flex-1 flex-col overflow-hidden">
        <ProjectGraph />
      </div>
    </div>
  );
}

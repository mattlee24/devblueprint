"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface UserFlowTabProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onLayoutSave?: (nodes: Node[], edges: Edge[]) => void;
}

const defaultNodes: Node[] = [
  { id: "1", type: "input", position: { x: 0, y: 0 }, data: { label: "[START]" } },
  { id: "2", type: "default", position: { x: 200, y: 0 }, data: { label: "Step" } },
  { id: "3", type: "output", position: { x: 400, y: 0 }, data: { label: "[END]" } },
];
const defaultEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

export function UserFlowTab({
  initialNodes,
  initialEdges,
  onLayoutSave,
}: UserFlowTabProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes?.length ? initialNodes : defaultNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges?.length ? initialEdges : defaultEdges
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, __: Node, nodeList: Node[]) => {
      onLayoutSave?.(nodeList, edges);
    },
    [edges, onLayoutSave]
  );

  return (
    <div className="user-flow-dark h-[500px] border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--bg-surface)] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        fitView
        className="[&_.react-flow__node]:!bg-[var(--bg-elevated)] [&_.react-flow__node]:!border-[var(--border)] [&_.react-flow__node]:!color-[var(--text-primary)] [&_.react-flow__edge-path]:!stroke-[var(--border-active)]"
        style={{ background: "var(--bg-surface)" }}
      >
        <Background color="var(--border)" gap={12} />
        <Controls className="!bg-[var(--bg-elevated)] !border-[var(--border)] [&_button]:!bg-[var(--bg-elevated)] [&_button]:!border-[var(--border)] [&_button]:!fill-[var(--text-primary)]" />
        <MiniMap
          nodeColor="var(--accent-green)"
          maskColor="rgba(0,0,0,0.75)"
          className="!bg-[var(--bg-surface)] !border-[var(--border)]"
        />
      </ReactFlow>
    </div>
  );
}

import React, { useMemo } from "react";
import { ReactFlow, Controls, Background } from '@xyflow/react';
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";

const FlowComponent = ({
  nodes: initialNodes,
  edges: initialEdges,
  connectionLineStyle,
  edgeOptions,
  style,
  fitView = true,
  zoomOnScroll = false,
  zoomOnPinch = false,
  panOnDrag = false,
  panOnScroll = false,
  elementsSelectable = true,
  direction = "TB", 
}) => {
  // Calculer la disposition avec useMemo
  const { nodes, edges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges, direction);
  }, [initialNodes, initialEdges, direction]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView={fitView}
        style={style}
        defaultEdgeOptions={edgeOptions}
        zoomOnScroll={zoomOnScroll}
        zoomOnPinch={zoomOnPinch}
        panOnDrag={panOnDrag}
        panOnScroll={panOnScroll}
        elementsSelectable={elementsSelectable}
        connectionLineStyle={connectionLineStyle}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

// Fonction pour calculer la disposition des nœuds avec Dagre
const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Ajouter les nœuds avec des dimensions fixes
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  // Ajouter les arêtes
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Appliquer la disposition Dagre
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 75, // Centrer horizontalement
        y: nodeWithPosition.y - 25, // Centrer verticalement
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default FlowComponent;

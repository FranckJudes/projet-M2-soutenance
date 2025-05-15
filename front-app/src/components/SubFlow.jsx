import React, { useMemo } from "react";
import  {
    ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";

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
  
  const SubFlow = ({
    initialNodes = [],
    initialEdges = [],
    direction = "TB",
    style = {},
  }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
    // Appliquer la mise en page Dagre
    const layoutedElements = useMemo(() => {
      return getLayoutedElements(nodes, edges, direction);
    }, [nodes, edges, direction]);
  
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <ReactFlow
          nodes={layoutedElements.nodes}
          edges={layoutedElements.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          style={style}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    );
  };
  
  export default SubFlow;
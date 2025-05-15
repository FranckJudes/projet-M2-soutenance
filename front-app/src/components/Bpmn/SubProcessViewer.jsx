import React from "react";
import { ReactFlow, Controls } from "@xyflow/react";

const SubProcessViewer = ({ nodes, edges, handleNestedSubProcessClick }) => (
  <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "4px" }}>
    <ReactFlow 
      nodes={nodes} 
      edges={edges}
      fitView
      onNodeClick={(event, node) => {
        if (node.type === "subProcess") {
          handleNestedSubProcessClick(node.id);
        }
      }}
    >
      <Controls />
    </ReactFlow>
  </div>
);

export default SubProcessViewer;

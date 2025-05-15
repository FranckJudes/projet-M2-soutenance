import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const TaskNode = ({ data }) => {
  return (
    <div className="task-node">
      <Handle type="target" position={Position.Left} />
      <div className="task-content">
        <div className="task-label">{data.label}</div>
        <div className="task-type">{data.type}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
export default memo(TaskNode);
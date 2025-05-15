import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const EventNode = ({ data }) => {
  return (
    <div className="event-node">
      <Handle type="target" position={Position.Left} />
      <div className="event-content">
        <div className="event-label">{data.label}</div>
        <div className="event-type">{data.type}</div>
        <div className="event-trigger">{data.triggerType}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default memo(EventNode);
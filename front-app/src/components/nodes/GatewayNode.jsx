import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const GatewayNode = ({ data }) => {
  return (
    <div className="gateway-node">
      <Handle type="target" position={Position.Left} />
      <div className="gateway-content">
        <div className="gateway-label">{data.label}</div>
        <div className="gateway-type">{data.type}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default memo(GatewayNode);
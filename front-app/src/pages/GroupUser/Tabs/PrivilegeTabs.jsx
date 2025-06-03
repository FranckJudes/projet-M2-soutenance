import React from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

const PrivilegeTabs = () => {
    return (
        <div style={{ padding: "20px 0" }}>
            <Empty 
                description={
                    <Text type="secondary">Aucun privilège configuré</Text>
                } 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        </div>
    );
};

export default PrivilegeTabs;
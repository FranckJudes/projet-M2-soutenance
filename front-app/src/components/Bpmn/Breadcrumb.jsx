import React from "react";

const Breadcrumb = ({ breadcrumb, navigateToBreadcrumbLevel }) => (
  <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", flexWrap: "wrap", fontSize: "14px" }}>
    <span 
      onClick={() => navigateToBreadcrumbLevel(0)}
      style={{ cursor: "pointer", color: "#0066cc" }}
    >
      Diagramme principal
    </span>
    
    {breadcrumb.map((item, index) => (
      <React.Fragment key={item.id}>
        <span style={{ margin: "0 5px" }}> &gt; </span>
        <span 
          onClick={() => navigateToBreadcrumbLevel(index + 1)}
          style={{ 
            cursor: "pointer", 
            color: "#0066cc",
            fontWeight: index === breadcrumb.length - 1 ? "bold" : "normal"
          }}
        >
          {item.name}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export default Breadcrumb;

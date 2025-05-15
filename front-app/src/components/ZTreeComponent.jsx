import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "jstree/dist/themes/default/style.min.css";
import "jstree";

const ZtreeComponent = ({ data, plugins = [], onNodeSelect }) => {
  const treeRef = useRef(null);

  useEffect(() => {
    const formattedData = data.map((node) => ({
      ...node,
      icon: node.type === 1 ? "jstree-file" : "jstree-folder", // Icône dynamique
    }));

    const $tree = $(treeRef.current).jstree({
      core: {
        data: formattedData || [],
      },
      plugins: plugins,
    });

    if (onNodeSelect) {
      $tree.on("select_node.jstree", (e, selected) => {
        onNodeSelect(selected.node); // Appel du gestionnaire d'événements
      });
    }

    return () => {
      $(treeRef.current).jstree("destroy");
    };
  }, [data, plugins, onNodeSelect]);

  return <div ref={treeRef}></div>;
};

export default ZtreeComponent;

/**
 * Manuel d'utilisation
 * <ZtreeComponent
 *   data={[
 *     { id: "1", text: "Élément 1", parent: "#", type: 0 }, // Dossier
 *     { id: "1.1", text: "Élément 1.1", parent: "1", type: 1 }, // Document
 *     { id: "1.2", text: "Élément 1.2", parent: "1", type: 1 }, // Document
 *     { id: "2", text: "Élément 2", parent: "#", type: 0 }, // Dossier
 *     { id: "3", text: "Élément 3", parent: "#", type: 0 }, // Dossier
 *     { id: "3.1", text: "Élément 3.1", parent: "3", type: 1 }, // Document
 *   ]}
 *   plugins={["checkbox"]}
 *   onNodeSelect={(node) => console.log("Nœud sélectionné :", node)}
 * />;
 */

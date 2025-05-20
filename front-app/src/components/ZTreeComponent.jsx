import React, { useEffect, useRef, useCallback } from "react";
import $ from "jquery";
import "jstree/dist/themes/default/style.min.css";
import "jstree";

const ZtreeComponent = ({ data, plugins = [], onNodeSelect, selectedNodes = [] }) => {
  const treeRef = useRef(null);
  const treeInstance = useRef(null);
  const initialized = useRef(false);

  // Fonction pour formater les données une seule fois
  const formatData = useCallback((nodes) => {
    return nodes.map((node) => ({
      ...node,
      icon: node.type === 1 ? "jstree-file" : "jstree-folder",
    }));
  }, []);

  // Initialisation de l'arbre
  const initTree = useCallback(() => {
    if (!treeRef.current || initialized.current) return;

    try {
      $(treeRef.current).jstree({
        core: {
          data: formatData(data),
          check_callback: true,
          themes: {
            responsive: true
          }
        },
        plugins: plugins
      });

      treeInstance.current = $(treeRef.current).jstree(true);
      initialized.current = true;

      // Gestionnaire d'événement pour la sélection
      $(treeRef.current).on("select_node.jstree", (e, selected) => {
        if (onNodeSelect) {
          onNodeSelect(selected.node);
        }
      });

      // Sélection des nœuds initiaux
      if (selectedNodes.length > 0) {
        setTimeout(() => {
          selectedNodes.forEach(nodeId => {
            $(treeRef.current).jstree('select_node', nodeId);
          });
        }, 100);
      }

    } catch (error) {
      console.error("Erreur d'initialisation jsTree:", error);
    }
  }, [data, plugins, onNodeSelect, selectedNodes, formatData]);

  // Mise à jour des données
  const updateTreeData = useCallback(() => {
    if (treeInstance.current && initialized.current) {
      try {
        treeInstance.current.settings.core.data = formatData(data);
        treeInstance.current.refresh();
      } catch (error) {
        console.error("Erreur de mise à jour jsTree:", error);
      }
    }
  }, [data, formatData]);

  useEffect(() => {
    if (!initialized.current) {
      initTree();
    } else {
      updateTreeData();
    }

    // Nettoyage
    return () => {
      if (treeRef.current && initialized.current) {
        try {
          $(treeRef.current).off("select_node.jstree");
          $(treeRef.current).jstree("destroy");
          initialized.current = false;
          treeInstance.current = null;
        } catch (error) {
          console.error("Erreur de nettoyage jsTree:", error);
        }
      }
    };
  }, [initTree, updateTreeData]);

  return <div ref={treeRef} className="jstree-container" />;
};

export default React.memo(ZtreeComponent);
import React, { useEffect, useRef, useState, useCallback } from "react";
import $ from "jquery";
import "jstree/dist/themes/default/style.min.css";
import "jstree";

const JsTree = ({ 
  data, 
  onNodeSelect, 
  initialSelectedNode, 
  plugins = ['types'],
  types = {
    folder: { icon: "bi bi-folder-fill text-warning" },
    file: { icon: "bi bi-file-earmark-text text-primary" }
  }
}) => {
  const treeRef = useRef(null);
  const [treeInstance, setTreeInstance] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const onNodeSelectRef = useRef(onNodeSelect);
  const initializedRef = useRef(false);

  // Garder la référence du callback à jour
  useEffect(() => {
    onNodeSelectRef.current = onNodeSelect;
  }, [onNodeSelect]);

  const formatTreeData = useCallback((nodes) => {
    return nodes.map(node => ({
      id: node.id.toString(),
      text: node.text,
      type: node.type === 0 ? "folder" : "file",
      parent: node.parent === 0 ? "#" : node.parent.toString(),
      state: node.state || {},
      data: {
        original: node
      }
    }));
  }, []);

  // Ajouter les styles personnalisés une seule fois
  useEffect(() => {
    const styleId = 'jstree-custom-styles';
    
    // Vérifier si les styles existent déjà
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .jstree-default .jstree-icon {
          background: transparent !important;
          width: 18px !important;
          height: 18px !important;
          line-height: 18px !important;
          text-align: center !important;
          font-size: 16px !important;
          position: relative;
        }
        
        .jstree-default .jstree-icon.jstree-themeicon {
          background: transparent !important;
        }
        
        /* Icônes pour les dossiers */
        .jstree-default .jstree-folder > .jstree-icon:before,
        .jstree-default .jstree-icon.jstree-folder:before,
        .jstree-default li[data-jstree='{"type":"folder"}'] > .jstree-icon:before {
          content: "📁";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Icônes pour les fichiers */
        .jstree-default .jstree-file > .jstree-icon:before,
        .jstree-default .jstree-icon.jstree-file:before,
        .jstree-default li[data-jstree='{"type":"file"}'] > .jstree-icon:before {
          content: "📄";
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Masquer les icônes par défaut */
        .jstree-default .jstree-icon.jstree-themeicon-custom {
          background: transparent !important;
        }
        
        /* Style alternatif avec classes CSS directes */
        .jstree-icon-folder:before {
          content: "📁" !important;
        }
        
        .jstree-icon-file:before {
          content: "📄" !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []); // Ne s'exécute qu'une seule fois

  // Initialisation du tree - ne se déclenche que lors du premier montage
  useEffect(() => {
    if (!treeRef.current || initializedRef.current) return;

    const $tree = $(treeRef.current);
    
    // Configuration JsTree
    const treeConfig = {
      core: {
        data: formatTreeData(data),
        check_callback: true,
        multiple: false,
        themes: {
          name: "default",
          dots: true,
          icons: true,
          responsive: true
        }
      },
      plugins: plugins,
      types: {
        "#": {
          "max_children": -1,
          "max_depth": -1,
          "valid_children": ["folder", "file"]
        },
        "folder": {
          "icon": "jstree-icon-folder",
          "valid_children": ["folder", "file"]
        },
        "file": {
          "icon": "jstree-icon-file", 
          "valid_children": []
        }
      }
    };

    // Créer l'instance JsTree
    $tree.jstree(treeConfig);

    // Event handlers
    $tree.on("ready.jstree", (e, treeData) => {
      console.log("JsTree is ready");
      setIsReady(true);
      
      // Ouvrir tous les nœuds
      $tree.jstree("open_all");
      
      // Sélectionner le nœud initial si spécifié
      if (initialSelectedNode) {
        setTimeout(() => {
          $tree.jstree("select_node", initialSelectedNode.toString());
        }, 100);
      }
    });

    $tree.on("select_node.jstree", (e, treeData) => {
      const node = treeData.node;
      console.log("Node selected in JsTree:", node);
      
      // Créer un objet node compatible avec l'ancienne structure
      const nodeForCallback = {
        id: node.id,
        text: node.text,
        type: node.type,
        original: node.data ? node.data.original : {
          id: parseInt(node.id),
          text: node.text,
          type: node.type === "file" ? 1 : 0,
          parent: node.parent === "#" ? 0 : parseInt(node.parent)
        }
      };
      
      console.log("Calling onNodeSelect with:", nodeForCallback);
      
      // Utiliser la référence pour éviter les re-renders
      if (onNodeSelectRef.current) {
        onNodeSelectRef.current(nodeForCallback);
      }
    });

    setTreeInstance($tree);
    initializedRef.current = true;

    return () => {
      if ($tree.jstree(true)) {
        $tree.off(".jstree");
        $tree.jstree("destroy");
      }
      setIsReady(false);
      initializedRef.current = false;
    };
  }, []); // Pas de dépendances - ne s'exécute qu'au montage

  // Mise à jour des données du tree quand les données changent
  useEffect(() => {
    if (treeInstance && isReady && initializedRef.current) {
      const $tree = treeInstance;
      
      try {
        // Mettre à jour les données
        $tree.jstree(true).settings.core.data = formatTreeData(data);
        $tree.jstree("refresh");
        
        // Rouvrir tous les nœuds après le refresh
        setTimeout(() => {
          $tree.jstree("open_all");
        }, 100);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des données JsTree:", error);
      }
    }
  }, [data, formatTreeData, treeInstance, isReady]);

  // Mise à jour de la sélection quand initialSelectedNode change
  useEffect(() => {
    if (isReady && treeInstance && initialSelectedNode && initializedRef.current) {
      const $tree = treeInstance;
      
      setTimeout(() => {
        try {
          $tree.jstree("deselect_all");
          $tree.jstree("select_node", initialSelectedNode.toString());
        } catch (error) {
          console.error("Erreur lors de la sélection du nœud:", error);
        }
      }, 50);
    }
  }, [initialSelectedNode, isReady, treeInstance]);

  return (
    <div
      ref={treeRef}
      className="js-tree-wrapper"
      style={{ minHeight: "200px" }}
    />
  );
};

export default React.memo(JsTree);
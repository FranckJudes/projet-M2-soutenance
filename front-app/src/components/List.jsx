import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { ButtonWithIcon } from "./Button";
import { styles } from "../utils/styles";
// import { Toast } from "./Toast"; // Importer le composant Toast
import { deleteProcessBpmn } from "../api/processBpmnApi"; // Importer l'API de suppression

export const ListConfig = ({ items, onUpdateItems }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null); // Élément sélectionné pour la sidebar
    const [data, setData] = useState(items); // État local pour les données
    // const [toastMessage, setToastMessage] = useState(null); // Message pour le Toast
    // const [toastType, setToastType] = useState(null); // Type du Toast (success, error)
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle
    const itemsPerPage = 10 ; // Nombre d'éléments par page

    const containerRef = useRef(null);

    // Fermer la sidebar si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setSelectedItem(null); // Ferme la sidebar
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem((prev) => (prev?.id === item.id ? null : item)); // Basculer l'élément sélectionné
    };

    const handleDelete = async (id, itemIndex) => {
        try {
            // Appel API pour supprimer dans la base de données
            await deleteProcessBpmn(id);

            // Mettre à jour les données après suppression
            const updatedData = data.filter((_, index) => index !== itemIndex);
            setData(updatedData);

            // Appeler la fonction de mise à jour du parent
            onUpdateItems(updatedData);

            // setToastMessage("Élément supprimé avec succès.");
            // setToastType("success");

            // Fermer la sidebar si l'élément sélectionné est supprimé
            if (selectedItem?.id === id) {
                setSelectedItem(null);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);

            // setToastMessage("Erreur lors de la suppression. Veuillez réessayer.");
            // setToastType("error");
        }
    };

    const handleButtonClick = (e, action, index) => {
        e.stopPropagation(); // Empêche la propagation vers le parent

        if (action === "delete") {
            const itemId = data[index]?.id; // Assurez-vous que chaque élément a un ID
            if (itemId) {
                handleDelete(itemId, index);
            } else {
                console.error("ID manquant pour l'élément à supprimer.");
            }
        } else {
            console.log(`Action: ${action}`);
        }
    };

    // Pagination : calculer les éléments visibles
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = data.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div ref={containerRef}>

            {/* Liste des éléments */}
            <div className="list-group list-group-flush" style={{ width: "100%" }}>
                {currentItems.map((item, index) => (
                    <div
                        key={index}
                        className="list-group-item"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => handleItemClick(item)} // Gérer les clics sur l'élément
                        style={{
                            cursor: "pointer",
                            backgroundColor: hoveredIndex === index ? "#f8f9fa" : "white",
                        }}
                    >
                        <div
                            className="row"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>{item.label}</span>
                            <div
                                style={{
                                    display: hoveredIndex === index ? "flex" : "none",
                                    gap: "8px",
                                }}
                            >
                                <ButtonWithIcon
                                    className="p-2 btn btn-icon btn-outline-success"
                                    iconClass="far fa-edit"
                                    onClick={(e) => handleButtonClick(e, "edit", index)}
                                />
                                <ButtonWithIcon
                                    className="p-2 btn btn-icon btn-outline-danger"
                                    iconClass="fas fa-trash"
                                    onClick={(e) => handleButtonClick(e, "delete", index)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="card-footer">
                <div className="row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'end' }}>
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <li
                                key={index}
                                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Détails de l'élément */}
            <div
                style={{
                    ...styles.settingSidebar,
                    ...(selectedItem ? styles.showSettingPanel : { display: "none" }), // Affiche/masque la sidebar
                }}
            >
                {selectedItem && (
                    <>
                        <div className="card-header">
                            <h4>Information</h4>
                        </div>
                        <div className="card-body">
                            <p><strong>Label :</strong> {selectedItem.label}</p>
                            <p><strong>Description :</strong> {selectedItem.description || "Aucune description disponible."}</p>
                        </div>
                        <div className="card-footer">
                            <ButtonWithIcon
                                className="btn btn-icon btn-primary"
                                label="Fermer"
                                iconClass="fas fa-times"
                                onClick={() => setSelectedItem(null)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

ListConfig.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            label: PropTypes.string.isRequired,
            description: PropTypes.string,
        })
    ).isRequired,
    onUpdateItems: PropTypes.func.isRequired,
};

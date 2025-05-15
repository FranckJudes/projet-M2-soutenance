// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactDOM from "react-dom";

// eslint-disable-next-line react/prop-types
export const ModalComponent = ({ showModal, toggleModal, titleModal,children ,length = ""}) => {
    if (!showModal) return null;
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains("modal")) {
            toggleModal();
        }
    };
    return ReactDOM.createPortal(
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="myLargeModalLabel"
            aria-hidden="true"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Couleur de fond sombre
                position: "fixed", // Position fixe pour couvrir tout l'écran
                top: 0,
                left: 0,
                width: "100vw", // Largeur totale de l'écran
                height: "100vh", // Hauteur totale de l'écran
                zIndex: 50000, // Z-index supérieur pour passer au-dessus des autres éléments
            }}
            onClick={handleBackdropClick} // Gestionnaire d'événements pour détecter le clic

        >
            <div className={`modal-dialog ${length}`} role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="myLargeModalLabel">
                            {titleModal}
                        </h5>
                        <button
                            type="button"
                            className="close"
                            onClick={toggleModal}
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">{children || "Content goes here..."}</div>
                </div>
            </div>
        </div>,
        document.body
    );
};


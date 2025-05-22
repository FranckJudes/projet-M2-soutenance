import React, { useEffect, useRef, useState } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {
    handleDownloadPNG,
    handleDownloadXML,
    handleDownloadSVG,
    handleUploadBPMN,
    handleDownloadJSON
} from "../Functions/functions";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import { ButtonWithIcon } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { useTranslation } from "react-i18next";
import { Input } from "../../../components/Input";
import { styles } from "../../../utils/styles";

// eslint-disable-next-line react/prop-types
export default function Model({ sharedData, setSharedData }) {
    const canvasRef = useRef(null);
    const modelerRef = useRef(null);
    const { t } = useTranslation();

    const [selectedElement, setSelectedElement] = useState(null); // Élément BPMN sélectionné
    const [formValues, setFormValues] = useState({
        name: "",
        documentation: "",
    }); // Valeurs du formulaire

    useEffect(() => {
        // Initialisation du modeler
        modelerRef.current = new BpmnModeler({
            container: canvasRef.current,
        });

        setSharedData((prev) => ({ ...prev, modelerRef }));

        // Vérifier si un modèle BPMN existant doit être chargé
        if (sharedData && sharedData.loadedBpmnXml) {
            // Charger le modèle BPMN existant
            modelerRef.current.importXML(sharedData.loadedBpmnXml)
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.warn('Avertissements lors du chargement du modèle BPMN:', warnings);
                    }
                    console.log('Modèle BPMN chargé avec succès');
                })
                .catch(err => {
                    console.error('Erreur lors du chargement du modèle BPMN:', err);
                    // En cas d'erreur, créer un nouveau diagramme vide
                    modelerRef.current.createDiagram();
                });
        } else {
            // Créer un nouveau diagramme vide
            modelerRef.current.createDiagram();
        }

        const modeler = modelerRef.current;

        // Gestion des clics sur les éléments BPMN
        const handleElementClick = (event) => {
            const element = event.element;
            if (element.type !== "bpmn:Process") {
                const businessObject = element.businessObject;

                // Mise à jour des informations de l'élément sélectionné
                setSelectedElement(element);

                // Mise à jour des valeurs du formulaire
                setFormValues({
                    name: businessObject.name || "",
                    documentation: businessObject.documentation?.[0]?.text || "",
                });
            }
        };

        modeler.on("element.click", handleElementClick);

        return () => {
            modeler.off("element.click", handleElementClick);
            modelerRef.current.destroy();
        };
    }, [setSharedData]);

    // Gestion des changements dans le formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Mise à jour des valeurs du formulaire
        setFormValues((prev) => ({ ...prev, [name]: value }));

        // Mise à jour de l'élément BPMN
        if (selectedElement && modelerRef.current) {
            const modeling = modelerRef.current.get("modeling");
            const elementRegistry = modelerRef.current.get("elementRegistry");
            const element = elementRegistry.get(selectedElement.id);

            if (name === "name") {
                modeling.updateLabel(element, value);
            } else if (name === "documentation") {
                const bo = element.businessObject;
                bo.documentation = [{ text: value }];
            }
        }
    };

    // Rendu du canvas BPMN
    const renderCanvas = () => (
        <div
            ref={canvasRef}
            style={{
                width: "100%",
                height: "70vh",
                border: "1px solid #121314",
                margin: "0 auto",
            }}
        />
    );

    function xmlToJson(xml) {
        const obj = {};
        if (xml.nodeType === 1) { // élément
            if (xml.attributes) {
                Array.from(xml.attributes).forEach(attr => {
                    obj[attr.nodeName] = attr.nodeValue;
                });
            }
        } else if (xml.nodeType === 3) { // texte
            obj.text = xml.nodeValue;
        }
    
        // Enfants
        if (xml.hasChildNodes()) {
            Array.from(xml.childNodes).forEach(child => {
                const nodeName = child.nodeName;
                if (!obj[nodeName]) {
                    obj[nodeName] = xmlToJson(child);
                } else {
                    if (!Array.isArray(obj[nodeName])) {
                        obj[nodeName] = [obj[nodeName]];
                    }
                    obj[nodeName].push(xmlToJson(child));
                }
            });
        }
        return obj;
    }
    
   
    
    const renderRightCard = () => (
        <Card title={t("Propriétés de l'élément")}>
            <Input
                type="text"
                name="name"
                label={t("Nom :")}
                value={formValues.name}
                onChange={handleInputChange}
            />
            <Input
                type="text"
                name="documentation"
                label={t("Documentation :")}
                value={formValues.documentation}
                onChange={handleInputChange}
            />
        </Card>
    );

    const renderControls = () => (
        <>
            <div className="row">
                <div className="col-12" style={{ fontSize: "15px", fontWeight: "bold", color: "#212529" }}>
                    {t("Importer :")}
                </div>
                <div className="custom-file m-2">
                    <input
                        type="file"
                        className="custom-file-input"
                        id="customFile"
                        accept=".bpmn"
                        onChange={(event) => handleUploadBPMN(event, modelerRef)}
                    />
                    <label className="custom-file-label" htmlFor="customFile">
                        {t("__import_diag_bpmn")}
                    </label>
                </div>
            </div>
            <div className="row">
                <div className="col-12" style={{ fontSize: "15px", fontWeight: "bold", color: "#212529" }}>
                    {t("Téléchargement :")}
                </div>
                <div className="col-12" style={{ display: "flex", justifyContent: "center", margin: 5 }}>
                    <ButtonWithIcon
                        label={t("PNG")}
                        iconClass="fas fa-file-download m-1"
                        className="btn btn-outline-success m-1"
                        onClick={() => handleDownloadPNG(canvasRef)}
                    />
                    <ButtonWithIcon
                        label={t("SVG")}
                        iconClass="fas fa-file-download m-1"
                        className="btn btn-outline-primary m-1"
                        onClick={() => handleDownloadSVG(modelerRef)}
                    />
                    <ButtonWithIcon
                        label={t("BPMN")}
                        iconClass="fas fa-file-download m-1"
                        className="btn btn-outline-info m-1"
                        onClick={() => handleDownloadXML(modelerRef)}
                    />
                    <ButtonWithIcon
                        label={t("JSON")}
                        iconClass="fas fa-file-download m-1"
                        className="btn btn-outline-warning m-1"
                        onClick={() => handleDownloadJSON(modelerRef)}
                    />

                </div>
            </div>
        </>
    );

    return (
        <div className="row">
            <div className="col-12">
                <h4 style={styles.h4}>{t("__concept_process_metier")}</h4>
            </div>
            <div className="col-9">{renderCanvas()}</div>
            <div className="col-3">
                {renderRightCard()}
                {renderControls()}
            </div>
        </div>
    );
}

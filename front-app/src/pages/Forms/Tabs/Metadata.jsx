// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
import { useTranslation } from "react-i18next";
import { Card as CardComponent } from "../../../components/Card.jsx";
import { ModalComponent } from "../../../components/Modal.jsx";
import { Input } from "../../../components/Input.jsx";
import Select from "react-select";
import { showAlert } from "../../../components/SweetAlert.jsx";
import { useToast } from "../../../components/Toast";
import {
    getAllMetadatas,
    createMetadata,
    updateMetadata,
    deleteMetadata
} from "../../../api/ProcessMetadaApi.jsx";

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

export default function Metadata (){
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [metadatas, setMetadatas] = useState([]);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        nom: "",
        libelle: "",
        question: "",
        type_champ: "",
        masque_saisie: "",
        longeur: 0,
        concept_lie: "",
        domaine_valeur_lie: null,  // Changé de "" à null
        valeur_defaut: "",
        format_date: "",
        champ_incrementiel: ""
    });
    const [editingMetadata, setEditingMetadata] = useState(null);
    const [fieldVisibility, setFieldVisibility] = useState({
        masque_saisie: false,
        longeur: false,
        concept_lie: false,
        domaine_valeur_lie: false,
        valeur_defaut: false,
        format_date: false,
        champ_incrementiel: false,
    });
    

    const fetchMetadatas = async () => {
        try{
            const response = await getAllMetadatas();
            if (response?.data) {
                setMetadatas(response.data);
            } else {
                 
            }
        } catch (error) {
            console.error("Erreur de chargement des métadonnées :", error);
                
        }
    };

    useEffect(() => {
        fetchMetadatas();
    }, []);

    const resetForm = () => {
        setFormData({
            nom: "",
            libelle: "",
            question: "",
            type_champ: "",
            masque_saisie: "",
            longeur: 0,
            concept_lie: null,  // Changé de "" à null
            domaine_valeur_lie: null,  // Changé de "" à null
            valeur_defaut: "",
            format_date: "",
            champ_incrementiel: ""
        });
        setEditingMetadata(null);
        setFieldVisibility({
            masque_saisie: false,
            longeur: false,
            concept_lie: false,
            domaine_valeur_lie: false,
            valeur_defaut: false,
            format_date: false,
            champ_incrementiel: false,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMetadata) {
               await updateMetadata(editingMetadata.id, formData);
            }else{
               await createMetadata(formData);
            }
            await fetchMetadatas();
            setShowModal(false);
            resetForm();
            showToast({
                title: "Attention",
                message: "Metadata successfully created.",
                color: "green",
                position: "topRight",
            });    
        } catch (error) {
            showToast({
                title: "Erreur",
                message: "Veuilez verifier les champs requis.",
                color: "yellow",
                position: "topCenter",
            });           
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSelectChange = (selectedOption, { name }) => {
        setFormData(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : null
        }));
    };

    const handleTypeChange = (selectedOption) => {
        const value = selectedOption.value;
        setFormData(prev => ({ ...prev, type_champ: value }));

        const visibility = {
            masque_saisie: ["text", "number"].includes(value),
            longueur: ["text", "number"].includes(value),
            concept_lie: ["selection", "selection_multiple"].includes(value),
            domaine_valeur_lie: ["selection", "selection_multiple"].includes(value),
            valeur_defaut: false,
            valeur_defaut_logic: value === "logique",
            format_date: value === "date",
            valeur_incrementiel: value === "incrementiel"
        };

        setFieldVisibility(visibility);
    };
    const optionsConceptLie = [
        { value: "concept1", label: t("concept1") },
        { value: "concept2", label: t("concept2") },
        { value: "concept3", label: t("concept3") }
    ];

    const optionsDomaineValeur = [
        { value: "domaine1", label: t("domaine1") },
        { value: "domaine2", label: t("domaine2") },
        { value: "domaine3", label: t("domaine3") }
    ];
    // const handleEdit = (metadata) => {
    //     setEditingMetadata(metadata);
    //     setFormData(metadata);
    //     handleTypeChange({ value: metadata.type_champ });
    //     setShowModal(true);
    // };

    
    const handleEdit = (metadata) => {
        setEditingMetadata(metadata);
        setFormData(metadata);
        handleTypeChange({ value: metadata.type_champ });
        setShowModal(true);
      };
      
      
      const handleDelete = async (id) => {
        showAlert({
            title: <p>Confirmez-vous cette action ?</p>,
            text: "Cette action est irréversible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui",
            cancelButtonText: "Non",
          }).then(async (result) => {
            if (result.isConfirmed) {
                  await deleteMetadata(id); 
                  await fetchMetadatas(); 
                   showToast({
                        title: "Attention",
                        message: "Metadata successfully deleted.",
                        color: "green",
                        position: "topRight",
                    });   
            } else if (result.isDismissed) {
                showToast({
                    title: "Attention",
                    message: "Annulation de la suppression.",
                    color: "red",
                    position: "topRight",
                });                 
            }
          });
      };

    const toggleModal = () => {
        if (showModal) {
            resetForm();
        }
        setShowModal(!showModal);
    };

    const optionsSelect = [
        { value: "text", label: t("text") },
        { value: "date", label: t("date") },
        { value: "number", label: t("number") },
        { value: "selection", label: t("selection") },
        { value: "selection_multiple", label: t("selection_multiple") },
        { value: "zone", label: t("zone") },
        { value: "incrementiel", label: t("incremental_value") },
        { value: "logique", label: t("logical_default") }
    ];

    const optionsSelectOuiNon = [
        { value: "Oui", label: t("Vrai/Faux") },
        { value: "Non", label: t("Oui/Non") }
    ];

    const formatDateOptions = [
        { value: "normal_date", label: t("normal_date") },
        { value: "plage_date", label: t("date_range") },
        { value: "time_date", label: t("time") },
        { value: "mois_annee", label: t("month_year") }
    ];

    return (
        <>
            <CardComponent
                title={t("list_of_values")}
                titleAction={
                    <button className="btn btn-success" onClick={toggleModal}>
                        {t("add_index")}
                    </button>
                }

            >
                {/* <Toast message={toast.message} type={toast.type} /> */}


                <DataTable
                    data={metadatas.map((metadata, index) => ({
                        id: index + 1,
                        nom: metadata.nom || t("Unknown"),
                        type: metadata.type_champ || t("Not Specified"),
                        domaineValeurLie: metadata.domaine_valeur_lie || t("No Domain"),
                        actions: metadata // Store full metadata object for actions
                    }))}
                    columns={[
                        { data: "id", title: t("ID") },
                        { data: "nom", title: t("Name") },
                        { data: "type", title: t("Type") },
                        { data: "domaineValeurLie", title: t("Domaine de valeur lié") },
                        {
                            data: "actions",
                            title: t("Actions"),
                            render: (data,row) => {
                                const jsonData = JSON.stringify(data).replace(/"/g, '&quot;');
                                return `
                                
                                      <div class="dropdown">
                                        <button class="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton2"
                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        Action
                                        </button>
                                        <div class="dropdown-menu">
                                            <a class="dropdown-item has-icon edit-btn"  data-id="${jsonData}"  href="#"><i class="far fa-edit"></i>${t("Edit")}</a>
                                            <a class="dropdown-item has-icon  delete-btn" data-id="${data._id}"  href="#"><i class="fas fa-trash"></i> ${t("Delete")}</a>
                                        </div>
                                    </div>
                                `;
                            }
                        }
                    ]}
                    className="display table table-striped"
                    options={{
                        responsive: true,
                        rowId: "id",
                        drawCallback: function (settings) {
                          // Gestion des événements pour les boutons Edit
                          document.querySelectorAll(".edit-btn").forEach((btn) => {
                            btn.addEventListener("click", (e) => {
                              e.preventDefault();
                              const jsonData = btn.getAttribute("data-id");
                              const metadata = JSON.parse(jsonData);
                              handleEdit(metadata);
                            });
                          });
                    
                          // Gestion des événements pour les boutons Delete
                          document.querySelectorAll(".delete-btn").forEach((btn) => {
                            btn.addEventListener("click", (e) => {
                              e.preventDefault();
                              const id = btn.getAttribute("data-id");
                              handleDelete(id);
                            });
                          });
                        },
                      }}
                />
            </CardComponent>

            <ModalComponent
                showModal={showModal}
                toggleModal={toggleModal}
                titleModal={t(editingMetadata ? "edit_metadata" : "add_new_index")}
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        name="nom"
                        value={formData.nom}
                        label={t("property_name")}
                        placeholder={t("property_name")}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="libelle"
                        value={formData.libelle}
                        label={t("label")}
                        placeholder={t("label")}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        name="question"
                        value={formData.question}
                        label={t("question")}
                        placeholder={t("question")}
                        onChange={handleInputChange}
                        required
                    />

                    <div className="form-group mb-3">
                        <label>{t("field_type")}</label>
                        <Select
                            name="type_champ"
                            value={optionsSelect.find(opt => opt.value === formData.type_champ)}
                            options={optionsSelect}
                            onChange={handleTypeChange}
                            required
                        />
                    </div>

                    {fieldVisibility.masque_saisie && (
                        <Input
                            name="masque_saisie"
                            value={formData.masque_saisie}
                            label={t("input_mask")}
                            placeholder={t("input_mask")}
                            onChange={handleInputChange}
                        />
                    )}

                    {fieldVisibility.longueur && (
                        <Input
                            name="longeur"
                            value={formData.longeur}
                            type="number"

                            label={t("length")}
                            placeholder={t("length")}
                            onChange={handleInputChange}
                        />
                    )}

                    {fieldVisibility.concept_lie && (
                        <div className="form-group mb-3">
                            <label>{t("linked_concept")}</label>
                            <Select
                                name="concept_lie"
                                value={optionsConceptLie.find(opt => opt.value === formData.concept_lie)}
                                options={optionsConceptLie}
                                onChange={handleSelectChange}
                                required
                                placeholder={t("select_concept")}
                                isClearable
                            />
                        </div>
                    )}

                    {fieldVisibility.domaine_valeur_lie && (
                        <div className="form-group mb-3">
                            <label>{t("value_domain")}</label>
                            <Select
                                name="domaine_valeur_lie"
                                value={optionsDomaineValeur.find(opt => opt.value === formData.domaine_valeur_lie)}
                                options={optionsDomaineValeur}
                                onChange={handleSelectChange}
                                required
                                placeholder={t("select_domain")}
                                isClearable
                            />
                        </div>
                    )}
                    {fieldVisibility.valeur_defaut_logic && (
                        <div className="form-group mb-3">
                            <label>{t("default_logic")}</label>
                            <Select
                                name="valeur_defaut"
                                value={optionsSelectOuiNon.find(opt => opt.value === formData.valeur_defaut_logic)}
                                options={optionsSelectOuiNon}
                                onChange={handleSelectChange}
                            />
                        </div>
                    )}

                    {fieldVisibility.format_date && (
                        <div className="form-group mb-3">
                            <label>{t("date_format")}</label>
                            <Select
                                name="format_date"
                                value={formatDateOptions.find(opt => opt.value === formData.format_date)}
                                options={formatDateOptions}
                                onChange={handleSelectChange}
                            />
                        </div>
                    )}

                    {fieldVisibility.valeur_incrementiel && (
                        <Input
                            name="champ_incrementiel"
                            value={formData.valeur_incrementiel}
                            type="number"
                            label={t("incremental_value")}
                            placeholder={t("incremental_value")}
                            onChange={handleInputChange}
                        />
                    )}

                    <div className="text-end mt-4">
                        <button type="submit"  style={{float:"right"}} className="btn btn-success">
                            {t(editingMetadata ? "update_metadata" : "add_index")}
                        </button>
                    </div>
                </form>
            </ModalComponent>
        </>
    );
};


import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import Main from "../../layout/Main";
import Breadcrumb from "../../components/Breadcrumb";
import Tabs from "../../components/Tabs";
import Acteur from "./Tabs/Acteur";
import General from "./Tabs/General";
import Parametres from "./Tabs/Parametres";
import Model from "./Tabs/Model";
import Taches from "./Tabs/Taches";
import { ListConfig } from "../../components/List";
import { Card } from "../../components/Card";
import { ButtonWithIcon } from "../../components/Button";
import { styles } from "../../utils/styles";
import { getAllProcessBpmns } from "../../api/processBpmnApi.jsx";

function Configuration() {
    const { t } = useTranslation();
    const [showList, setShowList] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [bpmnItems, setBpmnItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tabItems = [
        { id: "General", title: t("_general_config"), content: <General /> },
        { id: "Model", title: t("__Conception_config_"), content: <Model /> },
        { id: "Parametres", title: t("setting_sidebar_title"), content: <Parametres /> },
        // { id: "Taches", title: t("__task_bord_"), content: <Taches /> },
        // { id: "Acteur", title: t("_actor_"), content: <Acteur /> }
    ];


    useEffect(() => {
        const fetchBpmnItems = async () => {
            setLoading(true);
            try {
                const data = await getAllProcessBpmns();
                setBpmnItems(data);
            } catch (error) {
                setError("Impossible de charger les BPMN. Veuillez réessayer.");
                console.error("Erreur :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBpmnItems();
    }, []);

    const handleUpdateItems = (updatedItems) => {
        setBpmnItems(updatedItems);
    };

    const handleAddClick = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setShowList(false);
            setIsTransitioning(false);
        }, 300);
    };

    return (
        <Main>
            <Breadcrumb
                items={[
                    { label: t("welcome_dashboard"), link: "#", icon: "fas fa-tachometer-alt", active: false },
                    { label: t("configuration_sidebar_title"), icon: "fas fa-list", active: true }
                ]}
            />

            {loading ? (
                <div className="loader-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                    <div className="spinner-border text-primary" role="status" aria-label="Chargement">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                </div>
            ) : (
                <div style={{
                    ...styles.transitionContainer,
                    ...(isTransitioning ? styles.fadeOut : {})
                }}>
                    {showList ? (
                        <Card
                            title={`Processus (${bpmnItems.length})`} // Mise à jour dynamique
                            titleAction={
                                <ButtonWithIcon
                                    className="btn btn-icon icon-left btn-success"
                                    label="Ajouter un nouveau processus"
                                    onClick={handleAddClick}
                                    iconClass="fas fa-plus"
                                />
                            }
                        >
                            {error ? (
                                <div className="alert alert-danger">{error}</div>
                            ) : (
                                <ListConfig
                                    items={bpmnItems.map((item) => ({
                                        label: item.name,
                                        id: item.id
                                    }))}
                                    onUpdateItems={handleUpdateItems} // Transmet la fonction de mise à jour
                                />
                            )}
                        </Card>
                    ) : (
                        <Tabs items={tabItems} 
                              title={t("configuration_sidebar_title")} 
                              footer={true}
                              
                         />

                    )}
                </div>
            )}
        </Main>
    );
}

export default Configuration;

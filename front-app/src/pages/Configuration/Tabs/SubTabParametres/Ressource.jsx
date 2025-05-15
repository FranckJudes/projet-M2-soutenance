import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Input, Radio } from '../../../../components/Input';
import ZtreeComponent from "../../../../components/ZTreeComponent.jsx";
import Select from 'react-select';

export default function Ressource (){
    const { t } = useTranslation();
    const [isCheckedAttachement, setIsCheckedAttachement] = useState(false);
    const [isDisplayDoc, setIsDisplayDoc] = useState(false);
    const [isDisplayFol, setIsDisplayFol] = useState(false);

    const handleCheckAttachement = () => {
        setIsCheckedAttachement(!isCheckedAttachement);
        // Réinitialiser les états d'affichage lorsque l'attachement est désactivé
        if (!isCheckedAttachement) {
            setIsDisplayDoc(false);
            setIsDisplayFol(false);
        }
    };

    const handleNodeSelect = (node) => {
        if (node.original.type === 1) {
            setIsDisplayDoc(true); // Afficher les options pour les documents
            setIsDisplayFol(false); // Masquer les options pour les dossiers
        } else {
            setIsDisplayFol(true); // Afficher les options pour les dossiers
            setIsDisplayDoc(false); // Masquer les options pour les documents
        }
    };

    // Options pour le Select (exemple)
    const securityOptions = [
        { value: 'high', label: t('__high_security_') },
        { value: 'medium', label: t('__medium_security_') },
        { value: 'low', label: t('__low_security_') },
    ];

    return (
        <>
            {/* Section Pièces jointes */}
            <div className="d-flex py-2">
                <div className="col-4">
                    <Radio
                        name="piece_jointes"
                        label={t('__piece_jt_')}
                        onChange={handleCheckAttachement}
                    />
                </div>
                {isCheckedAttachement && (
                    <div className="col-8">
                        <ZtreeComponent
                            data={[
                                { id: "1", text: "Élément 1", parent: "#", type: 0 },
                                { id: "1.1", text: "Élément 1.1", parent: "1", type: 1 },
                                { id: "1.2", text: "Élément 1.2", parent: "1", type: 1 },
                                { id: "2", text: "Élément 2", parent: "#", type: 0 },
                                { id: "3", text: "Élément 3", parent: "#", type: 0 },
                                { id: "3.1", text: "Élément 3.1", parent: "3", type: 1 },
                            ]}
                            plugins={["themes"]}
                            onNodeSelect={handleNodeSelect}
                        />
                        <hr />
                    </div>
                )}
            </div>

            {/* Options pour les documents et dossiers */}
            {isCheckedAttachement && (isDisplayDoc || isDisplayFol) && (
                <div className="d-flex py-2">
                    <div className="col-4"></div>
                    <div className="col-8">
                        <div className="row">
                            {/* Options communes */}
                            <div className="col-5">
                                <Checkbox name="archiv_attach" id="__archiv_attac_" label={t('__archiv_attac_')} />
                                <Checkbox name="share_achiv_pdf" id="__share_achiv_on_pdf" label={t('__share_achiv_on_pdf')} />
                                <Checkbox label={t('__decribe_fol_doc__')} name="__decribe_fol_doc__" id="__id_descrip_folder_" />
                                <Checkbox name="delete_attach_doc" id="__dele_attach_doc" label={t('__dele_attach_doc')} />
                                <Checkbox name="consulter_attach_doc" id="__consulter_doc_att" label={t('__consulter_doc_att')} />
                                <Checkbox name="download_zip" id="__download_zip_" label={t('__download_zip_')} />

                                {/* Options spécifiques aux dossiers */}
                                {isDisplayDoc && (
                                    <>
                                        <Checkbox name="import_attach" id="__import_attach_" label={t('__import_attach_')} />
                                        <Checkbox name="edit_attach" id="__edit_attac_" label={t('__edit_attac_')} />
                                        <Checkbox name="annoter_doc" id="__annoter_doc_att" label={t('__annoter_doc_att')} />
                                    </>
                                )}
                            </div>

                            {/* Options spécifiques aux documents */}
                            {isDisplayDoc && (
                                <div className="col-7">
                                    <Checkbox name="verif_attach_doc" id="__verif_valid_attach_" label={t('__verif_valid_attach_')} />
                                    <Checkbox name="rechercher_un_doc" id="__research_in_Doc__" label={t('__research_in_Doc__')} />
                                    <Checkbox name="retirer_un_doc" id="__move_attach" label={t('__move_attach')} />
                                    <Checkbox name="add_new_attach" id="__add_new_attac_" label={t('__add_new_attac_')} />
                                    <Checkbox name="conver_attach_pdf" id="__conver_attac_pdf" label={t('__conver_attac_pdf')} />
                                    <Checkbox name="download_attach_pdf" id="__download_attac_pdf" label={t('__download_attac_pdf')} />
                                    <Checkbox name="download_original_format" id="__download_original_format__" label={t('__download_original_format__')} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Section Indicateurs de sécurité (uniquement pour les dossiers) */}
            {isDisplayFol && (
                <div className="d-flex py-2">
                    <div className="col-4">
                        <label>{t('__indic_security_')} :</label>
                    </div>
                    <div className="col-8">
                        <Select options={securityOptions} placeholder={t('__select_security_level_')} />
                    </div>
                </div>
            )}

            {/* Sections communes */}
            {[
                { label: t('__extern_tools'), placeholder: t('external_api_') },
                { label: t('__add_form_ressource_') },
                { label: t('__script_regle_metier'), radioLabel: t('__detail_script_aut__') },
                { label: t('__link_other_task_'), placeholder: t('__link_other_task_') },
            ].map((section, index) => (
                <div className="d-flex py-2" key={index}>
                    <div className="col-4">
                        <label>{section.label} :</label>
                    </div>
                    <div className="col-8">
                        {section.placeholder ? (
                            <input type="url" className="form-control" placeholder={section.placeholder} />
                        ) : (
                            <Radio name={section.label} label={section.radioLabel} />
                        )}
                    </div>
                </div>
            ))}
        </>
    );
};
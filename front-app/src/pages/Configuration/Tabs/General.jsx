import React, { useState } from 'react';
import { Card, CardWithMedia } from '../../../components/Card';
import { useTranslation } from 'react-i18next';
import { Input, Textarea } from '../../../components/Input';
import { ButtonWithIcon } from '../../../components/Button';
import { createProcessBpmn } from "../../../api/processBpmnApi";

function General() {
    const { t } = useTranslation();

    // États pour les champs de formulaire
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [keyWords, setKeyWords] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // États pour les Toasts
    // const [toastMessage, setToastMessage] = useState(null);

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Creation du formulaire pour l'envoie des donnees
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('key_words', keyWords);
        if (image) {
            formData.append('images', image);
        }

        setIsSubmitting(true);

        try {
            await createProcessBpmn(formData);

            // Définir le toast pour le succès
            // setToastMessage(`Process créé avec succès`);

            // Réinitialiser les champs après succès
            setName('');
            setDescription('');
            setKeyWords('');
            setImage(null);
        } catch (error) {
            console.error("Erreur lors de la soumission :", error);
            // Définir le toast pour l'erreur
            
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row">
            {/* Intégration du composant Toast */}

            <div className="col-4 col-md-4 col-lg-4 pt-3">
                <Card
                    title={t("__concept_process_metier")}
                    children={
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="text"
                                name="name"
                                label="Nom"
                                value={name}
                                onChange={handleInputChange(setName)}
                            />
                            <Textarea
                                name="description"
                                label="Description"
                                value={description}
                                onChange={handleInputChange(setDescription)}
                            />
                            <Input
                                type="text"
                                name="key_words"
                                label="Mots clés"
                                className="form-control inputtags"
                                value={keyWords}
                                onChange={handleInputChange(setKeyWords)}
                            />
                            <div className="section-title">Image :</div>
                            <div className="custom-file">
                                <input
                                    type="file"
                                    className="custom-file-input"
                                    id="customFile"
                                    accept=".png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                />
                                <label className="custom-file-label" htmlFor="customFile">
                                    {image ? image.name : "Choisir une image"}
                                </label>
                            </div>
                            <div
                                className="pt-4"
                                style={{ display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}
                            >
                                <ButtonWithIcon
                                    label={isSubmitting ? "Envoi en cours..." : "Enregistrer"}
                                    iconClass="fas fa-save"
                                    className="btn btn-icon icon-left btn-success"
                                    style={{ width: '100%' }}
                                    type="submit"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </form>
                    }
                />
            </div>



            <div className="col-8 col-md-8 col-lg-8 pt-3">
                <CardWithMedia
                    title="Image"
                    children={
                        "Ajoutez une image pour représenter le processus métier."
                    }
                />
            </div>
        </div>
    );
}

export default General;

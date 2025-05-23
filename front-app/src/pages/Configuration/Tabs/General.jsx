import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardWithMedia } from '../../../components/Card';
import { useTranslation } from 'react-i18next';
import { Input, Textarea } from '../../../components/Input';
import { ButtonWithIcon } from '../../../components/Button';
import { createProcessBpmn } from "../../../api/processBpmnApi";
import { useDropzone } from 'react-dropzone';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import toast from 'react-hot-toast';

function General({ sharedData, onSaveGeneral }) {
    const { t } = useTranslation();

    // États pour les champs de formulaire
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialiser les données si elles existent dans sharedData
    useEffect(() => {
        if (sharedData?.processData) {
            const { processName, processDescription, processTags, processImage } = sharedData.processData;
            if (processName) setName(processName);
            if (processDescription) setDescription(processDescription);
            if (processTags) setTags(Array.isArray(processTags) ? processTags : []);
            if (processImage) {
                setImage(processImage);
                if (typeof processImage === 'string') {
                    setImagePreview(processImage);
                } else if (processImage instanceof File) {
                    setImagePreview(URL.createObjectURL(processImage));
                }
            }
        }
    }, [sharedData]);

    // Configuration de la dropzone
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1
    });

    // Gestion des changements d'entrée
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    // Gestion des changements de tags
    const handleTagsChange = (newTags) => {
        setTags(newTags);
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error(t("Le nom du processus est obligatoire"));
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            // Préparer les données à transmettre
            const processData = {
                processName: name,
                processDescription: description,
                processTags: tags,
                processImage: image,
                processId: sharedData?.processData?.processId || null
            };
    
            // Appeler le callback avec toutes les données
            if (onSaveGeneral) {
                onSaveGeneral(processData);
            }
    
            toast.success(t("Informations du processus enregistrées avec succès"));
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(t("Erreur lors de l'enregistrement"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row">
            <div className="col-5 col-md-5 col-lg-5 pt-3">
                <Card
                    title={t("Informations du processus")}
                    children={
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="text"
                                name="name"
                                label={t("Nom du processus")}
                                value={name}
                                onChange={handleInputChange(setName)}
                                required
                            />
                            <Textarea
                                name="description"
                                label={t("Description")}
                                value={description}
                                onChange={handleInputChange(setDescription)}
                                rows={4}
                            />
                            <div className="form-group">
                                <label>{t("Mots clés")}</label>
                                <TagsInput 
                                    value={tags} 
                                    onChange={handleTagsChange} 
                                    inputProps={{ 
                                        placeholder: t('Ajouter un mot clé et appuyer sur Entrée'),
                                        className: 'react-tagsinput-input'
                                    }}
                                    className="react-tagsinput"
                                />
                                <small className="form-text text-muted">
                                    {t("Saisissez un mot clé et appuyez sur Entrée pour l'ajouter")}
                                </small>
                            </div>
                            <div
                                className="pt-4"
                                style={{ display: 'flex', alignItems: 'end', justifyContent: 'flex-end' }}
                            >
                                <ButtonWithIcon
                                    label={isSubmitting ? t("Enregistrement...") : t("Enregistrer")}
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

            <div className="col-7 col-md-7 col-lg-7 pt-3">
                <Card
                    title={t("Image du processus")}
                    children={
                        <div>
                            <div {...getRootProps()} className="dropzone" style={{
                                border: '2px dashed #cccccc',
                                borderRadius: '4px',
                                padding: '20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginBottom: '20px',
                                backgroundColor: isDragActive ? '#f8f9fa' : 'white'
                            }}>
                                <input {...getInputProps()} />
                                {isDragActive ? (
                                    <p>{t("Déposez l'image ici...")}</p>
                                ) : (
                                    <div>
                                        <p>{t("Glissez et déposez une image ici, ou cliquez pour sélectionner une image")}</p>
                                        <p className="text-muted">{t("Formats acceptés: JPG, PNG")}</p>
                                    </div>
                                )}
                            </div>
                            
                            {imagePreview && (
                                <div className="image-preview" style={{ marginTop: '20px' }}>
                                    <h6>{t("Aperçu de l'image")}</h6>
                                    <div style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '300px', 
                                        overflow: 'hidden',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '5px'
                                    }}>
                                        <img 
                                            src={imagePreview} 
                                            alt={t("Aperçu du processus")} 
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '290px', 
                                                objectFit: 'contain' 
                                            }} 
                                        />
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-danger" 
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview(null);
                                            }}
                                        >
                                            <i className="fas fa-trash"></i> {t("Supprimer l'image")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
}

export default General;

import React, { useState, useCallback, useEffect } from 'react';
import { Card } from '../../../components/Card';
import { useTranslation } from 'react-i18next';
import { Input, Textarea } from '../../../components/Input';
import { useDropzone } from 'react-dropzone';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import toast from 'react-hot-toast';
import ProcessEngineService from '../../../services/ProcessEngineService';
function General({ sharedData, onSaveGeneral }) {
    const { t } = useTranslation();

    // États pour les champs de formulaire
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [images, setImages] = useState([]); // Changé pour supporter plusieurs images
    const [imagePreviews, setImagePreviews] = useState([]); // Changé pour supporter plusieurs previews
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);


    // Fonction pour récupérer les images depuis le serveur
    const loadImagesFromServer = useCallback(async (processImages) => {
        const processedImages = [];
        const processedPreviews = [];

        for (const image of processImages) {
            if (typeof image === 'string') {
                // Ancien format (base64) ou nouveau chemin d'URL
                if (image.startsWith('/process-images/')) {
                    // Nouveau format: récupérer l'image depuis le serveur
                    try {
                        const imageUrl = await ProcessEngineService.getProcessImage(
                            sharedData.processData.processId,
                            image.split('/').pop()
                        );
                        processedImages.push(imageUrl);
                        processedPreviews.push(imageUrl);
                    } catch (error) {
                        console.error('Erreur lors de la récupération de l\'image:', error);
                        // En cas d'erreur, utiliser une image vide
                        processedImages.push(null);
                        processedPreviews.push(null);
                    }
                } else {
                    // Ancien format base64
                    processedImages.push(image);
                    processedPreviews.push(image);
                }
            } else if (image && image.filePath) {
                // Nouveau format avec objet image
                try {
                    const imageUrl = await ProcessEngineService.getProcessImage(
                        sharedData.processData.processId,
                        image.filePath.split('/').pop()
                    );
                    processedImages.push(imageUrl);
                    processedPreviews.push(imageUrl);
                } catch (error) {
                    console.error('Erreur lors de la récupération de l\'image:', error);
                    processedImages.push(null);
                    processedPreviews.push(null);
                }
            }
        }

        setImages(processedImages.filter(img => img !== null));
        setImagePreviews(processedPreviews.filter(preview => preview !== null));
    }, [sharedData]);

    // Initialiser les données depuis sharedData
    useEffect(() => {
        if (sharedData?.processData) {
            const { processName, processDescription, processTags, processImages } = sharedData.processData;

            // Synchroniser les champs si nécessaire
            if (processName && processName !== name) {
                setName(processName);
            }
            if (processDescription && processDescription !== description) {
                setDescription(processDescription);
            }
            if (processTags && JSON.stringify(processTags) !== JSON.stringify(tags)) {
                setTags(processTags);
            }
            if (processImages && processImages.length > 0 && JSON.stringify(processImages) !== JSON.stringify(images)) {
                // Charger les images depuis le serveur de manière asynchrone
                loadImagesFromServer(processImages);
            }
        }
    }, [sharedData, loadImagesFromServer, name, description, tags, images]);


   
    // Configuration de la dropzone pour plusieurs images
    const onDrop = useCallback(acceptedFiles => {
        const maxImages = 5; // Limiter à 5 images maximum
        
        acceptedFiles.forEach(file => {
            if (images.length >= maxImages) {
                toast.error(t(`Maximum ${maxImages} images autorisées`));
                return;
            }
            
            const newImage = file;
            const newPreview = URL.createObjectURL(file);
            
            setImages(prev => [...prev, newImage]);
            setImagePreviews(prev => [...prev, newPreview]);
        });
    }, [images.length, t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 5 // Permettre jusqu'à 5 fichiers
    });

    // Fonction pour supprimer une image spécifique
    const removeImage = (index) => {
        // Nettoyer l'URL de preview pour éviter les fuites mémoire
        if (imagePreviews[index] && imagePreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviews[index]);
        }
        
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Fonction pour déplacer une image vers le haut
    const moveImageUp = (index) => {
        if (index > 0) {
            setImages(prev => {
                const newImages = [...prev];
                [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
                return newImages;
            });
            setImagePreviews(prev => {
                const newPreviews = [...prev];
                [newPreviews[index - 1], newPreviews[index]] = [newPreviews[index], newPreviews[index - 1]];
                return newPreviews;
            });
        }
    };

    // Fonction pour déplacer une image vers le bas
    const moveImageDown = (index) => {
        if (index < images.length - 1) {
            setImages(prev => {
                const newImages = [...prev];
                [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                return newImages;
            });
            setImagePreviews(prev => {
                const newPreviews = [...prev];
                [newPreviews[index], newPreviews[index + 1]] = [newPreviews[index + 1], newPreviews[index]];
                return newPreviews;
            });
        }
    };

    // Gestion des changements d'entrée
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    // Gestion des changements de tags
    const handleTagsChange = (newTags) => {
        setTags(newTags);
    };
    
    // Fonction pour préparer les données à sauvegarder
    const prepareDataToSave = useCallback(() => {
        if (!name.trim()) {
            return null; // Ne pas sauvegarder si le nom est vide
        }

        // Préparer les données à transmettre
        const processData = {
            processName: name,
            processDescription: description,
            processTags: tags,
            processImages: images,
            processId: sharedData?.processData?.processId || null
        };

        console.log("📦 GENERAL - Données préparées pour sauvegarde:", {
            processName: processData.processName,
            processDescription: processData.processDescription?.substring(0, 20) + (processData.processDescription?.length > 20 ? '...' : ''),
            processTags: processData.processTags,
            processImagesCount: processData.processImages?.length || 0
        });

        return processData;
    }, [name, description, tags, images, sharedData]);
    
    // Exposer la fonction de préparation des données pour que le composant parent puisse l'utiliser
    useEffect(() => {
        // Mettre à jour les données dans sharedData lorsque le composant est monté
        // pour s'assurer que les données sont disponibles pour le bouton Next
        if (onSaveGeneral) {
            const data = prepareDataToSave();
            if (data) {
                onSaveGeneral(data);
            }
        }
    }, []);
    
    // Exposer la fonction de sauvegarde au composant parent via une ref
    useEffect(() => {
        // Mettre à jour la référence dans le contexte parent
        if (sharedData) {
            sharedData.saveGeneralData = () => {
                const data = prepareDataToSave();
                if (data && onSaveGeneral) {
                    onSaveGeneral(data);
                    return true;
                }
                return false;
            };
        }
        
        return () => {
            // Nettoyer la référence lors du démontage
            if (sharedData) {
                sharedData.saveGeneralData = null;
            }
        };
    }, [prepareDataToSave, onSaveGeneral, sharedData]);

    return (
        <div className="row">
            <div className="col-5 col-md-5 col-lg-5 pt-3">
                <Card
                    title={t("Informations du processus")}
                    children={
                        <div>
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
                        </div>
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
                            
                            {imagePreviews && imagePreviews.length > 0 && (
                                <div className="image-preview" style={{ marginTop: '20px' }}>
                                    <h6>{t("Images du processus")} ({imagePreviews.length}/5)</h6>
                                    <div style={{ 
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                        gap: '15px',
                                        marginTop: '15px'
                                    }}>
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} style={{
                                                position: 'relative',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                padding: '10px',
                                                backgroundColor: '#f9f9f9'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    display: 'flex',
                                                    gap: '5px',
                                                    zIndex: 10
                                                }}>
                                                    {/* Bouton pour déplacer vers le haut */}
                                                    <button 
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => moveImageUp(index)}
                                                        disabled={index === 0}
                                                        style={{ padding: '2px 6px', fontSize: '10px' }}
                                                        title={t("Déplacer vers le haut")}
                                                    >
                                                        ↑
                                                    </button>
                                                    
                                                    {/* Bouton pour déplacer vers le bas */}
                                                    <button 
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => moveImageDown(index)}
                                                        disabled={index === imagePreviews.length - 1}
                                                        style={{ padding: '2px 6px', fontSize: '10px' }}
                                                        title={t("Déplacer vers le bas")}
                                                    >
                                                        ↓
                                                    </button>
                                                    
                                                    {/* Bouton pour supprimer */}
                                                    <button 
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => removeImage(index)}
                                                        style={{ padding: '2px 6px', fontSize: '10px' }}
                                                        title={t("Supprimer l'image")}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                
                                                <img 
                                                    src={preview} 
                                                    alt={`${t("Image")} ${index + 1}`} 
                                                    style={{ 
                                                        maxWidth: '100%', 
                                                        maxHeight: '120px', 
                                                        objectFit: 'contain',
                                                        borderRadius: '4px'
                                                    }} 
                                                />
                                                <div style={{
                                                    marginTop: '8px',
                                                    fontSize: '11px',
                                                    color: '#666',
                                                    textAlign: 'center',
                                                    backgroundColor: 'white',
                                                    padding: '4px',
                                                    borderRadius: '3px'
                                                }}>
                                                    {images[index] instanceof File ? images[index].name : `Image ${index + 1}`}
                                                </div>
                                            </div>
                                        ))}
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

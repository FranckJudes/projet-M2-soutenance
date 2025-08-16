package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.DocumentTypeDto;
import com.harmony.harmoniservices.mappers.DocumentTypeMapper;
import com.harmony.harmoniservices.models.DocumentType;
import com.harmony.harmoniservices.repository.DocumentTypeRepository;
import com.harmony.harmoniservices.requests.DocumentTypeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour la gestion des types de documents
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DocumentTypeService {

    private final DocumentTypeRepository documentTypeRepository;

    /**
     * Obtenir tous les types de documents actifs
     * @return liste des types de documents actifs
     */
    public List<DocumentTypeDto> getAllActiveDocumentTypes() {
        log.info("Récupération de tous les types de documents actifs");
        List<DocumentType> documentTypes = documentTypeRepository.findAllActiveOrderBySortOrder();
        return DocumentTypeMapper.toDtoList(documentTypes);
    }

    /**
     * Obtenir tous les types de documents (actifs et inactifs)
     * @return liste de tous les types de documents
     */
    public List<DocumentTypeDto> getAllDocumentTypes() {
        log.info("Récupération de tous les types de documents");
        List<DocumentType> documentTypes = documentTypeRepository.findAllOrderBySortOrder();
        return DocumentTypeMapper.toDtoList(documentTypes);
    }

    /**
     * Obtenir un type de document par son ID
     * @param id l'ID du type de document
     * @return le type de document trouvé
     * @throws RuntimeException si le type de document n'est pas trouvé
     */
    public DocumentTypeDto getDocumentTypeById(Long id) {
        log.info("Récupération du type de document avec l'ID : {}", id);
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type de document non trouvé avec l'ID : " + id));
        return DocumentTypeMapper.toDto(documentType);
    }

    /**
     * Obtenir un type de document par son code
     * @param code le code du type de document
     * @return le type de document trouvé
     * @throws RuntimeException si le type de document n'est pas trouvé
     */
    public DocumentTypeDto getDocumentTypeByCode(String code) {
        log.info("Récupération du type de document avec le code : {}", code);
        DocumentType documentType = documentTypeRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Type de document non trouvé avec le code : " + code));
        return DocumentTypeMapper.toDto(documentType);
    }

    /**
     * Créer un nouveau type de document
     * @param request les données du type de document à créer
     * @return le type de document créé
     * @throws RuntimeException si le code ou le nom existe déjà
     */
    @Transactional
    public DocumentTypeDto createDocumentType(DocumentTypeRequest request) {
        log.info("Création d'un nouveau type de document : {}", request.getName());

        // Vérifier l'unicité du code
        String code = request.getCode().toUpperCase();
        if (documentTypeRepository.existsByCode(code)) {
            throw new RuntimeException("Un type de document avec le code '" + code + "' existe déjà");
        }

        // Vérifier l'unicité du nom
        if (documentTypeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Un type de document avec le nom '" + request.getName() + "' existe déjà");
        }

        // Définir l'ordre de tri si non spécifié
        if (request.getSortOrder() == null || request.getSortOrder() == 0) {
            Integer nextSortOrder = documentTypeRepository.getNextSortOrder();
            request.setSortOrder(nextSortOrder);
        }

        DocumentType documentType = DocumentTypeMapper.toEntity(request);
        DocumentType savedDocumentType = documentTypeRepository.save(documentType);

        log.info("Type de document créé avec succès avec l'ID : {}", savedDocumentType.getId());
        return DocumentTypeMapper.toDto(savedDocumentType);
    }

    /**
     * Mettre à jour un type de document existant
     * @param id l'ID du type de document à mettre à jour
     * @param request les nouvelles données
     * @return le type de document mis à jour
     * @throws RuntimeException si le type de document n'est pas trouvé ou si le code/nom existe déjà
     */
    @Transactional
    public DocumentTypeDto updateDocumentType(Long id, DocumentTypeRequest request) {
        log.info("Mise à jour du type de document avec l'ID : {}", id);

        DocumentType existingDocumentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type de document non trouvé avec l'ID : " + id));

        // Vérifier l'unicité du code (si changé)
        String newCode = request.getCode().toUpperCase();
        if (!existingDocumentType.getCode().equals(newCode) && documentTypeRepository.existsByCode(newCode)) {
            throw new RuntimeException("Un type de document avec le code '" + newCode + "' existe déjà");
        }

        // Vérifier l'unicité du nom (si changé)
        if (!existingDocumentType.getName().equals(request.getName()) && documentTypeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Un type de document avec le nom '" + request.getName() + "' existe déjà");
        }

        DocumentTypeMapper.updateFromRequest(existingDocumentType, request);
        DocumentType updatedDocumentType = documentTypeRepository.save(existingDocumentType);

        log.info("Type de document mis à jour avec succès");
        return DocumentTypeMapper.toDto(updatedDocumentType);
    }

    /**
     * Supprimer un type de document
     * @param id l'ID du type de document à supprimer
     * @throws RuntimeException si le type de document n'est pas trouvé
     */
    @Transactional
    public void deleteDocumentType(Long id) {
        log.info("Suppression du type de document avec l'ID : {}", id);

        if (!documentTypeRepository.existsById(id)) {
            throw new RuntimeException("Type de document non trouvé avec l'ID : " + id);
        }

        documentTypeRepository.deleteById(id);
        log.info("Type de document supprimé avec succès");
    }

    /**
     * Activer/désactiver un type de document
     * @param id l'ID du type de document
     * @param isActive le nouvel état d'activation
     * @return le type de document mis à jour
     */
    @Transactional
    public DocumentTypeDto toggleDocumentTypeStatus(Long id, Boolean isActive) {
        log.info("Changement du statut du type de document avec l'ID : {} vers {}", id, isActive);

        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type de document non trouvé avec l'ID : " + id));

        documentType.setIsActive(isActive);
        DocumentType updatedDocumentType = documentTypeRepository.save(documentType);

        log.info("Statut du type de document mis à jour avec succès");
        return DocumentTypeMapper.toDto(updatedDocumentType);
    }

    /**
     * Rechercher des types de documents par nom ou description
     * @param searchTerm le terme de recherche
     * @return liste des types de documents correspondants
     */
    public List<DocumentTypeDto> searchDocumentTypes(String searchTerm) {
        log.info("Recherche de types de documents avec le terme : {}", searchTerm);
        List<DocumentType> documentTypes = documentTypeRepository.searchByNameOrDescription(searchTerm);
        return DocumentTypeMapper.toDtoList(documentTypes);
    }

    /**
     * Obtenir des types de documents par extension de fichier
     * @param extension l'extension de fichier
     * @return liste des types de documents correspondants
     */
    public List<DocumentTypeDto> getDocumentTypesByFileExtension(String extension) {
        log.info("Récupération des types de documents pour l'extension : {}", extension);
        List<DocumentType> documentTypes = documentTypeRepository.findByFileExtension(extension);
        return DocumentTypeMapper.toDtoList(documentTypes);
    }

    /**
     * Obtenir des types de documents simplifiés pour les sélections
     * @return liste des types de documents simplifiés
     */
    public List<DocumentTypeDto> getSimpleDocumentTypes() {
        log.info("Récupération des types de documents simplifiés pour sélection");
        List<DocumentType> documentTypes = documentTypeRepository.findAllActiveOrderBySortOrder();
        return DocumentTypeMapper.toSimpleDtoList(documentTypes);
    }

    /**
     * Initialiser les types de documents par défaut si aucun n'existe
     */
    @Transactional
    public void initializeDefaultDocumentTypes() {
        if (documentTypeRepository.count() == 0) {
            log.info("Initialisation des types de documents par défaut");

            // Types de documents de base
            createDefaultDocumentType("Document général", "Document générique", "DOCUMENT", "file", "#1890ff");
            createDefaultDocumentType("Document PDF", "Document au format PDF", "PDF", "file-pdf", "#f5222d");
            createDefaultDocumentType("Document Word", "Document Microsoft Word", "WORD", "file-word", "#1677ff");
            createDefaultDocumentType("Tableur Excel", "Feuille de calcul Microsoft Excel", "EXCEL", "file-excel", "#52c41a");
            createDefaultDocumentType("Présentation PowerPoint", "Présentation Microsoft PowerPoint", "POWERPOINT", "file-ppt", "#fa8c16");
            createDefaultDocumentType("Image", "Fichier image", "IMAGE", "file-image", "#722ed1");
            createDefaultDocumentType("Archive", "Fichier d'archive compressé", "ARCHIVE", "file-zip", "#13c2c2");

            log.info("Types de documents par défaut initialisés");
        }
    }

    /**
     * Méthode utilitaire pour créer un type de document par défaut
     */
    private void createDefaultDocumentType(String name, String description, String code, String icon, String color) {
        DocumentType documentType = new DocumentType(name, description, code, icon, color);
        documentType.setSortOrder(documentTypeRepository.getNextSortOrder());
        documentTypeRepository.save(documentType);
    }
}

package com.harmony.harmoniservices.services;

import com.harmony.harmoniservices.dto.FileSchemeDto;
import com.harmony.harmoniservices.mappers.FileSchemeMapper;
import com.harmony.harmoniservices.models.DocumentType;
import com.harmony.harmoniservices.models.FileScheme;
import com.harmony.harmoniservices.repository.DocumentTypeRepository;
import com.harmony.harmoniservices.repository.FileSchemeRepository;
import com.harmony.harmoniservices.requests.FileSchemeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour la gestion des schémas de fichiers
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class FileSchemeService {

    private final FileSchemeRepository fileSchemeRepository;
    private final DocumentTypeRepository documentTypeRepository;

    /**
     * Obtenir tous les schémas de fichiers actifs
     * @return liste des schémas actifs
     */
    public List<FileSchemeDto> getAllActiveFileSchemes() {
        log.info("Récupération de tous les schémas de fichiers actifs");
        List<FileScheme> fileSchemes = fileSchemeRepository.findAllActiveOrderBySortOrder();
        return FileSchemeMapper.toSimpleDtoList(fileSchemes);
    }

    /**
     * Obtenir tous les schémas de fichiers (actifs et inactifs)
     * @return liste de tous les schémas
     */
    public List<FileSchemeDto> getAllFileSchemes() {
        log.info("Récupération de tous les schémas de fichiers");
        List<FileScheme> fileSchemes = fileSchemeRepository.findAllOrderBySortOrder();
        return FileSchemeMapper.toSimpleDtoList(fileSchemes);
    }

    /**
     * Obtenir l'arbre complet des schémas (racines avec enfants)
     * @return liste des schémas racines avec leurs enfants
     */
    public List<FileSchemeDto> getFileSchemeTree() {
        log.info("Récupération de l'arbre des schémas de fichiers");
        List<FileScheme> rootSchemes = fileSchemeRepository.findAllRootSchemes();
        return FileSchemeMapper.toTreeDtoList(rootSchemes);
    }

    /**
     * Obtenir un schéma de fichier par son ID
     * @param id l'ID du schéma
     * @return le schéma trouvé
     * @throws RuntimeException si le schéma n'est pas trouvé
     */
    public FileSchemeDto getFileSchemeById(Long id) {
        log.info("Récupération du schéma de fichier avec l'ID : {}", id);
        FileScheme fileScheme = fileSchemeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schéma de fichier non trouvé avec l'ID : " + id));
        return FileSchemeMapper.toDto(fileScheme);
    }

    /**
     * Obtenir les enfants d'un schéma par ID parent
     * @param parentId l'ID du parent
     * @return liste des enfants
     */
    public List<FileSchemeDto> getChildrenByParentId(Long parentId) {
        log.info("Récupération des enfants pour le parent ID : {}", parentId);
        List<FileScheme> children = fileSchemeRepository.findByParentId(parentId);
        return FileSchemeMapper.toSimpleDtoList(children);
    }

    /**
     * Créer un nouveau schéma de fichier
     * @param request les données du schéma à créer
     * @return le schéma créé
     * @throws RuntimeException si les données sont invalides
     */
    @Transactional
    public FileSchemeDto createFileScheme(FileSchemeRequest request) {
        log.info("Création d'un nouveau schéma de fichier : {}", request.getLabel());

        // Validation de la requête
        if (!request.isValid()) {
            throw new RuntimeException(request.getValidationError());
        }

        // Vérifier l'unicité du label au même niveau
        if (fileSchemeRepository.existsByLabelAndParentId(request.getLabel(), request.getParentId())) {
            throw new RuntimeException("Un schéma avec le label '" + request.getLabel() + 
                "' existe déjà à ce niveau");
        }

        FileScheme fileScheme = FileSchemeMapper.toEntity(request);

        // Définir le parent si spécifié
        if (request.getParentId() != null) {
            FileScheme parent = fileSchemeRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent non trouvé avec l'ID : " + request.getParentId()));
            fileScheme.setParent(parent);
        }

        // Définir le type de document si spécifié (pour les fichiers)
        if (request.getDocumentTypeId() != null) {
            DocumentType documentType = documentTypeRepository.findById(request.getDocumentTypeId())
                    .orElseThrow(() -> new RuntimeException("Type de document non trouvé avec l'ID : " + request.getDocumentTypeId()));
            fileScheme.setDocumentType(documentType);
            
            // Mettre à jour l'icône et la couleur selon le type de document
            fileScheme.setIconSeries(documentType.getIcon());
            fileScheme.setColorSeries(documentType.getColor());
        }

        // Définir l'ordre de tri si non spécifié
        if (request.getSortOrder() == null || request.getSortOrder() == 0) {
            Integer nextSortOrder = fileSchemeRepository.getNextSortOrderForParent(request.getParentId());
            fileScheme.setSortOrder(nextSortOrder);
        }

        FileScheme savedFileScheme = fileSchemeRepository.save(fileScheme);

        log.info("Schéma de fichier créé avec succès avec l'ID : {}", savedFileScheme.getId());
        return FileSchemeMapper.toDto(savedFileScheme);
    }

    /**
     * Mettre à jour un schéma de fichier existant
     * @param id l'ID du schéma à mettre à jour
     * @param request les nouvelles données
     * @return le schéma mis à jour
     * @throws RuntimeException si le schéma n'est pas trouvé ou si les données sont invalides
     */
    @Transactional
    public FileSchemeDto updateFileScheme(Long id, FileSchemeRequest request) {
        log.info("Mise à jour du schéma de fichier avec l'ID : {}", id);

        // Validation de la requête
        if (!request.isValid()) {
            throw new RuntimeException(request.getValidationError());
        }

        FileScheme existingFileScheme = fileSchemeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schéma de fichier non trouvé avec l'ID : " + id));

        // Vérifier l'unicité du label au même niveau (si changé)
        if (!existingFileScheme.getLabel().equals(request.getLabel()) && 
            fileSchemeRepository.existsByLabelAndParentIdExcludingId(request.getLabel(), request.getParentId(), id)) {
            throw new RuntimeException("Un schéma avec le label '" + request.getLabel() + 
                "' existe déjà à ce niveau");
        }

        // Vérifier que le parent n'est pas un descendant (éviter les cycles)
        if (request.getParentId() != null && isDescendant(id, request.getParentId())) {
            throw new RuntimeException("Le parent spécifié créerait une référence circulaire");
        }

        FileSchemeMapper.updateFromRequest(existingFileScheme, request);

        // Mettre à jour le parent si nécessaire
        if (request.getParentId() != null) {
            if (existingFileScheme.getParent() == null || 
                !existingFileScheme.getParent().getId().equals(request.getParentId())) {
                FileScheme parent = fileSchemeRepository.findById(request.getParentId())
                        .orElseThrow(() -> new RuntimeException("Parent non trouvé avec l'ID : " + request.getParentId()));
                existingFileScheme.setParent(parent);
            }
        } else {
            existingFileScheme.setParent(null);
        }

        // Mettre à jour le type de document si nécessaire
        if (request.getDocumentTypeId() != null) {
            if (existingFileScheme.getDocumentType() == null || 
                !existingFileScheme.getDocumentType().getId().equals(request.getDocumentTypeId())) {
                DocumentType documentType = documentTypeRepository.findById(request.getDocumentTypeId())
                        .orElseThrow(() -> new RuntimeException("Type de document non trouvé avec l'ID : " + request.getDocumentTypeId()));
                existingFileScheme.setDocumentType(documentType);
                
                // Mettre à jour l'icône et la couleur selon le type de document
                existingFileScheme.setIconSeries(documentType.getIcon());
                existingFileScheme.setColorSeries(documentType.getColor());
            }
        } else {
            existingFileScheme.setDocumentType(null);
        }

        FileScheme updatedFileScheme = fileSchemeRepository.save(existingFileScheme);

        log.info("Schéma de fichier mis à jour avec succès");
        return FileSchemeMapper.toDto(updatedFileScheme);
    }

    /**
     * Supprimer un schéma de fichier
     * @param id l'ID du schéma à supprimer
     * @throws RuntimeException si le schéma n'est pas trouvé ou a des enfants
     */
    @Transactional
    public void deleteFileScheme(Long id) {
        log.info("Suppression du schéma de fichier avec l'ID : {}", id);

        FileScheme fileScheme = fileSchemeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schéma de fichier non trouvé avec l'ID : " + id));

        // Vérifier qu'il n'y a pas d'enfants
        if (!fileSchemeRepository.canBeDeleted(id)) {
            throw new RuntimeException("Impossible de supprimer le schéma car il contient des éléments enfants");
        }

        fileSchemeRepository.deleteById(id);
        log.info("Schéma de fichier supprimé avec succès");
    }

    /**
     * Changer le statut d'activation d'un schéma
     * @param id l'ID du schéma
     * @param isActive le nouveau statut
     * @return le schéma mis à jour
     */
    @Transactional
    public FileSchemeDto toggleFileSchemeStatus(Long id, Boolean isActive) {
        log.info("Changement du statut du schéma avec l'ID : {} vers {}", id, isActive);

        FileScheme fileScheme = fileSchemeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schéma de fichier non trouvé avec l'ID : " + id));

        fileScheme.setIsActive(isActive);
        FileScheme updatedFileScheme = fileSchemeRepository.save(fileScheme);

        log.info("Statut du schéma mis à jour avec succès");
        return FileSchemeMapper.toDto(updatedFileScheme);
    }

    /**
     * Rechercher des schémas par label ou description
     * @param searchTerm le terme de recherche
     * @return liste des schémas correspondants
     */
    public List<FileSchemeDto> searchFileSchemes(String searchTerm) {
        log.info("Recherche de schémas avec le terme : {}", searchTerm);
        List<FileScheme> fileSchemes = fileSchemeRepository.searchByLabelOrDescription(searchTerm);
        return FileSchemeMapper.toSimpleDtoList(fileSchemes);
    }

    /**
     * Obtenir tous les dossiers (répertoires)
     * @return liste des dossiers
     */
    public List<FileSchemeDto> getAllDirectories() {
        log.info("Récupération de tous les dossiers");
        List<FileScheme> directories = fileSchemeRepository.findAllDirectories();
        return FileSchemeMapper.toSimpleDtoList(directories);
    }

    /**
     * Obtenir tous les fichiers
     * @return liste des fichiers
     */
    public List<FileSchemeDto> getAllFiles() {
        log.info("Récupération de tous les fichiers");
        List<FileScheme> files = fileSchemeRepository.findAllFiles();
        return FileSchemeMapper.toSimpleDtoList(files);
    }

    /**
     * Obtenir les schémas par type de document
     * @param documentTypeId l'ID du type de document
     * @return liste des schémas correspondants
     */
    public List<FileSchemeDto> getFileSchemesByDocumentType(Long documentTypeId) {
        log.info("Récupération des schémas pour le type de document : {}", documentTypeId);
        List<FileScheme> fileSchemes = fileSchemeRepository.findByDocumentTypeId(documentTypeId);
        return FileSchemeMapper.toSimpleDtoList(fileSchemes);
    }

    /**
     * Nettoyer les schémas orphelins
     * @return nombre de schémas nettoyés
     */
    @Transactional
    public int cleanupOrphanedSchemes() {
        log.info("Nettoyage des schémas orphelins");
        List<FileScheme> orphaned = fileSchemeRepository.findOrphanedSchemes();
        for (FileScheme orphan : orphaned) {
            orphan.setParent(null);
            fileSchemeRepository.save(orphan);
        }
        log.info("Nettoyage terminé : {} schémas orphelins traités", orphaned.size());
        return orphaned.size();
    }

    /**
     * Vérifier si un schéma est descendant d'un autre (pour éviter les cycles)
     * @param ancestorId l'ID de l'ancêtre potentiel
     * @param descendantId l'ID du descendant potentiel
     * @return true si c'est un descendant, false sinon
     */
    private boolean isDescendant(Long ancestorId, Long descendantId) {
        if (ancestorId == null || descendantId == null || ancestorId.equals(descendantId)) {
            return false;
        }

        FileScheme current = fileSchemeRepository.findById(descendantId).orElse(null);
        while (current != null && current.getParent() != null) {
            if (current.getParent().getId().equals(ancestorId)) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    /**
     * Initialiser des schémas par défaut si aucun n'existe
     */
    @Transactional
    public void initializeDefaultFileSchemes() {
        if (fileSchemeRepository.count() == 0) {
            log.info("Initialisation des schémas de fichiers par défaut");

            // Créer des dossiers racines par défaut
            createDefaultDirectory("Documents", "Répertoire pour tous les documents");
            createDefaultDirectory("Archives", "Répertoire pour les documents archivés");
            createDefaultDirectory("Modèles", "Répertoire pour les modèles de documents");

            log.info("Schémas de fichiers par défaut initialisés");
        }
    }

    /**
     * Méthode utilitaire pour créer un répertoire par défaut
     */
    private void createDefaultDirectory(String label, String description) {
        FileScheme directory = new FileScheme(label, description);
        directory.setSortOrder(fileSchemeRepository.getNextSortOrderForParent(null));
        fileSchemeRepository.save(directory);
    }
}

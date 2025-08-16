package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.FileScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des schémas de fichiers
 */
@Repository
public interface FileSchemeRepository extends JpaRepository<FileScheme, Long> {

    /**
     * Trouver tous les schémas de fichiers racines (sans parent)
     * @return Liste des schémas racines
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.parent IS NULL AND fs.isActive = true ORDER BY fs.sortOrder ASC, fs.label ASC")
    List<FileScheme> findAllRootSchemes();

    /**
     * Trouver tous les schémas de fichiers actifs, ordonnés
     * @return Liste de tous les schémas actifs
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.isActive = true ORDER BY fs.sortOrder ASC, fs.label ASC")
    List<FileScheme> findAllActiveOrderBySortOrder();

    /**
     * Trouver tous les schémas de fichiers (actifs et inactifs), ordonnés
     * @return Liste de tous les schémas
     */
    @Query("SELECT fs FROM FileScheme fs ORDER BY fs.sortOrder ASC, fs.label ASC")
    List<FileScheme> findAllOrderBySortOrder();

    /**
     * Trouver les enfants d'un schéma de fichier par ID parent
     * @param parentId l'ID du parent
     * @return Liste des enfants
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.parent.id = :parentId AND fs.isActive = true ORDER BY fs.sortOrder ASC, fs.label ASC")
    List<FileScheme> findByParentId(@Param("parentId") Long parentId);

    /**
     * Trouver un schéma de fichier par son label
     * @param label le label du schéma
     * @return Optional contenant le schéma si trouvé
     */
    Optional<FileScheme> findByLabelAndIsActive(String label, Boolean isActive);

    /**
     * Vérifier si un label existe déjà au même niveau (même parent)
     * @param label le label à vérifier
     * @param parentId l'ID du parent (peut être null)
     * @return true si existe, false sinon
     */
    @Query("SELECT COUNT(fs) > 0 FROM FileScheme fs WHERE fs.label = :label AND " +
           "(:parentId IS NULL AND fs.parent IS NULL OR fs.parent.id = :parentId)")
    boolean existsByLabelAndParentId(@Param("label") String label, @Param("parentId") Long parentId);

    /**
     * Vérifier si un label existe déjà au même niveau (même parent) en excluant un ID spécifique
     * @param label le label à vérifier
     * @param parentId l'ID du parent (peut être null)
     * @param excludeId l'ID à exclure de la vérification
     * @return true si existe, false sinon
     */
    @Query("SELECT COUNT(fs) > 0 FROM FileScheme fs WHERE fs.label = :label AND " +
           "(:parentId IS NULL AND fs.parent IS NULL OR fs.parent.id = :parentId) AND " +
           "fs.id != :excludeId")
    boolean existsByLabelAndParentIdExcludingId(@Param("label") String label, 
                                                @Param("parentId") Long parentId, 
                                                @Param("excludeId") Long excludeId);

    /**
     * Trouver les schémas par type de document
     * @param documentTypeId l'ID du type de document
     * @return Liste des schémas correspondants
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.documentType.id = :documentTypeId AND fs.isActive = true ORDER BY fs.sortOrder ASC")
    List<FileScheme> findByDocumentTypeId(@Param("documentTypeId") Long documentTypeId);

    /**
     * Trouver les schémas de type dossier (isDirectory = true)
     * @return Liste des dossiers
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.isDirectory = true AND fs.isActive = true ORDER BY fs.sortOrder ASC, fs.label ASC")
    List<FileScheme> findAllDirectories();

    /**
     * Trouver les schémas de type fichier (isDirectory = false)
     * @return Liste des fichiers
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.isDirectory = false AND fs.isActive = true ORDER BY fs.sortOrder ASC, fs.label ASC")
    List<FileScheme> findAllFiles();

    /**
     * Rechercher des schémas par label ou description
     * @param searchTerm le terme de recherche
     * @return Liste des schémas correspondants
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.isActive = true AND " +
           "(LOWER(fs.label) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(fs.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY fs.sortOrder ASC, fs.label ASC")
    List<FileScheme> searchByLabelOrDescription(@Param("searchTerm") String searchTerm);

    /**
     * Obtenir l'arbre complet des schémas avec leurs enfants
     * @return Liste des schémas racines avec leurs enfants
     */
    @Query("SELECT fs FROM FileScheme fs LEFT JOIN FETCH fs.children WHERE fs.parent IS NULL AND fs.isActive = true ORDER BY fs.sortOrder ASC")
    List<FileScheme> findRootSchemesWithChildren();

    /**
     * Obtenir le prochain numéro d'ordre disponible pour un parent donné
     * @param parentId l'ID du parent (peut être null)
     * @return le prochain numéro d'ordre
     */
    @Query("SELECT COALESCE(MAX(fs.sortOrder), 0) + 1 FROM FileScheme fs WHERE " +
           "(:parentId IS NULL AND fs.parent IS NULL OR fs.parent.id = :parentId)")
    Integer getNextSortOrderForParent(@Param("parentId") Long parentId);

    /**
     * Compter le nombre d'enfants d'un schéma
     * @param parentId l'ID du parent
     * @return nombre d'enfants
     */
    @Query("SELECT COUNT(fs) FROM FileScheme fs WHERE fs.parent.id = :parentId AND fs.isActive = true")
    Long countChildrenByParentId(@Param("parentId") Long parentId);

    /**
     * Trouver tous les descendants d'un schéma (récursif)
     * @param parentId l'ID du parent
     * @return Liste de tous les descendants
     */
    @Query(value = "WITH RECURSIVE scheme_tree AS (" +
           "SELECT * FROM file_schemes WHERE parent_id = :parentId " +
           "UNION ALL " +
           "SELECT fs.* FROM file_schemes fs " +
           "INNER JOIN scheme_tree st ON fs.parent_id = st.id" +
           ") SELECT * FROM scheme_tree ORDER BY sort_order ASC, label ASC", 
           nativeQuery = true)
    List<FileScheme> findAllDescendants(@Param("parentId") Long parentId);

    /**
     * Vérifier si un schéma peut être supprimé (n'a pas d'enfants)
     * @param schemeId l'ID du schéma
     * @return true si peut être supprimé, false sinon
     */
    @Query("SELECT COUNT(fs) = 0 FROM FileScheme fs WHERE fs.parent.id = :schemeId")
    boolean canBeDeleted(@Param("schemeId") Long schemeId);

    /**
     * Trouver les schémas orphelins (parent supprimé)
     * @return Liste des schémas orphelins
     */
    @Query("SELECT fs FROM FileScheme fs WHERE fs.parent IS NOT NULL AND " +
           "NOT EXISTS (SELECT 1 FROM FileScheme p WHERE p.id = fs.parent.id)")
    List<FileScheme> findOrphanedSchemes();
}

package com.harmony.harmoniservices.repository;

import com.harmony.harmoniservices.models.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour la gestion des types de documents
 */
@Repository
public interface DocumentTypeRepository extends JpaRepository<DocumentType, Long> {

    /**
     * Trouver un type de document par son code
     * @param code le code du type de document
     * @return Optional contenant le type de document si trouvé
     */
    Optional<DocumentType> findByCode(String code);

    /**
     * Trouver un type de document par son nom
     * @param name le nom du type de document
     * @return Optional contenant le type de document si trouvé
     */
    Optional<DocumentType> findByName(String name);

    /**
     * Vérifier si un type de document existe par son code
     * @param code le code à vérifier
     * @return true si existe, false sinon
     */
    boolean existsByCode(String code);

    /**
     * Vérifier si un type de document existe par son nom
     * @param name le nom à vérifier
     * @return true si existe, false sinon
     */
    boolean existsByName(String name);

    /**
     * Trouver tous les types de documents actifs, ordonnés par sortOrder puis par nom
     * @return Liste des types de documents actifs
     */
    @Query("SELECT dt FROM DocumentType dt WHERE dt.isActive = true ORDER BY dt.sortOrder ASC, dt.name ASC")
    List<DocumentType> findAllActiveOrderBySortOrder();

    /**
     * Trouver tous les types de documents, ordonnés par sortOrder puis par nom
     * @return Liste de tous les types de documents
     */
    @Query("SELECT dt FROM DocumentType dt ORDER BY dt.sortOrder ASC, dt.name ASC")
    List<DocumentType> findAllOrderBySortOrder();

    /**
     * Trouver des types de documents par extension de fichier
     * @param extension l'extension de fichier
     * @return Liste des types de documents correspondants
     */
    @Query("SELECT dt FROM DocumentType dt WHERE dt.isActive = true AND dt.fileExtension = :extension ORDER BY dt.sortOrder ASC")
    List<DocumentType> findByFileExtension(@Param("extension") String extension);

    /**
     * Trouver des types de documents par type MIME
     * @param mimeType le type MIME
     * @return Liste des types de documents correspondants
     */
    @Query("SELECT dt FROM DocumentType dt WHERE dt.isActive = true AND dt.mimeType = :mimeType ORDER BY dt.sortOrder ASC")
    List<DocumentType> findByMimeType(@Param("mimeType") String mimeType);

    /**
     * Rechercher des types de documents par nom ou description
     * @param searchTerm le terme de recherche
     * @return Liste des types de documents correspondants
     */
    @Query("SELECT dt FROM DocumentType dt WHERE dt.isActive = true AND " +
           "(LOWER(dt.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(dt.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY dt.sortOrder ASC, dt.name ASC")
    List<DocumentType> searchByNameOrDescription(@Param("searchTerm") String searchTerm);

    /**
     * Obtenir le prochain numéro d'ordre disponible
     * @return le prochain numéro d'ordre
     */
    @Query("SELECT COALESCE(MAX(dt.sortOrder), 0) + 1 FROM DocumentType dt")
    Integer getNextSortOrder();
}

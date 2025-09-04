package com.harmony.harmoniservices.config;

import com.github.javafaker.Faker;
import com.harmony.harmoniservices.enums.UserStatus;
import com.harmony.harmoniservices.models.FileScheme;
import com.harmony.harmoniservices.models.DocumentType;
import com.harmony.harmoniservices.models.UserEntity;
import com.harmony.harmoniservices.repository.FileSchemeRepository;
import com.harmony.harmoniservices.repository.DocumentTypeRepository;
import com.harmony.harmoniservices.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
@Profile("dev")
@Order(10)
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FileSchemeRepository fileSchemeRepository;
    private final DocumentTypeRepository documentTypeRepository;

    private final Faker faker = Faker.instance(new Locale("fr"));

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedDocumentTypes();
        seedFileSchemes();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            log.info("Users already present, skipping user seeding");
            return;
        }
        log.info("Seeding fake users...");
        List<UserEntity> users = new ArrayList<>();
        for (int i = 1; i <= 30; i++) {
            String firstName = faker.name().firstName();
            String lastName = faker.name().lastName();
            String username = (firstName + "." + lastName).toLowerCase();
            String email = username + i + "@example.com"; // ensure unique emails

            UserEntity user = UserEntity.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .username(username)
                    .email(email)
                    .phone(faker.phoneNumber().cellPhone())
                    .password("$2a$10$zTH2gtq0v5fOt.ell8ZJFuUg7pYNsq61qsG6xSFwa1QVPeEBMkq3q") // dummy hashed-like string
                    .profilePicture("https://i.pravatar.cc/150?img=" + i)
                    .status(UserStatus.ACTIVE)
                    .role(faker.options().option("ADMIN", "USER", "MANAGER"))
                    .theme(faker.options().option("light", "dark"))
                    .createdAt(LocalDateTime.now().minusDays(faker.number().numberBetween(1, 90)))
                    .updatedAt(LocalDateTime.now())
                    .build();
            users.add(user);
        }
        userRepository.saveAll(users);
        log.info("Seeded {} users", users.size());
    }

    private void seedFileSchemes() {
        if (fileSchemeRepository.count() > 0) {
            log.info("File schemes already present, skipping file scheme seeding");
            return;
        }
        log.info("Seeding file schemes (folders and files)...");

        // Create a few root directories
        FileScheme rootDocs = new FileScheme("Documents", "Répertoire des documents");
        FileScheme rootProjects = new FileScheme("Projets", "Répertoire des projets");
        FileScheme rootHR = new FileScheme("Ressources Humaines", "Dossiers RH");

        // Children for Documents
        FileScheme invoices = new FileScheme("Factures", "Factures clients et fournisseurs", rootDocs);
        FileScheme reports = new FileScheme("Rapports", "Rapports mensuels et annuels", rootDocs);
        FileScheme policies = new FileScheme("Politiques", "Politiques internes", rootDocs);

        // Children for Projets
        FileScheme pAlpha = new FileScheme("Projet Alpha", "Documents du projet Alpha", rootProjects);
        FileScheme pBeta = new FileScheme("Projet Beta", "Documents du projet Beta", rootProjects);

        // Children for RH
        FileScheme employees = new FileScheme("Employés", "Dossiers des employés", rootHR);
        FileScheme recruit = new FileScheme("Recrutement", "Candidatures et entretiens", rootHR);

        // Save roots first
        fileSchemeRepository.saveAll(Arrays.asList(rootDocs, rootProjects, rootHR));

        // Save children
        fileSchemeRepository.saveAll(Arrays.asList(
                invoices, reports, policies, pAlpha, pBeta, employees, recruit
        ));

        // Add deeper children
        FileScheme invoices2024 = new FileScheme("2024", "Factures 2024", invoices);
        FileScheme invoices2025 = new FileScheme("2025", "Factures 2025", invoices);
        FileScheme rHContracts = new FileScheme("Contrats", "Contrats de travail", employees);
        FileScheme rHReviews = new FileScheme("Évaluations", "Évaluations annuelles", employees);

        fileSchemeRepository.saveAll(Arrays.asList(invoices2024, invoices2025, rHContracts, rHReviews));

        // Create sample file entries linked to DocumentTypes
        DocumentType invoiceDt = documentTypeRepository.findByCode("INV_PDF").orElse(null);
        DocumentType reportDt = documentTypeRepository.findByCode("RPT_DOCX").orElse(null);
        DocumentType policyDt = documentTypeRepository.findByCode("POL_PDF").orElse(null);

        List<FileScheme> fileEntries = new ArrayList<>();
        if (invoiceDt != null) {
            FileScheme inv1 = new FileScheme("Facture-2024-0001.pdf", "Facture client", invoiceDt);
            inv1.setParent(invoices2024);
            FileScheme inv2 = new FileScheme("Facture-2024-0002.pdf", "Facture client", invoiceDt);
            inv2.setParent(invoices2024);
            fileEntries.add(inv1);
            fileEntries.add(inv2);
        }
        if (reportDt != null) {
            FileScheme rpt1 = new FileScheme("Rapport-Mensuel-01.docx", "Rapport mensuel", reportDt);
            rpt1.setParent(reports);
            fileEntries.add(rpt1);
        }
        if (policyDt != null) {
            FileScheme pol1 = new FileScheme("Politique-Securite.pdf", "Politique interne", policyDt);
            pol1.setParent(policies);
            fileEntries.add(pol1);
        }

        if (!fileEntries.isEmpty()) {
            fileSchemeRepository.saveAll(fileEntries);
        }

        log.info("Seeded FileSchemes: {} roots and children", fileSchemeRepository.count());
    }

    private void seedDocumentTypes() {
        // Seed a small catalog of document types if they don't exist
        log.info("Ensuring base DocumentTypes exist...");
        List<DocumentType> toCreate = new ArrayList<>();

        if (!documentTypeRepository.existsByCode("INV_PDF")) {
            toCreate.add(new DocumentType(
                    "Facture PDF",
                    "Factures au format PDF",
                    "INV_PDF",
                    "file-pdf",
                    "#e74c3c"
            ));
        }

        if (!documentTypeRepository.existsByCode("RPT_DOCX")) {
            toCreate.add(new DocumentType(
                    "Rapport DOCX",
                    "Rapports Word",
                    "RPT_DOCX",
                    "file-word",
                    "#2980b9"
            ));
        }

        if (!documentTypeRepository.existsByCode("POL_PDF")) {
            toCreate.add(new DocumentType(
                    "Politique PDF",
                    "Politiques internes",
                    "POL_PDF",
                    "file-pdf",
                    "#8e44ad"
            ));
        }

        if (!toCreate.isEmpty()) {
            documentTypeRepository.saveAll(toCreate);
            log.info("Seeded {} DocumentTypes", toCreate.size());
        } else {
            log.info("DocumentTypes already present");
        }
    }
}

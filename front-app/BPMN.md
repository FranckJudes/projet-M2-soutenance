Dans un diagramme **BPMN (Business Process Model and Notation)**, les **éléments composites** sont des éléments qui permettent de structurer et d'organiser les processus de manière hiérarchique ou complexe. Ils incluent des sous-processus, des événements, des gateways, et d'autres éléments qui aident à modéliser des flux de travail détaillés. Voici une liste exhaustive de tous les éléments composites dans BPMN :

---

### 1. **Sous-processus (Sub-Process)**
- **Description** : Un sous-processus est une activité composite qui contient d'autres activités, événements, ou sous-processus.
- **Types** :
  - **Sous-processus embarqué** : Défini directement dans le diagramme.
  - **Sous-processus réutilisable** : Défini ailleurs et référencé dans le diagramme.
  - **Sous-processus transactionnel** : Un sous-processus qui représente une transaction (peut être annulé).
- **Symbole** : Un rectangle avec des coins arrondis et un petit signe "+" dans le coin inférieur.

---

### 2. **Événements (Events)**
Les événements sont des éléments qui représentent quelque chose qui se produit pendant l'exécution d'un processus. Ils peuvent être déclencheurs (start) ou résultats (end).

#### a. **Événement de début (Start Event)**
- **Description** : Marque le début d'un processus ou d'un sous-processus.
- **Types** :
  - **Simple** : Démarre le processus sans condition.
  - **Message** : Déclenché par la réception d'un message.
  - **Timer** : Déclenché par un événement temporel.
  - **Conditionnel** : Déclenché par une condition métier.
  - **Signal** : Déclenché par un signal.
- **Symbole** : Un cercle vide avec un contour fin.

#### b. **Événement intermédiaire (Intermediate Event)**
- **Description** : Se produit pendant l'exécution du processus.
- **Types** :
  - **Message** : Envoie ou reçoit un message.
  - **Timer** : Attend un événement temporel.
  - **Signal** : Envoie ou reçoit un signal.
  - **Conditionnel** : Réagit à une condition métier.
- **Symbole** : Un cercle avec un double contour.

#### c. **Événement de fin (End Event)**
- **Description** : Marque la fin d'un processus ou d'un sous-processus.
- **Types** :
  - **Simple** : Termine le processus sans condition.
  - **Message** : Envoie un message à la fin.
  - **Signal** : Envoie un signal à la fin.
  - **Terminate** : Termine immédiatement le processus.
- **Symbole** : Un cercle avec un contour épais.

---

### 3. **Gateways (Connecteurs logiques)**
Les gateways sont des éléments qui contrôlent le flux du processus en fonction de conditions ou de règles.

#### a. **Gateway exclusif (Exclusive Gateway)**
- **Description** : Dirige le flux vers une seule branche parmi plusieurs, en fonction d'une condition.
- **Symbole** : Un losange avec un "X" à l'intérieur.

#### b. **Gateway parallèle (Parallel Gateway)**
- **Description** : Divise le flux en plusieurs branches parallèles ou synchronise plusieurs branches.
- **Symbole** : Un losange avec un "+" à l'intérieur.

#### c. **Gateway inclusif (Inclusive Gateway)**
- **Description** : Dirige le flux vers une ou plusieurs branches, en fonction de conditions.
- **Symbole** : Un losange avec un cercle à l'intérieur.

#### d. **Gateway basé sur les événements (Event-Based Gateway)**
- **Description** : Dirige le flux en fonction d'un événement (par exemple, un message ou un timer).
- **Symbole** : Un losange avec un cercle et une icône d'événement à l'intérieur.

---

### 4. **Pools et Lanes (Pools and Lanes)**
- **Description** : Les pools et les lanes sont utilisés pour organiser les activités par participant ou par rôle.
  - **Pool** : Représente un participant indépendant dans le processus (par exemple, une organisation ou un système).
  - **Lane** : Subdivise un pool pour représenter des rôles ou des responsabilités spécifiques.
- **Symbole** : Un rectangle divisé en sections horizontales ou verticales.

---

### 5. **Objets de données (Data Objects)**
- **Description** : Représentent des données ou des informations utilisées dans le processus.
- **Types** :
  - **Objet de données (Data Object)** : Une donnée spécifique.
  - **Collection de données (Data Store)** : Un stockage de données persistant.
- **Symbole** : Un rectangle avec un coin plié (pour les objets de données) ou un cylindre (pour les collections de données).

---

### 6. **Annotations (Text Annotations)**
- **Description** : Permettent d'ajouter des informations supplémentaires ou des commentaires au diagramme.
- **Symbole** : Une zone de texte avec une ligne pointillée reliant l'annotation à un élément du diagramme.

---

### 7. **Groupes (Groups)**
- **Description** : Permettent de regrouper visuellement des éléments sans affecter le flux du processus.
- **Symbole** : Un rectangle avec des coins arrondis et une bordure en pointillés.

---

### 8. **Flux de séquence (Sequence Flow)**
- **Description** : Représente l'ordre d'exécution des activités dans un processus.
- **Symbole** : Une flèche pleine reliant deux éléments.

---

### 9. **Flux de message (Message Flow)**
- **Description** : Représente les échanges de messages entre participants (pools).
- **Symbole** : Une flèche en pointillés reliant deux pools.

---

### 10. **Associations (Associations)**
- **Description** : Relie des éléments (par exemple, une annotation à une activité) pour fournir des informations supplémentaires.
- **Symbole** : Une ligne pointillée avec une flèche.

---

### 11. **Artéfacts (Artifacts)**
- **Description** : Éléments supplémentaires pour enrichir le diagramme sans affecter le flux du processus.
- **Types** :
  - **Groupes** : Pour regrouper des éléments.
  - **Annotations** : Pour ajouter des commentaires.
  - **Objets de données** : Pour représenter des données.

---

### 12. **Transactions (Transactions)**
- **Description** : Un sous-processus spécial qui représente une transaction (peut être annulé ou compensé).
- **Symbole** : Un rectangle avec des coins arrondis et une double bordure.

---

### 13. **Compensation (Compensation)**
- **Description** : Un mécanisme pour annuler ou compenser les effets d'une activité.
- **Symbole** : Une flèche avec une icône de compensation (une flèche en boucle).

---

### 14. **Boucles (Loops)**
- **Description** : Permettent de répéter une activité ou un sous-processus jusqu'à ce qu'une condition soit remplie.
- **Symbole** : Une icône de boucle sur une activité ou un sous-processus.

---

### 15. **Multi-instances (Multi-Instances)**
- **Description** : Permettent d'exécuter une activité ou un sous-processus plusieurs fois, en parallèle ou en séquence.
- **Symbole** : Trois petites lignes verticales sur une activité ou un sous-processus.

---

### Conclusion

Les éléments composites dans BPMN permettent de modéliser des processus complexes et détaillés en structurant les activités, les événements, les décisions, et les flux de données. Chaque élément a un rôle spécifique et est représenté par un symbole unique, ce qui facilite la compréhension et la communication des processus métier.
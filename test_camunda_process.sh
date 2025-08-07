#!/bin/bash

# Script de test pour le déploiement BPMN, la récupération des tâches et les notifications
# Ce script teste l'intégration de Camunda avec l'application

# Configuration
API_URL="http://localhost:8200/api"
BPMN_FILE="/home/gallagher/Documents/GitHub/projet-M2-soutenance/Numérisation.bpmn"
CONFIG_FILE="/home/gallagher/Documents/GitHub/projet-M2-soutenance/task_config.json"
MAX_ATTEMPTS=10
SLEEP_INTERVAL=5

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier si le serveur est accessible
check_server() {
    curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" > /dev/null
    if [ $? -ne 0 ]; then
        log_error "Le serveur n'est pas accessible. Vérifiez que l'application est en cours d'exécution."
        return 1
    fi
    return 0
}

# Créer le fichier de configuration des tâches
cat > "$CONFIG_FILE" << 'EOL'
[
  {
    "taskId": "Activity_0ijcvt8",
    "taskName": "Scanner documents",
    "taskType": "task",
    "assigneeUser": "1",
    "assigneeGroup": null,
    "assigneeEntity": null,
    "assigneeType": "user",
    "returnAllowed": false,
    "responsibleUser": null,
    "interestedUser": null,
    "board": "",
    "workInstructions": "",
    "expectedDeliverable": "",
    "category": null,
    "allDay": false,
    "durationValue": null,
    "durationUnit": "Minutes",
    "criticality": "1",
    "priority": "1",
    "conditionConfig": "{\"conditionVariables\":[]}",
    "selectedReminders": null,
    "extraConfig": null
  },
  {
    "taskId": "Activity_1f90ubw",
    "taskName": "Notifier responsable",
    "taskType": "task",
    "assigneeUser": "2",
    "assigneeGroup": null,
    "assigneeEntity": null,
    "assigneeType": "user",
    "returnAllowed": false,
    "responsibleUser": null,
    "interestedUser": null,
    "board": "",
    "workInstructions": "",
    "expectedDeliverable": "",
    "category": null,
    "allDay": false,
    "durationValue": null,
    "durationUnit": "Minutes",
    "criticality": "1",
    "priority": "1",
    "conditionConfig": "{\"conditionVariables\":[]}",
    "selectedReminders": null,
    "extraConfig": null
  },
  {
    "taskId": "Activity_15srjc3",
    "taskName": "Stocker et sauvegarder données",
    "taskType": "task",
    "assigneeUser": "1",
    "assigneeGroup": null,
    "assigneeEntity": null,
    "assigneeType": "user",
    "returnAllowed": false,
    "responsibleUser": null,
    "interestedUser": null,
    "board": "",
    "workInstructions": "",
    "expectedDeliverable": "",
    "category": null,
    "allDay": false,
    "durationValue": null,
    "durationUnit": "Minutes",
    "criticality": "1",
    "priority": "1",
    "conditionConfig": "{\"conditionVariables\":[]}",
    "selectedReminders": null,
    "extraConfig": null
  },
  {
    "taskId": "Activity_11ied6a",
    "taskName": "Collecter documents",
    "taskType": "task",
    "assigneeUser": "1",
    "assigneeGroup": null,
    "assigneeEntity": null,
    "assigneeType": "user",
    "returnAllowed": true,
    "responsibleUser": "1",
    "interestedUser": "1",
    "board": "tt",
    "workInstructions": "t",
    "expectedDeliverable": "t",
    "category": "technical",
    "allDay": false,
    "durationValue": null,
    "durationUnit": "Minutes",
    "criticality": "1",
    "priority": "1",
    "conditionConfig": "{\"conditionVariables\":[]}",
    "selectedReminders": null,
    "extraConfig": null
  }
]
EOL

# Vérifier si le serveur est accessible
log_info "Vérification de l'accessibilité du serveur..."
if ! check_server; then
    log_error "Impossible de se connecter au serveur. Vérifiez que l'application est en cours d'exécution."
    exit 1
fi

log_success "Serveur accessible. Poursuite des tests."

# Étape 2: Déploiement du processus BPMN
log_info "Étape 2: Déploiement du processus BPMN..."

# Lire le contenu du fichier de configuration
CONFIG_CONTENT=$(cat "$CONFIG_FILE")

DEPLOYMENT_RESPONSE=$(curl -s -X POST "$API_URL/process-engine/deploy" \
    -F "file=@$BPMN_FILE" \
    -F "configurations=$CONFIG_CONTENT")

echo "$DEPLOYMENT_RESPONSE" > deployment_response.json

# Vérifier si le déploiement a réussi
if echo "$DEPLOYMENT_RESPONSE" | grep -q '"success":true'; then
    # Extraction du processDefinitionKey avec grep et sed
    PROCESS_KEY=$(echo "$DEPLOYMENT_RESPONSE" | grep -o '"processDefinitionKey":"[^"]*"' | sed 's/"processDefinitionKey":"\([^"]*\)"/\1/')
    # Extraction du processDefinitionId avec grep et sed
    PROCESS_ID=$(echo "$DEPLOYMENT_RESPONSE" | grep -o '"processDefinitionId":"[^"]*"' | sed 's/"processDefinitionId":"\([^"]*\)"/\1/')
    log_success "Déploiement réussi. Process Key: $PROCESS_KEY, Process ID: $PROCESS_ID"
else
    log_error "Échec du déploiement. Réponse: $DEPLOYMENT_RESPONSE"
    exit 1
fi

# Étape 3: Vérification et création de l'utilisateur dans Camunda si nécessaire
log_info "Étape 3: Vérification et création de l'utilisateur dans Camunda..."

# Vérifier les mappings utilisateurs
USER_MAPPINGS_RESPONSE=$(curl -s "$API_URL/process-engine/diagnose/users")
echo "$USER_MAPPINGS_RESPONSE" > user_mappings_response.json

# Créer l'utilisateur 1 s'il n'existe pas déjà
CREATE_USER_RESPONSE=$(curl -s -X POST "$API_URL/process-engine/sync-user/1" \
    -H "Content-Type: application/json")
echo "$CREATE_USER_RESPONSE" > create_user_response.json
log_info "Synchronisation de l'utilisateur 1 dans Camunda: $CREATE_USER_RESPONSE"

# Étape 4: Démarrage d'une instance du processus
log_info "Étape 4: Démarrage d'une instance du processus..."

START_RESPONSE=$(curl -s -X POST "$API_URL/process-engine/start/$PROCESS_KEY" \
    -H "Content-Type: application/json" \
    -d "{}")

echo "$START_RESPONSE" > start_response.json

# Vérifier si le démarrage a réussi
if echo "$START_RESPONSE" | grep -q "id"; then
    INSTANCE_ID=$(echo "$START_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    log_success "Instance de processus démarrée avec succès. Instance ID: $INSTANCE_ID"
else
    log_error "Échec du démarrage de l'instance. Réponse: $START_RESPONSE"
    exit 1
fi

# Étape 5: Vérifier les tâches assignées à l'utilisateur
log_info "Étape 5: Vérification des tâches assignées à l'utilisateur 1..."

# Boucle pour vérifier les tâches (avec plusieurs tentatives)
TASKS_FOUND=false
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ] && [ "$TASKS_FOUND" = false ]; do
    log_info "Tentative $ATTEMPT de $MAX_ATTEMPTS pour récupérer les tâches..."
    
    TASKS_RESPONSE=$(curl -s -X GET "$API_URL/process-engine/tasks/my-tasks?userId=1" \
        -H "Content-Type: application/json")
    
    echo "$TASKS_RESPONSE" > tasks_response_$ATTEMPT.json
    
    # Vérifier si des tâches sont retournées
    if echo "$TASKS_RESPONSE" | grep -q "\"id\""; then
        TASK_COUNT=$(echo "$TASKS_RESPONSE" | grep -o "\"id\"" | wc -l)
        if [ $TASK_COUNT -gt 0 ]; then
            log_success "Tâches trouvées pour l'utilisateur 1. Nombre de tâches: $TASK_COUNT"
            TASKS_FOUND=true
            
            # Extraire et afficher les détails des tâches
            echo "$TASKS_RESPONSE" | jq '.' > tasks_details.json
            log_info "Détails des tâches sauvegardés dans tasks_details.json"
            
            # Extraire le premier ID de tâche pour les tests suivants
            FIRST_TASK_ID=$(echo "$TASKS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
            log_info "Premier ID de tâche: $FIRST_TASK_ID"
        else
            log_info "Aucune tâche trouvée pour l'utilisateur 1. Nouvelle tentative dans $SLEEP_INTERVAL secondes..."
            sleep $SLEEP_INTERVAL
        fi
    else
        log_info "Aucune tâche trouvée pour l'utilisateur 1. Nouvelle tentative dans $SLEEP_INTERVAL secondes..."
        sleep $SLEEP_INTERVAL
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

if [ "$TASKS_FOUND" = false ]; then
    log_error "Échec de la récupération des tâches après $MAX_ATTEMPTS tentatives."
    exit 1
fi

# Étape 5: Vérifier les détails d'une tâche spécifique
log_info "Étape 5: Vérification des détails de la tâche $FIRST_TASK_ID..."

TASK_DETAILS_RESPONSE=$(curl -s -X GET "$API_URL/process-engine/tasks/$FIRST_TASK_ID" \
    -H "Content-Type: application/json")

echo "$TASK_DETAILS_RESPONSE" > task_details_response.json

# Vérifier si les détails de la tâche sont récupérés
if echo "$TASK_DETAILS_RESPONSE" | grep -q "\"id\":\"$FIRST_TASK_ID\""; then
    log_success "Détails de la tâche récupérés avec succès."
else
    log_error "Échec de la récupération des détails de la tâche. Réponse: $TASK_DETAILS_RESPONSE"
    exit 1
fi

# Étape 6: Compléter une tâche
log_info "Étape 6: Complétion de la tâche $FIRST_TASK_ID..."

COMPLETE_RESPONSE=$(curl -s -X POST "$API_URL/process-engine/tasks/$FIRST_TASK_ID/complete" \
    -H "Content-Type: application/json" \
    -d "{\"userId\": \"1\"}")

echo "$COMPLETE_RESPONSE" > complete_response.json

# Vérifier si la tâche a été complétée
if echo "$COMPLETE_RESPONSE" | grep -q "success"; then
    log_success "Tâche complétée avec succès."
else
    log_error "Échec de la complétion de la tâche. Réponse: $COMPLETE_RESPONSE"
    exit 1
fi

# Étape 7: Vérifier les notifications (cette partie est plus complexe car elle nécessite une connexion WebSocket)
log_info "Étape 7: Vérification des notifications..."
log_info "Note: La vérification complète des notifications WebSocket nécessite un client WebSocket."
log_info "Vérifiez manuellement les logs du serveur pour confirmer l'envoi des notifications."

# Étape 8: Diagnostic du moteur de processus
log_info "Étape 8: Diagnostic du moteur de processus..."

DIAGNOSE_RESPONSE=$(curl -s -X GET "$API_URL/process-engine/diagnose/engine-status" \
    -H "Content-Type: application/json")

echo "$DIAGNOSE_RESPONSE" > diagnose_response.json

# Vérifier si le diagnostic a réussi
if echo "$DIAGNOSE_RESPONSE" | grep -q "status"; then
    ENGINE_STATUS=$(echo "$DIAGNOSE_RESPONSE" | grep -o '"status":"[^"]*' | sed 's/"status":"//')
    log_success "Diagnostic réussi. Statut du moteur: $ENGINE_STATUS"
else
    log_error "Échec du diagnostic. Réponse: $DIAGNOSE_RESPONSE"
    # Ne pas quitter, ce n'est pas critique
fi

# Étape 9: Vérifier les utilisateurs Camunda
log_info "Étape 9: Vérification des utilisateurs Camunda..."

USERS_RESPONSE=$(curl -s -X GET "$API_URL/process-engine/camunda-users" \
    -H "Content-Type: application/json")

echo "$USERS_RESPONSE" > users_response.json

# Vérifier si la liste des utilisateurs est récupérée
if echo "$USERS_RESPONSE" | grep -q "originalId"; then
    USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o "\"originalId\"" | wc -l)
    log_success "Liste des utilisateurs Camunda récupérée. Nombre d'utilisateurs: $USER_COUNT"
    
    # Vérifier si l'utilisateur 1 est présent
    if echo "$USERS_RESPONSE" | grep -q "\"originalId\":\"1\""; then
        log_success "L'utilisateur avec ID '1' est correctement mappé dans Camunda."
    else
        log_error "L'utilisateur avec ID '1' n'est pas trouvé dans le mapping Camunda."
        exit 1
    fi
else
    log_error "Échec de la récupération des utilisateurs Camunda. Réponse: $USERS_RESPONSE"
    exit 1
fi

# Résumé final
log_info "===================================================="
log_success "TOUS LES TESTS ONT RÉUSSI!"
log_info "===================================================="
log_info "Résumé:"
log_info "- Déploiement du processus BPMN: OK"
log_info "- Démarrage d'une instance: OK"
log_info "- Récupération des tâches pour l'utilisateur 1: OK"
log_info "- Récupération des détails d'une tâche: OK"
log_info "- Complétion d'une tâche: OK"
log_info "- Vérification du mapping utilisateur: OK"
log_info "===================================================="
log_info "Les fichiers de réponse ont été sauvegardés pour analyse."
log_info "Pour vérifier les notifications WebSocket, consultez les logs du serveur."
log_info "===================================================="

exit 0

#!/bin/bash

# Configuration
API_URL="http://localhost:8200"
AUTH_URL="http://localhost:8200/api/auth/login"
BPMN_FILE="diagram.bpmn"
EMAIL="jean.dupont@example.com"
PASSWORD="motDePasse123"

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Test de déploiement BPMN avec notifications ===${NC}"

# 1. Authentification pour obtenir un token JWT
echo -e "${YELLOW}1. Authentification...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "$AUTH_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Échec de l'authentification${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Authentification réussie${NC}"
fi

# 2. Vérifier les notifications avant déploiement
echo -e "${YELLOW}2. Vérification des notifications avant déploiement...${NC}"
NOTIFICATIONS_BEFORE=$(curl -s -X GET "$API_URL/api/notifications/user/1" \
  -H "Authorization: Bearer $TOKEN")

NOTIF_COUNT_BEFORE=$(echo $NOTIFICATIONS_BEFORE | grep -o '"id"' | wc -l)
echo -e "${BLUE}📊 Nombre de notifications avant: $NOTIF_COUNT_BEFORE${NC}"

# 3. Déployer le processus BPMN
echo -e "${YELLOW}3. Déploiement du processus BPMN...${NC}"

# Vérifier que le fichier BPMN existe
if [ ! -f "$BPMN_FILE" ]; then
  echo -e "${RED}❌ Fichier BPMN non trouvé: $BPMN_FILE${NC}"
  exit 1
fi

# Informations de base du processus
PROCESS_INFO='{"name":"NotificationTest","description":"Test de notification","tags":["test","notification"],"processId":null}'

# Configuration de tâche avec notification activée et assignation utilisateur directe
TASK_CONFIG='[{"taskId":"Activity_0v45ixi","taskName":"NotificationTest","taskType":"NONE","resource":{"attachmentsEnabled":true,"attachmentType":4},"information":{"category":"technical"},"habilitation":{"assignedUser":1,"assigneeType":"user"},"notification":{"notifyOnCreation":true,"notifyOnDeadline":true,"reminderBeforeDeadline":120,"notificationSensitivity":"public"}}]'

# Déployer le BPMN
DEPLOY_RESPONSE=$(curl -s -X POST "$API_URL/bpmn" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "bpmnFile=@$BPMN_FILE" \
  -F "processInfo=$PROCESS_INFO" \
  -F "taskConfigurations=$TASK_CONFIG")

PROCESS_ID=$(echo $DEPLOY_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROCESS_ID" ]; then
  echo -e "${RED}❌ Échec du déploiement${NC}"
  echo -e "${RED}Réponse: $DEPLOY_RESPONSE${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Déploiement réussi avec ID: $PROCESS_ID${NC}"
fi

# 4. Extraire l'ID de l'instance de processus de la réponse de déploiement
PROCESS_INSTANCE_ID=$(echo $DEPLOY_RESPONSE | grep -o '"processInstanceId":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PROCESS_INSTANCE_ID" ]; then
  echo -e "${RED}❌ Impossible de récupérer l'ID d'instance de processus${NC}"
  echo -e "${BLUE}🔍 Tentative de récupération via l'API...${NC}"
  
  # Tentative alternative de récupération des instances de processus
  PROCESS_INSTANCES=$(curl -s -X GET "$API_URL/engine-rest/process-instance?processDefinitionKey=NotificationTest" \
    -H "Authorization: Bearer $TOKEN")
  
  PROCESS_INSTANCE_ID=$(echo $PROCESS_INSTANCES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  
  if [ -z "$PROCESS_INSTANCE_ID" ]; then
    echo -e "${RED}❌ Impossible de récupérer l'ID d'instance de processus${NC}"
  else
    echo -e "${GREEN}✅ ID d'instance de processus récupéré: $PROCESS_INSTANCE_ID${NC}"
  fi
else
  echo -e "${GREEN}✅ ID d'instance de processus: $PROCESS_INSTANCE_ID${NC}"
fi

# 5. Forcer la synchronisation des assignations de tâches
if [ ! -z "$PROCESS_INSTANCE_ID" ]; then
  echo -e "${YELLOW}5. Forçage de la synchronisation des assignations...${NC}"
  SYNC_RESPONSE=$(curl -s -X POST "$API_URL/bpmn/process/$PROCESS_INSTANCE_ID/force-sync" \
    -H "Authorization: Bearer $TOKEN")
  
  SYNC_SUCCESS=$(echo $SYNC_RESPONSE | grep -o '"success":true' | wc -l)
  
  if [ $SYNC_SUCCESS -gt 0 ]; then
    echo -e "${GREEN}✅ Synchronisation forcée réussie${NC}"
    TASKS_COUNT=$(echo $SYNC_RESPONSE | grep -o '"tasksCount":[0-9]*' | cut -d':' -f2)
    echo -e "${BLUE}📊 Nombre de tâches synchronisées: $TASKS_COUNT${NC}"
  else
    echo -e "${RED}❌ Échec de la synchronisation forcée${NC}"
    echo -e "${RED}Réponse: $SYNC_RESPONSE${NC}"
  fi
fi

# 6. Attendre quelques secondes pour que les notifications soient générées
echo -e "${YELLOW}6. Attente de la génération des notifications...${NC}"
sleep 5

# 7. Vérifier les notifications après déploiement
echo -e "${YELLOW}7. Vérification des notifications après déploiement...${NC}"
NOTIFICATIONS_AFTER=$(curl -s -X GET "$API_URL/api/notifications/user/1" \
  -H "Authorization: Bearer $TOKEN")

NOTIF_COUNT_AFTER=$(echo $NOTIFICATIONS_AFTER | grep -o '"id"' | wc -l)
echo -e "${BLUE}📊 Nombre de notifications après: $NOTIF_COUNT_AFTER${NC}"

# 6. Vérifier si de nouvelles notifications ont été créées
if [ $NOTIF_COUNT_AFTER -gt $NOTIF_COUNT_BEFORE ]; then
  NEW_NOTIFS=$((NOTIF_COUNT_AFTER - NOTIF_COUNT_BEFORE))
  echo -e "${GREEN}✅ $NEW_NOTIFS nouvelles notifications ont été créées${NC}"
  
  # Afficher les détails des notifications
  echo -e "${YELLOW}Détails des notifications:${NC}"
  echo $NOTIFICATIONS_AFTER | grep -o '"id":[^,]*,"type":[^,]*,"subject":"[^"]*"' | sed 's/^/- /'
else
  echo -e "${RED}❌ Aucune nouvelle notification n'a été créée${NC}"
fi

# 8. Vérifier les tâches créées via l'API Camunda
echo -e "${YELLOW}8. Vérification des tâches créées...${NC}"
TASKS=$(curl -s -X GET "$API_URL/engine-rest/task?processInstanceId=$PROCESS_ID" \
  -H "Authorization: Bearer $TOKEN")

TASK_COUNT=$(echo $TASKS | grep -o '"id"' | wc -l)

if [ $TASK_COUNT -gt 0 ]; then
  echo -e "${GREEN}✅ $TASK_COUNT tâches ont été créées${NC}"
  
  # Afficher les détails des tâches
  echo -e "${YELLOW}Détails des tâches:${NC}"
  echo $TASKS | grep -o '"id":"[^"]*","name":"[^"]*"' | sed 's/^/- /'
else
  echo -e "${RED}❌ Aucune tâche n'a été créée${NC}"
fi

echo -e "${BLUE}=== Test terminé ===${NC}"

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("processKey", processKey);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint pour obtenir des statistiques sur les tâches par utilisateur
     */
    @GetMapping("/statistics/tasks-by-user")
    public ResponseEntity<Map<String, Object>> getTaskStatisticsByUser() {
        try {
            Map<String, Object> stats = new HashMap<>();
            List<Map<String, Object>> userTaskStats = new ArrayList<>();
            
            // Récupérer tous les utilisateurs
            List<org.camunda.bpm.engine.identity.User> users = bpmnServiceProcess.identityService.createUserQuery().list();
            
            // Pour chaque utilisateur, récupérer ses statistiques de tâches
            for (org.camunda.bpm.engine.identity.User user : users) {
                String userId = user.getId();
                Map<String, Object> userStat = new HashMap<>();
                userStat.put("userId", userId);
                userStat.put("firstName", user.getFirstName());
                userStat.put("lastName", user.getLastName());
                userStat.put("email", user.getEmail());
                
                // Compter les tâches par état
                long activeTasks = bpmnServiceProcess.taskService.createTaskQuery()
                    .taskAssignee(userId).active().count();
                long completedTasks = bpmnServiceProcess.historyService.createHistoricTaskInstanceQuery()
                    .taskAssignee(userId).finished().count();
                
                userStat.put("activeTasks", activeTasks);
                userStat.put("completedTasks", completedTasks);
                userStat.put("totalTasks", activeTasks + completedTasks);
                
                // Ajouter aux statistiques globales si l'utilisateur a des tâches
                if (activeTasks > 0 || completedTasks > 0) {
                    userTaskStats.add(userStat);
                }
            }
            
            // Trier par nombre total de tâches décroissant
            userTaskStats.sort((a, b) -> Long.compare(
                (Long) b.get("totalTasks"),
                (Long) a.get("totalTasks")
            ));
            
            stats.put("userTaskStatistics", userTaskStats);
            stats.put("totalUsers", users.size());
            stats.put("usersWithTasks", userTaskStats.size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Endpoint pour obtenir des statistiques sur les processus par définition
     */
    @GetMapping("/statistics/processes")
    public ResponseEntity<Map<String, Object>> getProcessStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            List<Map<String, Object>> processStats = new ArrayList<>();
            
            // Récupérer toutes les définitions de processus
            List<org.camunda.bpm.engine.repository.ProcessDefinition> definitions = 
                bpmnServiceProcess.repositoryService.createProcessDefinitionQuery().list();
            
            // Pour chaque définition, récupérer ses statistiques
            for (org.camunda.bpm.engine.repository.ProcessDefinition def : definitions) {
                Map<String, Object> processStat = new HashMap<>();
                processStat.put("id", def.getId());
                processStat.put("key", def.getKey());
                processStat.put("name", def.getName());
                processStat.put("version", def.getVersion());
                processStat.put("deploymentId", def.getDeploymentId());
                
                // Compter les instances par état
                long activeInstances = bpmnServiceProcess.runtimeService.createProcessInstanceQuery()
                    .processDefinitionId(def.getId()).active().count();
                long completedInstances = bpmnServiceProcess.historyService.createHistoricProcessInstanceQuery()
                    .processDefinitionId(def.getId()).finished().count();
                
                processStat.put("activeInstances", activeInstances);
                processStat.put("completedInstances", completedInstances);
                processStat.put("totalInstances", activeInstances + completedInstances);
                
                // Ajouter aux statistiques globales
                processStats.add(processStat);
            }
            
            // Trier par nombre total d'instances décroissant
            processStats.sort((a, b) -> Long.compare(
                (Long) b.get("totalInstances"),
                (Long) a.get("totalInstances")
            ));
            
            stats.put("processStatistics", processStats);
            stats.put("totalDefinitions", definitions.size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Endpoint pour obtenir des statistiques détaillées sur les configurations de tâches
     */
    @GetMapping("/statistics/task-configurations")
    public ResponseEntity<Map<String, Object>> getDetailedTaskConfigurationStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Récupérer les statistiques de base des configurations
            Map<String, Object> basicStats = taskConfigurationService.getConfigurationStatistics();
            stats.put("basic", basicStats);
            
            // Statistiques par section de configuration
            Map<String, Object> sectionStats = new HashMap<>();
            
            // Récupérer toutes les configurations
            List<TaskConfiguration> configurations = taskConfigurationService.getAllTaskConfigurations();
            
            // Compter les configurations avec chaque section remplie
            long withInformation = configurations.stream()
                .filter(c -> c.getInformation() != null && !c.getInformation().isEmpty())
                .count();
            long withHabilitation = configurations.stream()
                .filter(c -> c.getHabilitation() != null && !c.getHabilitation().isEmpty())
                .count();
            long withResource = configurations.stream()
                .filter(c -> c.getResource() != null && !c.getResource().isEmpty())
                .count();
            long withPlanification = configurations.stream()
                .filter(c -> c.getPlanification() != null && !c.getPlanification().isEmpty())
                .count();
            long withNotification = configurations.stream()
                .filter(c -> c.getNotification() != null && !c.getNotification().isEmpty())
                .count();
            long withCondition = configurations.stream()
                .filter(c -> c.getCondition() != null && !c.getCondition().isEmpty())
                .count();
            
            sectionStats.put("information", withInformation);
            sectionStats.put("habilitation", withHabilitation);
            sectionStats.put("resource", withResource);
            sectionStats.put("planification", withPlanification);
            sectionStats.put("notification", withNotification);
            sectionStats.put("condition", withCondition);
            
            stats.put("sections", sectionStats);
            
            // Statistiques de complétude
            Map<String, Object> completenessStats = new HashMap<>();
            long totalSections = 6; // Nombre total de sections possibles
            
            // Compter les configurations par niveau de complétude
            Map<Integer, Long> completenessCounts = configurations.stream()
                .collect(Collectors.groupingBy(
                    c -> {
                        int count = 0;
                        if (c.getInformation() != null && !c.getInformation().isEmpty()) count++;
                        if (c.getHabilitation() != null && !c.getHabilitation().isEmpty()) count++;
                        if (c.getResource() != null && !c.getResource().isEmpty()) count++;
                        if (c.getPlanification() != null && !c.getPlanification().isEmpty()) count++;
                        if (c.getNotification() != null && !c.getNotification().isEmpty()) count++;
                        if (c.getCondition() != null && !c.getCondition().isEmpty()) count++;
                        return count;
                    },
                    Collectors.counting()
                ));
            
            completenessStats.put("bySectionCount", completenessCounts);
            completenessStats.put("fullConfigured", completenessCounts.getOrDefault(totalSections, 0L));
            completenessStats.put("partialConfigured", configurations.size() - completenessCounts.getOrDefault(totalSections, 0L));
            
            stats.put("completeness", completenessStats);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Endpoint pour obtenir des statistiques sur les tâches par processus
     */
    @GetMapping("/statistics/tasks-by-process")
    public ResponseEntity<Map<String, Object>> getTaskStatisticsByProcess() {
        try {
            Map<String, Object> stats = new HashMap<>();
            List<Map<String, Object>> processTaskStats = new ArrayList<>();
            
            // Récupérer toutes les instances de processus actives
            List<org.camunda.bpm.engine.runtime.ProcessInstance> instances = 
                bpmnServiceProcess.runtimeService.createProcessInstanceQuery().active().list();
            
            // Pour chaque instance, récupérer ses statistiques de tâches
            for (org.camunda.bpm.engine.runtime.ProcessInstance instance : instances) {
                String processInstanceId = instance.getProcessInstanceId();
                String processDefinitionId = instance.getProcessDefinitionId();
                
                // Récupérer la définition du processus
                org.camunda.bpm.engine.repository.ProcessDefinition definition = 
                    bpmnServiceProcess.repositoryService.createProcessDefinitionQuery()
                        .processDefinitionId(processDefinitionId)
                        .singleResult();
                
                Map<String, Object> processStat = new HashMap<>();
                processStat.put("processInstanceId", processInstanceId);
                processStat.put("processDefinitionId", processDefinitionId);
                processStat.put("processKey", definition.getKey());
                processStat.put("processName", definition.getName());
                
                // Compter les tâches par état
                long activeTasks = bpmnServiceProcess.taskService.createTaskQuery()
                    .processInstanceId(processInstanceId).active().count();
                long completedTasks = bpmnServiceProcess.historyService.createHistoricTaskInstanceQuery()
                    .processInstanceId(processInstanceId).finished().count();
                long assignedTasks = bpmnServiceProcess.taskService.createTaskQuery()
                    .processInstanceId(processInstanceId).taskAssigned().count();
                long unassignedTasks = bpmnServiceProcess.taskService.createTaskQuery()
                    .processInstanceId(processInstanceId).taskUnassigned().count();
                
                processStat.put("activeTasks", activeTasks);
                processStat.put("completedTasks", completedTasks);
                processStat.put("assignedTasks", assignedTasks);
                processStat.put("unassignedTasks", unassignedTasks);
                processStat.put("totalTasks", activeTasks + completedTasks);
                
                // Ajouter aux statistiques globales
                processTaskStats.add(processStat);
            }
            
            // Trier par nombre total de tâches décroissant
            processTaskStats.sort((a, b) -> Long.compare(
                (Long) b.get("totalTasks"),
                (Long) a.get("totalTasks")
            ));
            
            stats.put("processTaskStatistics", processTaskStats);
            stats.put("totalActiveProcesses", instances.size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

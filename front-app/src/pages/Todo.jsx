import React, { useState, useEffect } from "react";
import Main from "../layout/Main";
import KanbanBoard from "./Kanban/KanbanBoard";
import taskService from "../services/TaskService";
import { toast } from "react-hot-toast";

function Todo() {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  
  // ID utilisateur (à remplacer par l'ID de l'utilisateur connecté)
  const userId = '1';
  
  // Charger les tâches de l'utilisateur
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const data = await taskService.getUserTasks(userId);
        setTasks(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        toast.error('Erreur lors du chargement des tâches');
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, [userId]);
  
  return (
    <Main>
      <div className="todo-container">
        <h1 className="page-title">Gestion des tâches</h1>
        <p className="page-description">Organisez et suivez vos tâches avec notre tableau Kanban</p>
        
        {isLoading ? (
          <div className="loading">Chargement des tâches...</div>
        ) : (
          <KanbanBoard />
        )}
      </div>
    </Main>
  );
}

export default Todo;

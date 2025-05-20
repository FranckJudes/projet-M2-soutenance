import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Main from '../layout/Main';
import Dashboard from '../pages/Dashboard';
import Office from '../pages/Office';
import Todo from '../pages/Todo';
import Settings from '../pages/Settings/Settings';
import History from '../pages/History';
import Configuration from '../pages/Configuration/Configuration';
import PlanClassement from '../pages/PlanClassement/PlanClassement';
import Domaine from '../pages/DomaineValeur/Domaine';
import Form from '../pages/Forms/Form';
import Login from '../pages/Auth/Login';
import Groupe from '../pages/GroupUser/Groupe';
import User from '../pages/User/User';
import KanbanBoard from '../pages/Kanban/KanbanBoard';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import Workflows from '../pages/Workflows';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />, 
    },
    { path: "dashboard", element: <Dashboard /> },
    { path: "office", element: <Office /> },
    { path: "todo", element: <Todo /> },
    { path: "configuration", element: <Configuration /> },
    { path: "settings", element: <Settings /> },
    { path: "history", element: <History /> },
    { path: "plan_classement", element: <PlanClassement /> },
    { path: "domaine_val", element: <Domaine /> },
    { path: "forms", element: <Form /> },
    { path: "login", element: <Login /> },
    { path: "Groups", element: <Groupe /> },
    { path: "Users", element: <User /> },
    { path: "kanban", element: <KanbanBoard /> },
    { path: "notifications", element: <NotificationsPage /> },
    { path: "workflows", element: <Workflows /> }
]);

export default function AppRoutes() {
    return <RouterProvider router={router} />;
}

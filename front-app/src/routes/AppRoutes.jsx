import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import ProtectedRoute from '../services/ProtectedRoute';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />, 
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        )
    },
    {
        path: "/office",
        element: (
            <ProtectedRoute>
                <Office />
            </ProtectedRoute>
        )
    },
    {
        path: "/todo",
        element: (
            <ProtectedRoute>
                <Todo />
            </ProtectedRoute>
        )
    },
    {
        path: "/configuration",
        element: (
            <ProtectedRoute>
                <Configuration />
            </ProtectedRoute>
        )
    },
    {
        path: "/settings",
        element: (
            <ProtectedRoute>
                <Settings />
            </ProtectedRoute>
        )
    },
    {
        path: "/history",
        element: (
            <ProtectedRoute>
                <History />
            </ProtectedRoute>
        )
    },
    {
        path: "/plan_classement",
        element: (
            <ProtectedRoute>
                <PlanClassement />
            </ProtectedRoute>
        )
    },
    {
        path: "/domaine_val",
        element: (
            <ProtectedRoute>
                <Domaine />
            </ProtectedRoute>
        )
    },
    {
        path: "/forms",
        element: (
            <ProtectedRoute>
                <Form />
            </ProtectedRoute>
        )
    },
    {
        path: "/Groups",
        element: (
            <ProtectedRoute>
                <Groupe />
            </ProtectedRoute>
        )
    },
    {
        path: "/Users",
        element: (
            <ProtectedRoute>
                <User />
            </ProtectedRoute>
        )
    },
    {
        path: "/kanban",
        element: (
            <ProtectedRoute>
                <KanbanBoard />
            </ProtectedRoute>
        )
    },
    {
        path: "/notifications",
        element: (
            <ProtectedRoute>
                <NotificationsPage />
            </ProtectedRoute>
        )
    },
    {
        path: "/workflows",
        element: (
            <ProtectedRoute>
                <Workflows />
            </ProtectedRoute>
        )
    },
    {
        path: "*",
        element: (
            <ProtectedRoute>
                <div className="text-center mt-5">
                    <h1>404</h1>
                    <p>Page non trouvée</p>
                </div>
            </ProtectedRoute>
        )
    }
]);

export default function AppRoutes() {
    return <RouterProvider router={router} />;
}
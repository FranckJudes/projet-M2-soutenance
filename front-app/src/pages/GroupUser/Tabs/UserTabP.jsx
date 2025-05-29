import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Form, Spinner } from 'react-bootstrap';
import UserService from "../../../services/UserService";
import { toast, Toaster } from "react-hot-toast";


export default function UserTabP() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const response = await UserService.getAllUsers();
            console.log(response.data.data);
            if (response.data && response.data.success) {
                setUsers(response.data.data.map(user => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName}`
                })));
            } else {
                toast.error("Erreur lors du chargement des utilisateurs");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs", error);
            toast.error("Erreur lors du chargement des utilisateurs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="p-3">
            <Form.Group className="mb-3">
                <Form.Label>Sélectionner l'utilisateur :</Form.Label>
                {isLoading ? (
                    <div className="d-flex align-items-center mt-2">
                        <Spinner animation="border" size="sm" variant="primary" />
                        <span className="ms-2">Chargement des utilisateurs...</span>
                    </div>
                ) : (
                    <Select 
                        isMulti
                        options={users}
                        value={selectedUsers}
                        onChange={setSelectedUsers}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Sélectionner des utilisateurs..."
                    />
                )}
            </Form.Group>
            <Toaster position="top-right" />
        </div>
    );
}
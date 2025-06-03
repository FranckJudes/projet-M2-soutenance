import React, { useState, useEffect } from 'react';
import { Select, Form, Spin, message } from 'antd';
import UserService from "../../../services/UserService";


const UserTabP = () => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const response = await UserService.getAllUsers();
            if (response.data && response.data.success) {
                setUsers(response.data.data.map(user => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName}`
                })));
            } else {
                message.error("Erreur lors du chargement des utilisateurs");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs", error);
            message.error("Erreur lors du chargement des utilisateurs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = (value) => {
        setSelectedUsers(value);
    };

    return (
        <div style={{ padding: '16px 0' }}>
            <Form layout="vertical">
                <Form.Item label="Sélectionner l'utilisateur :">
                    <Spin spinning={isLoading} tip="Chargement des utilisateurs...">
                        <Select 
                            mode="multiple"
                            options={users}
                            value={selectedUsers}
                            onChange={handleChange}
                            placeholder="Sélectionner des utilisateurs..."
                            style={{ width: '100%' }}
                            optionFilterProp="label"
                            loading={isLoading}
                        />
                    </Spin>
                </Form.Item>
            </Form>
        </div>
    );
};

export default UserTabP;
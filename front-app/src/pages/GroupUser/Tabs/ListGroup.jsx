import React from "react";
import { Card } from "../../../components/Card";
import { useTranslation } from "react-i18next";
import { Table, Button, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function ListGroup({ groups = [], onEdit, onDelete }) {
    const { t } = useTranslation();
    
    // Fonction pour obtenir la couleur du badge en fonction du type
    const getBadgeColor = (type) => {
        switch (type) {
            case "TYPE_0":
                return "primary";
            case "TYPE_1":
                return "success";
            case "TYPE_2":
                return "warning";
            default:
                return "secondary";
        }
    };

    return (
        <Card
            title={"Liste des groupes"}
            className="shadow"
        >
            {groups.length === 0 ? (
                <div className="text-center p-4">
                    <p className="text-muted">Aucun groupe trouvé</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <Table hover className="table-striped">
                        <thead>
                            <tr>
                                <th>Libellé</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map((group) => (
                                <tr key={group.id}>
                                    <td>{group.libeleGroupeUtilisateur}</td>
                                    <td>
                                        {group.descriptionGroupeUtilisateur || 
                                            <span className="text-muted">Aucune description</span>
                                        }
                                    </td>
                                    <td>
                                        <Badge bg={getBadgeColor(group.type)} className="px-3 py-2">
                                            {group.type}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                onClick={() => onEdit(group)}
                                                className="btn-icon"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                onClick={() => onDelete(group.id)}
                                                className="btn-icon"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </Card>
    );
}
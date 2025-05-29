import React, { useState, useEffect } from "react";
import { Card, Button, Table } from "react-bootstrap";
import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
DataTable.use(DT);

export default function ListUserNotGroup() {
    return (
        <Card className="shadow">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Utilisateur sans groupe</h5>
                <Button variant="primary" size="sm">
                    Ajouter à un groupe
                </Button>
            </Card.Header>
            <Card.Body>
                <DataTable
                    options={{
                        responsive: true,
                    }}
                ></DataTable>
            </Card.Body>
        </Card>
    );
}
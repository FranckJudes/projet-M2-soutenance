// eslint-disable-next-line no-unused-vars
import React, {useState} from "react";
import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
import {useTranslation} from "react-i18next";
import {Card as CardComponent} from "../../../components/Card.jsx";
import {ModalComponent} from "../../../components/Modal.jsx";
// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

export default function ListForm (){
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const toggleModal = () => setShowModal(!showModal);

    const [tableData] = useState([
        { id: 1, name: "Tiger Nixon", position: "System Architect" },
        { id: 2, name: "Garrett Winters", position: "Accountant" },
    ]);
    const columns = [
        { data: 'name', title: 'Name' },
        { data: 'position', title: 'Position' },
        {
            data: null,
            title: 'Actions',
            render: (data, type, row) => {
                return `
                    <div class="dropdown">
                      <button class="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton2"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                       Action
                      </button>
                      <div class="dropdown-menu">
                        <a class="dropdown-item has-icon"  onclick="handleEdit(${row})" href="#"><i class="far fa-eye"></i> Voir</a>
                        <a class="dropdown-item has-icon"  onclick="handleEdit(${row})"  href="#"><i class="far fa-edit"></i>Modifier</a>
                        <a class="dropdown-item has-icon"  onclick="handleEdit(${row})" href="#"><i class="fas fa-trash"></i> Supprimer</a>
                      </div>
                    </div>
        `;
            },
            // orderable: false,
        },
    ];

    return (
        <>
            <CardComponent title={t("List of Values")} titleAction={<button className="btn btn-success" onClick={toggleModal}>Creer un nouveau formulaire</button>}>
                <DataTable
                    data={tableData}
                    columns={columns}
                    className="display"
                    options={{
                        responsive: true,
                    }}
                />
            </CardComponent>

            <ModalComponent showModal={showModal} toggleModal={toggleModal} titleModal={"Ajouter un nouveau form"}>
                <p>This is the modal content!</p>
                <button className="btn btn-danger" onClick={toggleModal}>
                    Close
                </button>
            </ModalComponent>
        </>
    )
}
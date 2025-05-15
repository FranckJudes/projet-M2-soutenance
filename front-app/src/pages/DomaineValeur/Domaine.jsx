import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Main from "../../layout/Main";
import Breadcrumb from "../../components/Breadcrumb";
import { Card as CardComponent } from "../../components/Card";
import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
import { getAllDomaine, updateDomaine, deleteDomaine, createDomaine } from "../../api/ProcessDomaineValeur";
import { Textarea, Input } from "../../components/Input";
import { showAlert } from "../../components/SweetAlert";
import { useToast } from "../../components/Toast";

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

export default function Domaine () {
  const { t } = useTranslation();
  const { showToast } = useToast();


  const [domaines, setDomaines] = useState([]);
  const [formData, setFormData] = useState({
    libele: "",
    description: "",
    type : "1"
  });
  const [editingDomaine, setEditingDomaine] = useState(null);

 

  const fetchDomaines = useCallback(async () => {
    try {
      const response = await getAllDomaine();
      if (response) {
        setDomaines(response);
      } 
    } catch (error) {
      console.error("Erreur de chargement des domaines :", error);
    }
  }, [t]);

  useEffect(() => {
    fetchDomaines();
  }, [fetchDomaines]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (metadata) => {
    setEditingDomaine(metadata);
    setFormData(metadata);
  };

  const handleDelete = useCallback(
    async (id) => {
      showAlert({
        title: <p>Confirmez-vous cette action ?</p>,
        text: "Cette action est irréversible.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui",
        cancelButtonText: "Non",
      }).then(async (result) => {
        if (result.isConfirmed) {
              await deleteDomaine(id);
              await fetchDomaines();
              resetForm();
               showToast({
                    title: "Attention",
                    message: "Domaine successfully deleted.",
                    color: "green",
                    position: "topRight",
              });   
        } else if (result.isDismissed) {
            showToast({
                title: "Attention",
                message: "Annulation de la suppression.",
                color: "red",
                position: "topRight",
            });                 
        }
      });
    },
    [fetchDomaines, t]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDomaine) {
        await updateDomaine(editingDomaine.id, formData);
      } else {
        await createDomaine(formData);
      }
      await fetchDomaines();
      resetForm();
      showToast({
            title: "Attention",
            message: "Domaine successfully edited.",
            color: "green",
            position: "topRight",
      });   
    } catch (error) {
      showToast({
        title: "Attention",
        message: "Erreur de modification",
        color: "red",
        position: "topRight",
    });  
    }
  };

  const resetForm = () => {
    setFormData({
      libele: "",
      description: "",
      type:"1"
    });
    setEditingDomaine(null);
  };

  const tableContent = (
    <DataTable
      data={domaines.map((domaine, index) => ({
        id: index + 1,
        libelle: domaine.libele || t("Unknown"),
        description: domaine.description || t("Not Specified"),
        actions: domaine,
      }))}
      columns={[
        { data: "id", title: t("ID") },
        { data: "libelle", title: t("Libelle") },
        { data: "description", title: t("Description") },
        {
          data: "actions",
          title: t("Actions"),
          render: (data) => {
            const jsonData = JSON.stringify(data).replace(/"/g, "&quot;");
            return `
              <div class="dropdown">
                <button class="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton2"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  ${t("Action")}
                </button>
                <div class="dropdown-menu">
                  <a class="dropdown-item has-icon edit-btn" data-id="${jsonData}" href="#"><i class="far fa-edit"></i> ${t("Edit")}</a>
                  <a class="dropdown-item has-icon delete-btn" data-id="${data._id}" href="#"><i class="fas fa-trash"></i> ${t("Delete")}</a>
                </div>
              </div>
            `;
          },
        },
      ]}
      className="display table table-striped"
      options={{
        responsive: true,
        rowId: "id",
        drawCallback: function () {
          document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              const jsonData = btn.getAttribute("data-id");
              const metadata = JSON.parse(jsonData);
              handleEdit(metadata);
            });
          });

          document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              const id = btn.getAttribute("data-id");
              handleDelete(id);
            });
          });
        },
      }}
    />
  );

  return (
    <Main>
      <Breadcrumb
        items={[
          { label: "Home", link: "#", icon: "fas fa-tachometer-alt", active: false },
          { label: "Admin", link: "#", icon: "far fa-file", active: false },
          { label: t("Domaine de valeur"), icon: "fas fa-list", active: true },
        ]}
      />
      <div className="row">
        <div className="col-8">
          <CardComponent title={t("List of Values")}>{tableContent}</CardComponent>
        </div>
        <div className="col-4">
          <CardComponent title={t("__sect_ajout__")}>
            <form onSubmit={handleSubmit}>
              <Input
                name="libele"
                value={formData.libele}
                label={t("Name")}
                placeholder={t("Enter name")}
                onChange={handleInputChange}
                required
              />
                  <Textarea
                    name="description"
                    value={formData.description}
                    label={t("Description")}
                    placeholder={t("Enter description")}
                    onChange={handleInputChange}
                    required
                  />
              <button type="submit" className="btn btn-success" style={{ float: "right" }}>
                   {t(editingDomaine ? "update_metadata" : "add_index")}
              </button>
            </form>
          </CardComponent>
        </div>
      </div>
    </Main>
  );
};

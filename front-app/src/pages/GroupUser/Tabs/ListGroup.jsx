import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
import { Card } from "../../../components/Card";
import { useTranslation } from "react-i18next";

DataTable.use(DT);

export default function ListGroup () {
    const { t } = useTranslation();
    
    return <>
       <Card
            title={"List Group"}
        >
            <DataTable
             className="display table table-striped"
                options={{
                    responsive:true,
                }}
            columns={[
                { data: "id", title: t("ID") },
                { data: "libelle", title: t("Libelle") },
                { data: "description", title: t("Description") },
                { data: "description", title: t("Action") },
            ]}
            />
       </Card>
    </>
} 
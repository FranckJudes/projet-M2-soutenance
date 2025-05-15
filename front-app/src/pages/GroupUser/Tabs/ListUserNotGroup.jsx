import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
import { Card } from "../../../components/Card";
import { ButtonSimple } from "../../../components/Button";
DataTable.use(DT);

export default function ListUserNotGroup(){
    return <>
    <Card
         title={"Utilisateur sans groupe"}
         titleAction={<ButtonSimple label="Ajouter a un groupe"></ButtonSimple>}
     >
         <DataTable
             options={{
                responsive:true,
            }}
         ></DataTable>
    </Card>
 </>
} 
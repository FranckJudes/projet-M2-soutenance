import React, { useState } from 'react';
import {Radio} from '../../../../components/Input';
import { useTranslation } from 'react-i18next';
import DataTable from "datatables.net-react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-select-dt";
import "datatables.net-responsive-dt";
import DT from "datatables.net-dt";

export default function Condition(){
  
    const { t } = useTranslation();
    const [showEntryTable, setShowEntryTable] = useState(false);
    const [showOutputTable, setShowOutputTable] = useState(false);
  
    const [tableData] = useState([
      { id: 1, name: "Type", position: "Condition", value: "Definir resultat" },
      { id: 2, name: "Garrett Winters", position: "Accountant", value: "troisieme22" },
    ]);
  
    const handlePriorityChange = (event) => {
      setShowEntryTable(event.target.checked);
    };
  
    const handlePriorityOutput = (event) => {
      setShowOutputTable(event.target.checked);
    };
  
    const columns = [
      { data: "name", title: "Type" },
      { data: "position", title: "Condition" },
      { data: "value", title: "Definir resultat" },
    ];
  
    return (
      <>
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t("__condit_entry__")} :</label>
          </div>
          <div className="col-8">
            <div className="form-group">
              <div className="col-md-6 d-flex flex-column">
                <Radio
                  name="entry_condition"
                  onChange={handlePriorityChange}
                />
              </div>
            </div>
          </div>
        </div>
        {showEntryTable && (
          <div className="d-flex py-2">
            <div className="col-12">
              <DataTable
                data={tableData}
                columns={columns}
                className="display"
                options={{
                  responsive: true,
                  searching: false,
                  paging: false,
                  lengthChange: false,
                  info: false,
                }}
              />
            </div>
          </div>
        )}
          
  
        <div className="d-flex py-2">
          <div className="col-4">
            <label>{t("__condit_output__")} :</label>
          </div>
          <div className="col-8">
            <div className="form-group">
              <div className="col-md-6 d-flex flex-column">
              <Radio
                  name="output_condition"
                  onChange={handlePriorityOutput}
                />
              </div>
            </div>
          </div>
        </div>
        {showOutputTable && (
          <div className="d-flex py-2">
            <div className="col-12">
              <DataTable
                data={tableData}
                columns={columns}
                className="display"
                options={{
                  responsive: true,
                  searching: false,
                  paging: false,
                  lengthChange: false,
                  info: false,
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  };
  
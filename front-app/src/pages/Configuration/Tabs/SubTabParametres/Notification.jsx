import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import {Radio,RadioButton } from '../../../../components/Input';


export default function Notifications (){
  const { t } = useTranslation();
  const [selectedPriority, setSelectedPriority] = useState(1);
  
  const optionsRappel = [
    { value: t("minutesBefore"), label: t("minutesBefore") },
    { value: t("oneHourBefore"), label: t("oneHourBefore") },
    { value: t("hoursBefore.2"), label: t("hoursBefore.2") },
    { value: t("hoursBefore.3"), label: t("hoursBefore.3") },
    { value: t("hoursBefore.4"), label: t("hoursBefore.4") },
    { value: t("oneDayBefore"), label: t("oneDayBefore") },
    { value: t("daysBefore.2"), label: t("daysBefore.2") },
    { value: t("daysBefore.3"), label: t("daysBefore.3") },
    { value: t("oneWeekBefore"), label: t("oneWeekBefore") },
    { value: t("weeksBefore.2"), label: t("weeksBefore.2") },
    { value: t("oneMonthBefore"), label: t("oneMonthBefore") },
    
  ]

  const handlePriorityChange = (event) => {
        setSelectedPriority(parseInt(event.target.value));
    };
    return <>
            <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('__notf_par_attrib__')} :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">
                    <Radio  name="script_regle_metier" label={t('__notf_par_attrib_details_')} />
                  </div>
                </div>
            </div>
            
            <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('__alert_escal_')} :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">
                    <Radio  name="alert_escalade" label={t('__detail_messag_alert__')} />
                  </div>
                </div>
            </div>
           <div className="d-flex py-2 mb-2">
                <div className="col-4">
                  <label>{t('Reminder')} :</label>
                </div>
                <div className="col-8">
                     <Select options={optionsRappel} isMulti />
                </div>
            </div>
            <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('__sensibl_t_')} :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">
                     <div className="col-md-6 d-flex flex-column">
                        <RadioButton
                            label={t('__public__')}
                            value={1}
                            name="sensibilite"
                            checked={selectedPriority === 1}
                            onChange={handlePriorityChange}
                        />
                        <RadioButton
                            label={t('__confidentitial__')}
                            value={2}
                            name="sensibilite"
                            checked={selectedPriority === 2}
                            onChange={handlePriorityChange}
                        />
                    </div>
                  </div>
                </div>
            </div>
    </>
}
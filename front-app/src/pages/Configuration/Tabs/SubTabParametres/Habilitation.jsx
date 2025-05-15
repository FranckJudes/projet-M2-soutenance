import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {InputAdd} from '../../../../components/Input';
import Select from 'react-select'

export default function Habilitation ()  {
  const { t } = useTranslation();

  const [isChecked, setIsChecked] = useState(false);
  const [selectPointControl, setselectPointControl] = useState(null);


  const optionUser = [
    { value: "Gallagher", label: "Gallagher" },
    { value: "Franck", label: "Franck" },
    { value: "Judes", label: "Judes" },
    { value: "User", label: "User" },

  ]
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleDisplay = (event) => {
    setselectPointControl(event.target.checked);
  }

    return <>
        <div className="row">
        <div className="col-md-12">
              
              <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('AssignedPersons')}</label>
                </div>
                <div className="col-8 d-flex align-items-center">
                  <div >
                   
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="customCheck1" />
                      <label className="custom-control-label" htmlFor="customCheck1">{t('__pers_interess_')}</label>
                    </div>
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="customCheck2" />
                      <label className="custom-control-label" htmlFor="customCheck2">{t('__entity__')}</label>
                    </div>
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="customCheck3" />
                      <label className="custom-control-label" htmlFor="customCheck3">{t('__group_user_')}</label>
                    </div>
                  </div>

                </div>
              </div>
              <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('__assign_to_p_t_')}:</label>
                </div>
                <div className="col-8">
                  <div className="form-group d-flex align-items-center mb-1" style={{ gap: "50px" }}>
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customCheck10"
                        onChange={handleCheckboxChange}
                      />

                      <label
                        className="custom-control-label"
                        htmlFor="customCheck10"
                        style={{ marginBottom: "0" }}
                      ></label>
                    </div>
                    {isChecked && (
                      <div style={{ width: "100%" }}>
                        <Select options={optionUser} />
                      </div>
                    )}
                  </div>
                  <p>{t('__msg_for_resp_')}</p>

                  <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" id="customCheck30" onChange={handleDisplay} />
                    <label className="custom-control-label" htmlFor="customCheck30">{t('__require_resp_ex')}</label>
                  </div>



                </div>
              </div>
              {selectPointControl && (<div className="d-flex py-2">
                    <div className="col-4">
                    <label> {t('__check_point_')}</label>
                    </div>
                    <div className="col-8">
                    <InputAdd details={t('__detail_dyn_form__')} />
                    </div>
              </div>)}
              <div className="d-flex py-2">
                <div className="col-4">
                <label>{t('__poss_return_')} :</label>
                </div>
                <div className="col-8 d-flex justify-content-start" >
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="customCheck33" />
                      <label className="custom-control-label" htmlFor="customCheck33"></label>
                    </div>
                </div>
              </div>
        </div>
        </div>
    </>
}
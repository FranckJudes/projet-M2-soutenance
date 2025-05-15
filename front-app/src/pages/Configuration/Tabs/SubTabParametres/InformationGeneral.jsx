import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Textarea ,InputAdd} from '../../../../components/Input.jsx';
import Select from 'react-select'
                    

export default function InformationGeneral() {
  const { t } = useTranslation();

    return <>
        <div className="row">
            <div className="col-md-12">
            <div className="d-flex py-2">
                <div className="col-4">
                  <label>Category :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">

                    <Select/>
                  </div>
                </div>
              </div>
              <div className="d-flex py-2">
                <div className="col-4">
                    <label>Board :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">
                    <input type="text" className="form-control" name="board" />
                  </div>
                </div>
              </div>
            <div className="d-flex py-2">
                <div className="col-4">
                <label>{t('__inst_work_')}:</label>
                </div>
                <div className="col-8">
                        <InputAdd details={t('__detail_work_inst')} />
                </div>
            </div>
            <div className="d-flex py-2">
                <div className="col-4">
                  <label>{t('__result_livrab__')} :</label>
                </div>
                <div className="col-8">
                  <div className="form-group">
                    {/* <input type="text" className="form-control" name="board" /> */}
                    <textarea className="form-control" name="" placeholder={t('__inf_result_livrab__')} />
                  </div>
                </div>
              </div>
            </div>
        </div>
    </>
}
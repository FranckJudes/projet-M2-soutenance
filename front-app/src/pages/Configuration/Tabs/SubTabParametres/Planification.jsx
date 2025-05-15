import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {Checkbox } from '../../../../components/Input';

export default function Planification ()  {
  const { t } = useTranslation();
    

    return <>
            <div className="row">
                   <div className="col-md-12">
                        <div className="d-flex py-2">
                            <div className="col-4">
                                    <label>{t('__delay_execution')}</label>
                                </div>
                                <div className="col-8">
                                    <div className="form-group">
                                        <div className="custom-control custom-checkbox">
                                            <input type="checkbox" className="custom-control-input" id="customCheck4" />
                                            <label className="custom-control-label" htmlFor="customCheck4">{t('__tout_journee__')}</label>
                                        </div>
                                        <div className="input-group">
                                            <input type="text" className="form-control" />
                                            <select class="form-control">
                                                <option>{t('Minutes')}</option>
                                                <option>{t('Days')}</option>
                                                <option>{t('Weeks')}</option>
                                                <option>{t('Months')}</option>
                                            </select>
                                        </div>
                                    
                                    </div>
                                </div>

                        </div>
                    
                        <div className="d-flex py-2">
                            <div className="col-4">
                                <label>{t('__criticite__')} :</label>
                            </div>
                            <div className="col-8">
                                <div className="form-group custom-switches-stacked mt-2">
                                <div className="row">
                                    <div className="col-md-6 d-flex flex-column">
                                        <label className="custom-switch mb-2">
                                        <input
                                            type="radio"
                                            name="criticite"
                                            defaultValue={1}
                                            className="custom-switch-input"
                                            defaultChecked
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('__critiq__')}</span>
                                        </label>

                                        <label className="custom-switch">
                                        <input
                                            type="radio"
                                            name="criticite"
                                            defaultValue={3}
                                            className="custom-switch-input"
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('__high__')}</span>
                                        </label>
                                    </div>

                                    <div className="col-md-6 d-flex flex-column">
                                        <label className="custom-switch mb-2">
                                        <input
                                            type="radio"
                                            name="criticite"
                                            defaultValue={2}
                                            className="custom-switch-input"
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('__normal__')}</span>
                                        </label>

                                        <label className="custom-switch">
                                        <input
                                            type="radio"
                                            name="criticite"
                                            defaultValue={3}
                                            className="custom-switch-input"
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('__low__')}</span>
                                        </label>
                                    </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="d-flex py-2">
                            <div className="col-4">
                                <label>{t('__prior_ty_')} :</label>
                            </div>
                            <div className="col-8">
                                <div className="form-group custom-switches-stacked mt-2">
                                <div className="row">
                                    <div className="col-md-6 d-flex flex-column">
                                        <label className="custom-switch mb-2">
                                        <input
                                            type="radio"
                                            name="priority"
                                            defaultValue={1}
                                            className="custom-switch-input"
                                            defaultChecked
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('__too_urgent__')}</span>
                                        </label>

                                        <label className="custom-switch">
                                        <input
                                            type="radio"
                                            name="priority"
                                            defaultValue={2}
                                            className="custom-switch-input"
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('___urgent__')}</span>
                                        </label>
                                    </div>

                                    <div className="col-md-6 d-flex flex-column">
                                        <label className="custom-switch mb-2">
                                        <input
                                            type="radio"
                                            name="priority"
                                            defaultValue={3}
                                            className="custom-switch-input"
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('__normal__')}</span>
                                        </label>

                                        <label className="custom-switch">
                                        <input
                                            type="radio"
                                            name="priority"
                                            defaultValue={4}
                                            className="custom-switch-input"
                                        />
                                        <span className="custom-switch-indicator"></span>
                                        <span className="custom-switch-description">{t('__low__')}</span>
                                        </label>
                                    </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="d-flex py-2">
                            <div className="col-4">
                                <label>{t('__rule_altern_tive__')} : </label>
                            </div>
                            <div className="col-8">
                                <div className="row">
                                    <div className="col-md-6">
                                        <Checkbox label={t('notifier_superviseur')} id="notifier_superviseur"/>
                                        <Checkbox label={t('reassigner_tache')} id="reassigner_tache"/>
                                        <Checkbox label={t('envoyer_rappel')} id="envoyer_rappel"/>
                                        <Checkbox label={t('escalade_hierarchique')} id="escalade_hierarchique"/>
                                        <Checkbox label={t('changement_priorite')} id="changement_priorite"/>
                                        <Checkbox label={t('bloquer_workflow')} id="bloquer_workflow"/>
                                        <Checkbox label={t('generer_alerte_equipe')} id="generer_alerte_equipe"/>
                                    </div>

                                    <div className="col-md-6">
                                        <Checkbox label={t('demander_justification')} id="demander_justification"/>
                                        <Checkbox label={t('activer_action_corrective')} id="activer_action_corrective"/>
                                        <Checkbox label={t('escalade_externe')} id="escalade_externe"/>
                                        <Checkbox label={t('cloturer_defaut')} id="cloturer_defaut"/>
                                        <Checkbox label={t('suivi_par_kpi')} id="suivi_par_kpi"/>
                                        <Checkbox label={t('plan_b_ou_tache_alternative')} id="plan_b_ou_tache_alternative"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex py-2">
                            <div className="col-4">
                                    <label>{t('consultation_historiq')} :</label>
                                </div>
                                <div className="col-8">
                                    <div className="form-group">
                                        <Checkbox  id="consultation" name="consultation_historiq"/>
                                    </div>
                                </div>

                        </div>
                        <div className="d-flex py-2">
                            <div className="col-4">
                                    <label>{t('__kpt__')} : </label>
                                </div>
                                <div className="col-8">
                                    <div className="form-group">
                                        <div className="row">
                                                <div className="col-md-6">
                                                    <Checkbox label={t('nombre_taches_traitees')} name="nombre_taches_traitees"  id="nombre_taches_traitees" />
                                                    <Checkbox label={t('taux_retour_taches_traitees')} name="taux_retour_taches_traitees"  id="taux_retour_taches_traitees" />
                                                    <Checkbox label={t('nombre_interactions_moyens_taches_traitees')} name="nombre_interactions_moyens_taches_traitees"  id="nombre_interactions_moyens_taches_traitees" />
                                                    <Checkbox label={t('respect_delais')} name="respect_delais"  id="respect_delais" />
                                                </div>
                                                <div className="col-md-6">
                                                    <Checkbox label={t('temps_attente_validation')} name="temps_attente_validation" id="temps_attente_validation" />
                                                    <Checkbox label={t('respect_priorites')} name="respect_priorites"  id="respect_priorites" />
                                                    <Checkbox label={t('gestion_urgences')} name="gestion_urgences"  id="gestion_urgences" />
                                                </div>

                                        </div>
                                    </div>
                                </div>

                        </div>
                </div>
            </div>
    </>
}
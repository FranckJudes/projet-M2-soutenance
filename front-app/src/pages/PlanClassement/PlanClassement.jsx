import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import Main from "../../layout/Main";
import Breadcrumb from '../../components/Breadcrumb';
import {NormalTabs} from '../../components/Tabs';
import AssistanceClassement from "./tabs/AssistanceClassement";
import PlanClassementFonctionnel from "./tabs/PlanClassementFonctionnel";

export default function PlanClassement(){
    const { t } = useTranslation();
    const tabItems = [
        { id: "profile", title: t("_cat_d_v_"), content: <PlanClassementFonctionnel /> },
        { id: "home", title: t("_ass_classement_"), content: <AssistanceClassement /> },
      ];
    return (
        <Main>
                <Breadcrumb
                    items={[
                        { label: t("welcome_dashboard"), link: "#", icon: "fas fa-tachometer-alt", active: false },
                        { label: t("configuration_sidebar_title"), icon: "fas fa-list", active: true },
                        { label: t("configuration_sidebar_title"), icon: "fas fa-list", active: true },

                    ]}
                />
                <NormalTabs items={tabItems} title="Titre du tabs" />
        </Main>
    );
}   



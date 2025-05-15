// eslint-disable-next-line no-unused-vars
import React from "react";
import Main from "../../layout/Main";
import { useTranslation } from 'react-i18next';

import {NormalTabs} from "../../components/Tabs.jsx";
import Breadcrumb from "../../components/Breadcrumb.jsx";
import ListForm from "./Tabs/ListForm.jsx";
import Metadata from "./Tabs/Metadata.jsx";


export default function Form (){
    const { t } = useTranslation();
    const tabItems = [
        { id: "__list_des_formulaire__", title: t("__list_des_formulaire__"), content: <ListForm /> },
        { id: "__list_in_index_", title: t("__list_in_index_"), content: <Metadata /> },
    ];
    return (
        <Main>
            <Breadcrumb
                items={[
                    { label: t("welcome_dashboard"), link: "#", icon: "fas fa-tachometer-alt", active: false },
                    { label: t("__list_des_formulaire__"), icon: "fas fa-list", active: true }
                ]}
            />
            <NormalTabs items={tabItems} title="Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, voluptatum similique" />
        </Main>
    );
}
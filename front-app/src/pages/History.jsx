import React from "react";
import { useState } from "react";

import { useTranslation } from 'react-i18next';
import Main from "../layout/Main";


function History() {
    const { t } = useTranslation();
    
    return (
        <Main>
            <h1>Historique</h1>
        </Main>
    );
}

export default History;

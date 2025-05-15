import React from "react";
import Main from "../../layout/Main";
import Breadcrumb from "../../components/Breadcrumb";
import { Card } from "../../components/Card";
import {Input, RadioButton, Textarea}  from "../../components/Input"
import { ButtonSimple } from "../../components/Button";
import { NormalTabs } from "../../components/Tabs";
import PrivilegeTabs  from "./Tabs/PrivilegeTabs";
import UserTabP  from "./Tabs/UserTabP";
import ListGroup  from "./Tabs/ListGroup";
import ListUserNotGroup  from "./Tabs/ListUserNotGroup";
import Select from 'react-select'

export default function Groupe() {

    const tabItems = [
        { id: "UserTabP", title: "Utilisateurs", content: <UserTabP /> },
        { id: "privileges", title: "Privileges", content: <PrivilegeTabs /> }
    ]; 
    const tabItems2 = [
        { id: "LisGroup", title: "Liste de groupe", content: <ListGroup /> },
        { id: "ListUserNotGroup", title: "Utilisateur sans groupe", content: <ListUserNotGroup /> }
    ];

    return (
            <Main>
                  <Breadcrumb
                    items={[
                        { label: "Home", link: "#", icon: "fas fa-tachometer-alt", active: false },
                        { label: "Security", link: "#", icon: "far fa-file", active: false },
                        { label: "Groups", icon: "fas fa-list", active: true }
                    ]}
                />
                <Card className="card"
                    title={"Gérer le groupe"}
                >
                    <div className="row">
                        <div className="col-4">
                            <Card
                                title={"Ajouter un Groupe"}
                            >
                                <Input 
                                    type="text"
                                    label="Libellé :"
                                    name="Libelle"
                                    placeholder="Libelle"
                                />
                                <Textarea
                                    label={"description"}
                                    placeholder={"description"}
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <ButtonSimple
                                        className="btn btn-success"
                                        label="Enregister"

                                    ></ButtonSimple>
                                </div>
                                
                            </Card>
                        </div> 
                        <div className="col-8">
                            <NormalTabs items={tabItems} title={"Objet Role"} />
                        </div>
                    </div>
                </Card>
                <div className="row">
                    <div className="col-12">
                        <NormalTabs items={tabItems2} title={"Information générale"} />
                    </div>
                </div>

              
            </Main>
    )
}
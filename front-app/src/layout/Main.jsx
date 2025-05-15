import React, { Component } from "react";
import Header from "./Header";
import SiderBar from "./SiderBar";
import SettingSideBarColor from "./SettingSideBarColor";
import Footer from "./Footer";
import feather from 'feather-icons';
import { withTranslation } from 'react-i18next';  
import { Outlet } from "react-router-dom";

class Main extends Component {
    componentDidMount() {
        feather.replace();  // Pour remplacer les icônes Feather
    }

    render() {
        const { t } = this.props;  // Utilisation de `t` via les props injectées par `withTranslation`
        const { children } = this.props;

        return <>
                {/* <div className="loader" /> */}
                <Outlet/>
                <div id="app">
                    <div className="main-wrapper main-wrapper-1">
                        {/* <div className="navbar-bg" /> */}
                        <Header />
                        <SiderBar />

                        <div className="main-content">
                                {children} 
                            <SettingSideBarColor />
                        </div>
                        <Footer />
                    </div>
                </div>
        </>
    }
}

export default withTranslation()(Main);
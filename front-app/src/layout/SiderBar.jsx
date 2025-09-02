import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

class SiderBar extends Component {
  state = {
    openDropdowns: {
      admin: false, // Dropdown Admin
      settings: false, // Dropdown Settings
      security: false, // Dropdown Security
      // Ajoutez d'autres dropdowns ici si nécessaire
    },
  };

  // Méthode pour basculer l'état d'un dropdown spécifique
  toggleDropdown = (dropdownId) => {
    this.setState((prevState) => ({
      openDropdowns: {
        ...prevState.openDropdowns,
        [dropdownId]: !prevState.openDropdowns[dropdownId],
      },
    }));
  };

  render() {
    const { t } = this.props;
    const { openDropdowns } = this.state;

    return (
      <div className="main-sidebar sidebar-style-2">
        <aside id="sidebar-wrapper">
          <div className="sidebar-brand">
            <Link to="/dashboard">
              <img alt="logo" src="assets/img/logo.png" className="header-logo" />
              <span className="logo-name">Harmoni</span>
            </Link>
          </div>
          <ul className="sidebar-menu">
            <li className="menu-header">Main</li>
            <li className="dropdown active">
              <Link to="/dashboard" className="nav-link">
                <i data-feather="bar-chart-2" />
                <span>{t('welcome_dashboard')}</span>
              </Link>
            </li>
            {/* <li>
              <Link className="nav-link" to="/office">
                <i data-feather="monitor"></i>
                <span>{t('office_sidebar_title')}</span>
              </Link>
            </li> */}
            <li>
              <Link className="nav-link" to="/todo">
                <i data-feather="bookmark"></i>
                <span>{t('todo_sidebar_title')}</span>
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/configuration">
                <i data-feather="tool"></i>
                <span>{t('configuration_sidebar_title')}</span>
              </Link>
            </li>
            <li className="menu-header">Administration</li>
            {/* Dropdown Admin */}
            <li className={`dropdown ${openDropdowns.admin ? 'active' : ''}`}>
              <a
                href="#"
                className="menu-toggle nav-link has-dropdown"
                onClick={() => this.toggleDropdown('admin')}
              >
                <i data-feather="box"></i>
                <span>Admin</span>
              </a>
              <ul className={`dropdown-menu ${openDropdowns.admin ? 'show' : ''}`}>
                <li>
                  <Link className="nav-link" to="/plan_classement">
                    <span>{t('__gest_documentaire_')}</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/domaine_val">
                    <span>{t('__domai_va_leur_')}</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/forms">
                    <span>{t('__list_des_formulaire__')}</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/organigramme">
                    <span>Organigramme</span>
                  </Link>
                </li>
              </ul>
            </li>
          
            {/* Security  */}
            <li className={`dropdown ${openDropdowns.security ? 'active' : ''}`}>
              <a
                href="#"
                className="menu-toggle nav-link has-dropdown"
                onClick={() => this.toggleDropdown('security')}
              >
                <i data-feather="lock"></i>
                <span>Security</span>
              </a>
              <ul className={`dropdown-menu ${openDropdowns.security ? 'show' : ''}`}>
                <li>
                  <Link className="nav-link" to="/groups">
                    <span>Groupe d'utilisateurs</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/users">
                    <span>Utilisateurs</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link className="nav-link" to="/history">
                <i data-feather="align-left"></i>
                <span>{t('history_sidebar_title')}</span>
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/advanced-analytics">
                <i data-feather="bar-chart"></i>
                <span>Analyse avancée</span>
              </Link>
            </li>
            {/* Dropdown Settings */}
            <li>
              <Link className="nav-link" to="/settings">
                <i data-feather="settings"></i>
                <span>{t('setting_sidebar_title')}</span>
              </Link>
            </li>
          </ul>
        </aside>
      </div>
    );
  }
}

export default withTranslation()(SiderBar);
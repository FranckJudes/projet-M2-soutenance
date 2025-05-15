import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <li className="dropdown dropdown-list-toggle mt-2">

            <img
                onClick={toggleDropdown}
                aria-label="Sélecteur de langue"
                aria-expanded={isOpen}
                alt={`Langue actuelle : ${i18n.language === 'en' ? 'Anglais' : 'Français'}`}
                src={i18n.language === 'en' ? '/assets/bundles/flag-icon-css/flags/4x3/gb.svg' : '/assets/bundles/flag-icon-css/flags/4x3/fr.svg'}
                className="img-fluid"
                style={{
                    width: 20,
                    height: 15,
                    objectFit: 'cover',
                    verticalAlign: 'middle',
                    marginRight:4
                }}
            />

            {isOpen && (
                <div className="dropdown-menu dropdown-menu-right pullDown show" role="menu">
                    <a
                        className="dropdown-item has-icon"
                        onClick={() => handleLanguageChange('en')}
                        id="lang-en"
                        style={{ border: "none", boxShadow: "none" }}
                    >
                        <img
                            className="img-fluid"
                            src="/assets/bundles/flag-icon-css/flags/4x3/gb.svg"
                            alt="United Kingdom Flag"
                            style={{ width: 15, height: 15, verticalAlign: 'middle' }}  // Ajouté ici aussi
                        />
                        &nbsp;Anglais
                    </a>
                    <a
                        className="dropdown-item has-icon"
                        onClick={() => handleLanguageChange('fr')}
                        id="lang-fr"
                        style={{ border: "none", boxShadow: "none" }}
                    >
                        <img
                            className="img-fluid"
                            src="/assets/bundles/flag-icon-css/flags/4x3/fr.svg"
                            alt="France Flag"
                            style={{ width: 15, height: 15, verticalAlign: 'middle' }}  // Ajouté ici aussi
                        />
                        &nbsp;Français
                    </a>
                </div>
            )}
        </li>
    );
};

export default LanguageSelector;
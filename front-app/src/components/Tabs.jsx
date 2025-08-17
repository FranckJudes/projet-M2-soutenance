import React, { useState, useEffect } from "react";
import { ButtonSimple } from "./Button";
import { authService } from '../api/authService';

const SERVICE_HARMONI = import.meta.env.VITE_BASE_SERVICE_HARMONI;

const Tabs = ({ items, title, footer }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [sharedData, setSharedData] = useState({});
    const [token, setToken] = useState(null);
    
    useEffect(() => {
        const sessionToken = sessionStorage.getItem('token');
        const localToken = localStorage.getItem('token');
        const serviceToken = authService.getToken();
        const isAuth = authService.isAuthenticated();
        
        if (serviceToken) {
            setToken(serviceToken);
        } else if (sessionToken) {
            setToken(sessionToken);
        } else if (localToken) {
            setToken(localToken);
            sessionStorage.setItem('token', localToken);
        }
    }, []); 

    const handleNext = async () => {
        if (activeIndex < items.length - 1) {
            if (activeIndex === 1) {
                try {
                    const xml = await sharedData.modelerRef.current?.saveXML({ format: true });

                    if (!xml || !xml.xml) {
                        return;
                    }

                    const xmlBlob = new Blob([xml.xml], { type: "application/xml" });

                    const formData = new FormData();
                    formData.append("file", xmlBlob, "diagram.bpmn");
                    
                    const response = await fetch(`${SERVICE_HARMONI}/bpmn/upload`, {
                        method: "POST",
                        body: formData,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Erreur HTTP : ${response.status} - ${response.statusText}`);
                    }
                    const data = await response.json();

                    setSharedData((prev) => ({
                        ...prev,
                        processElements: data,
                    }));
                } catch (error) {
                }
            }

            setActiveIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (activeIndex > 0) {
            setActiveIndex((prev) => prev - 1);
        }
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h4>{title}</h4>
                        <div className="card-header-action">
                            {footer && (
                                <>
                                    <ButtonSimple
                                        className="btn btn-icon icon-right btn-primary p-1 mr-2"
                                        label="Précédent"
                                        disabled={activeIndex === 0}
                                        onClick={handlePrevious}
                                    />
                                    <ButtonSimple
                                        className="btn btn-info btn-icon icon-right p-1"
                                        label="Suivant"
                                        disabled={activeIndex === items.length - 1}
                                        onClick={handleNext}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            {items.map((item, index) => (
                                <li className="nav-item" key={index}>
                                    <a
                                        className={`nav-link ${index === activeIndex ? "active" : ""}`}
                                        onClick={() => setActiveIndex(index)}
                                        role="tab"
                                    >
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="tab-content">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`tab-pane fade ${index === activeIndex ? "show active" : ""}`}
                                >
                                    {React.cloneElement(item.content, {
                                        sharedData,
                                        setSharedData,
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tabs;


/**
 * NormalTabs normal avec manuel d'utilisation
 * 
 */
{
    // Manuel d'utilisation du tab
    /*
        import HomeContent from './HomeContent';
        import ProfileContent from './ProfileContent';
        import ContactContent from './ContactContent';

        const tabItems = [
          { id: "home", title: "Home", content: <HomeContent /> },
          { id: "profile", title: "Profile", content: <ProfileContent /> },
          { id: "contact", title: "Contact", content: <ContactContent /> }
        ];

        <NormalTabs items={tabItems} title="Titre du tabs" />

    */
}

export const NormalTabs = ({ items, title, footer }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    
    const handleTabChange = (newIndex) => {
        setActiveIndex(newIndex);
        // Notify the component about tab change if it has an onTabChange callback
        const activeItem = items[newIndex];
        if (activeItem && activeItem.onTabChange) {
            activeItem.onTabChange();
        }
    };

    const handleNext = () => {
        if (activeIndex < items.length - 1) {
            setActiveIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (activeIndex > 0) {
            setActiveIndex((prev) => prev - 1);
        }
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h4>{title}</h4>
                    </div>
                    <div className="card-body">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            {items.map((item, index) => (
                                <li className="nav-item" key={index}>
                                    <a
                                        className={`nav-link ${index === activeIndex ? "active" : ""}`}
                                        id={`${item.id}-tab`}
                                        onClick={() => setActiveIndex(index)}
                                        role="tab"
                                        aria-controls={item.id}
                                        aria-selected={index === activeIndex}
                                    >
                                        {item.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="tab-content" id="myTabContent">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`tab-pane fade ${index === activeIndex ? "show active" : ""}`}
                                    id={item.id}
                                    role="tabpanel"
                                    aria-labelledby={`${item.id}-tab`}
                                >
                                    {item.content}
                                </div>
                            ))}
                        </div>
                    </div>
                    {footer && (
                        <div className="card-footer">
                            <div className="d-flex justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-default"
                                    style={{
                                        backgroundColor: "#3e3e3e",
                                        color: "aliceblue",
                                        padding: 10,
                                        marginRight: 10
                                    }}
                                    onClick={handlePrevious}
                                    disabled={activeIndex === 0}
                                >
                                    <i className="fa fa-chevron-left"></i> Précédent
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-info"
                                    style={{padding: 10}}
                                    onClick={handleNext}
                                    disabled={activeIndex === items.length - 1}
                                >
                                    Suivant <i className="fa fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};




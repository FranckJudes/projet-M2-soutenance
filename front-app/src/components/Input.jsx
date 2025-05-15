import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

export const Input = ({ type, name, label, value, className = "form-control", onChange ,...props}) => {
    return (
        <div className="form-group">
            <label>{label} </label>
            <input type={type} className={className} name={name} value={value} onChange={onChange} {...props}/>
        </div>
    );
};


export const Textarea = ({ name, label, value, onChange , ...props}) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <textarea className="form-control" name={name} value={value} onChange={onChange} {...props} />
        </div>
    );
};



export const InputAdd = ({details}) => {
    const { t } = useTranslation();
    const [forms, setForms] = useState([{ id: 1, value: "" }]); 
    
    const handleAddForm = () => {
        const newForm = { id: forms.length + 1, value: "" };
        setForms([...forms, newForm]); 
    };
    
    const handleDeleteForm = (id) => {
        setForms(forms.filter((form) => form.id !== id)); 
    };
    
    const handleInputChange = (id, value) => {
        setForms(forms.map((form) => (form.id === id ? { ...form, value } : form)));
    };
    
    return (
        <div>
        {forms.map((form, index) => (
            <div className="row mb-3" key={form.id}>
            <div className="col-12">
                <div className="input-group colorpickerinput">
                <input
                    type="text"
                    className="form-control"
                    value={form.value}
                    onChange={(e) => handleInputChange(form.id, e.target.value)}
                />
                <div className="input-group-append">
                    {/* Bouton pour ajouter un formulaire */}
                   {index == 0 &&  <div
                    className="input-group-text"
                    style={{ cursor: "pointer", backgroundColor: "#20c997" , color:'white'}}
                    onClick={handleAddForm}
                    >
                    <i className="fas fa-plus" />
                    </div>}
                    {/* Bouton pour supprimer le formulaire, sauf pour le premier élément */}
                    {index > 0 && (
                    <div
                        className="input-group-text"
                        style={{ cursor: "pointer", color: "white", backgroundColor: "#dc3545", gap:9 }}
                        onClick={() => handleDeleteForm(form.id)}
                    >
                       
                        <i className="fas fa-times" />
                        
                    </div>

                    )}
                </div>
                </div>
            </div>
            </div>
        ))}
        <p>{details}</p>
        </div>
    );
};
               

export const Checkbox = ({ label, id, name, onChange}) => {
    return (
        <div className="custom-control custom-checkbox m-2">
            <input type="checkbox" className="custom-control-input" name={name} id={id}   onChange={onChange} />
            <label className="custom-control-label" htmlFor={id}>
                {label}
            </label>
        </div>
    );
};

export const Radio = ({ label, name, onChange}) => {
    return (
        <label className="custom-switch">
            <input type="checkbox" name={name} onChange={onChange} className="custom-switch-input" />
            <span className="custom-switch-indicator" />
            <span className="custom-switch-description"> {label}</span>
      </label>        
    )
};

export const RadioButton = ({ label, value, name, checked, onChange }) => {
    return (
        <label className="custom-switch mb-2">
            <input
                type="radio"
                name={name}
                value={value}
                className="custom-switch-input"
                checked={checked}
                onChange={onChange}
            />
            <span className="custom-switch-indicator"></span>
            <span className="custom-switch-description">{label}</span>
        </label>
    );
};

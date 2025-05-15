import React from "react";

const Activity = ({ icon, time, message, linkText, linkHref, dropdownOptions }) => (
    <div className="activity">
        <div className={`activity-icon bg-primary text-white`}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="activity-detail">
            <div className="mb-2">
                <span className="text-job">{time}</span>
                <span className="bullet"></span>
                {linkHref && (
                    <a className="text-job" href={linkHref}>
                        {linkText}
                    </a>
                )}
                <div className="float-right dropdown">
                    <a href="#" data-toggle="dropdown">
                        <i className="fas fa-ellipsis-h"></i>
                    </a>
                    <div className="dropdown-menu">
                        <div className="dropdown-title">Options</div>
                        {dropdownOptions.map((option, index) => (
                            <a
                                key={index}
                                href={option.href}
                                className={`dropdown-item has-icon ${option.className}`}
                                data-confirm={option.confirm}
                                data-confirm-text-yes={option.confirmTextYes}
                            >
                                <i className={`fas ${option.icon}`}></i> {option.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <p>{message}</p>
        </div>
    </div>
);

const TimelineSection = ({ title, activities }) => (
    <section className="section">
        <div className="section-body">
            <h2 className="section-title">{title}</h2>
            <div className="row">
                <div className="col-12">
                    <div className="activities">
                        {activities.map((activity, index) => (
                            <Activity key={index} {...activity} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export const Timeline = ({ title, elements }) => {
    if (!elements || elements.length === 0) {
        return <div>Aucune activité disponible.</div>;
    }

    const activities = elements.map((element, index) => {
        // Déterminer l'icône en fonction du type d'élément
        let icon = "far fa-question-circle";

        // Comparaison directe des types d'éléments pour déterminer l'icône
        if (element.type === "startEvent") {
            icon = "far fa-arrow-alt-circle-right";
        } else if (element.type === "endEvent") {
            icon = "far fa-dot-circle";
        } else if (element.type === "task") {
            icon = "far fa-check-square";
        } else if (element.type === "gateway") {
            icon = "fas fa-expand-arrows-alt";
        }

        // Formatage du message pour l'affichage
        const message = `${element.name}`;
        
        // Lien dynamique basé sur l'ID de l'élément
        const linkHref = element.id ? `#${element.id}` : "#";

        return {
            icon,
            time: `${index + 1} min ago`, // Temps simulé pour chaque activité
            message,
            linkText: "View",
            linkHref,
            dropdownOptions: [
                { icon: "fa-eye", label: "View", href: linkHref, className: "" },
                { icon: "fa-list", label: "Detail", href: linkHref, className: "" },
                {
                    icon: "fa-trash-alt",
                    label: "Archive",
                    href: linkHref,
                    className: "text-danger",
                    confirm: "Wait, wait, wait...|This action can't be undone. Want to take risks?",
                    confirmTextYes: "Yes, IDC",
                },
            ],
        };
    });

    return <TimelineSection title={title} activities={activities} />;
};

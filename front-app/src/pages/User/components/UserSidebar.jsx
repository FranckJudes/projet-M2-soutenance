import React from 'react';
import { Nav } from 'react-bootstrap';

const UserSidebar = ({ activeSection, setActiveSection, userSections }) => {
  return (
    <div className="settings-sidebar bg-white rounded shadow-sm p-0 mb-4">
      <h5 className="sidebar-header p-3 border-bottom">Gestion des utilisateurs</h5>
      <Nav className="flex-column">
        {userSections.map((section) => (
          <Nav.Link
            key={section.id}
            className={`sidebar-item p-3 border-bottom ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <div className="d-flex align-items-center">
              <div className="sidebar-icon me-3">
                <i className={section.icon}></i>
              </div>
              <div className="sidebar-content pl-2">
                <div className="sidebar-title">{section.label}</div>
                <div className="sidebar-description text-muted small">{section.description}</div>
              </div>
            </div>
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

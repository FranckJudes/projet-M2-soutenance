import React from 'react';
import { Card } from 'react-bootstrap';

const GenericSettingsSection = ({ title, children }) => {
  return (
    <div className="settings-section">
      <h2 className="mb-4">{title}</h2>
      <Card className="mb-4">
        <Card.Body>
          {children || <p className="text-muted">Cette section sera implémentée ultérieurement.</p>}
        </Card.Body>
      </Card>
    </div>
  );
};

export default GenericSettingsSection;

import React from 'react';
import PropTypes from 'prop-types';
import '../utils/Timeline.css';
import  { useState, useEffect } from 'react';

const HorizontalTimeLine = ({ events, onViewEvent }) => {
  const [hover, setHover] = useState(false); // Déclare l'état hover

  return (
    <div className="row">
      <div className="col-12">
        <div className="activities">
          {events.map((event, index) => (
            <div key={index} className="activity" style={{cursor:'pointer'}} onMouseEnter={() => setHover(true)}  onMouseLeave={() => setHover(false)}>
              <div className={`activity-icon bg-${event.badgeType} text-white`}>
                <i className={`fa ${event.icon}`} />
              </div>
              <div className="activity-detail"    onClick={() => onViewEvent(event)}>
                <div className="mb-2">
                  <span className="text-job">{event.title}</span>
                  
                </div>
                {event.name && <p>{event.name}</p>}

                {event.type === 'compositeTask' && Array.isArray(event.tasks) && (
                  <div className="composite-tasks">
                    {event.tasks.map((compositeEvent, taskIndex) => (
                      <div key={taskIndex} className="buttons" style={{cursor:'pointer'}}>
                        <button
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem 1rem',
                          }}
                          className="btn btn-outline-info"
                          type="button"
                          aria-label=""
                          onClick={() => onViewEvent(compositeEvent)}
                        >
                          <i className="fas fa-file-download" style={{ marginRight: '0.5rem' }} />
                          <span style={{ flex: 1, textAlign: 'center' }}>
                            {compositeEvent.name || 'Nom non defini'}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

HorizontalTimeLine.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      body: PropTypes.string,
      badgeType: PropTypes.string.isRequired, // e.g., "primary", "success", "danger", etc.
      icon: PropTypes.string.isRequired, // Font Awesome icon class (e.g., "fa-check")
      inverted: PropTypes.bool, // Whether the timeline item is inverted
      timeIcon: PropTypes.string, // Optional icon class for the time
      type: PropTypes.string.isRequired, // Type of the event, e.g., compositeTask
      name: PropTypes.string, // Name of the event (optional)
      composite: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string,
          type: PropTypes.string,
        })
      ), // Array of composite events
    })
  ).isRequired,
};

export default HorizontalTimeLine;

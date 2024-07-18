import React from 'react';
import { Form, Button, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import './AutoDiscovery.css';

const ThreatIntelSearch = ({ domain, setDomain, handleThreatIntel, loading, setShowToast }) => {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Provide your domain in the below field to gather threat intelligence data.
    </Tooltip>
  );

  return (
    <div className="auto-discovery">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>Threat Intel</span>
        <OverlayTrigger placement="right" overlay={renderTooltip}>
          <span>
            <FaInfoCircle style={{ cursor: 'pointer', fontSize: '16px', color: '#007bff', marginLeft: '10px' }} />
          </span>
        </OverlayTrigger>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Form>
          <Form.Group>
            <Form.Label>Domain</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter domain"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setShowToast(false);
              }}
              disabled={loading} // Disable input while loading
            />
          </Form.Group>
          <Button onClick={handleThreatIntel} disabled={loading} style={{ marginTop: '10px' }}>
            Gather Threat Intel
          </Button>
          {loading && (
            <div className="loading-overlay">
              <Spinner animation="border" role="status">
                <span className="sr-only">Gathering...</span>
              </Spinner>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default ThreatIntelSearch;

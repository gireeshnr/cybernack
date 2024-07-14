import React from 'react';
import { Form, Button, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import './AutoDiscovery.css';

const AutoDiscovery = ({ domain, setDomain, handleAutoDiscovery, loading, setShowToast }) => {
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Provide your domain in the below field and search for related domains. You can add or update assets after discovery.
    </Tooltip>
  );

  return (
    <div className="auto-discovery">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>Auto Discover</span>
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
              placeholder="Enter primary domain"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setShowToast(false);
              }}
              disabled={loading} // Disable input while loading
            />
          </Form.Group>
          <Button onClick={handleAutoDiscovery} disabled={loading} style={{ marginTop: '10px' }}>
            Discover
          </Button>
          {loading && (
            <div className="loading-overlay">
              <Spinner animation="border" role="status">
                <span className="sr-only">Discovering...</span>
              </Spinner>
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default AutoDiscovery;

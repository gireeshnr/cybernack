import React from 'react';
import { Form, Button } from 'react-bootstrap';
import './AddNewAsset.css';

const AddNewAsset = ({ newAsset, setNewAsset, handleAddNewAsset }) => {
  return (
    <div className="add-new-asset" style={{ textAlign: 'left', marginBottom: '20px' }}>
      <h3>Add New Asset</h3>
      <Form>
        <Form.Group>
          <Form.Label>Domain<span style={{ color: 'red' }}>*</span></Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter domain"
            value={newAsset.domain}
            onChange={(e) => setNewAsset({ ...newAsset, domain: e.target.value })}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Type<span style={{ color: 'red' }}>*</span></Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter type"
            value={newAsset.type}
            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>IP Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter IP address"
            value={newAsset.ip}
            onChange={(e) => setNewAsset({ ...newAsset, ip: e.target.value })}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Ports</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter ports (comma separated)"
            value={newAsset.ports}
            onChange={(e) => setNewAsset({ ...newAsset, ports: e.target.value })}
          />
        </Form.Group>
        <Button onClick={handleAddNewAsset} style={{ marginTop: '10px' }}>
          Add Asset
        </Button>
      </Form>
    </div>
  );
};

export default AddNewAsset;

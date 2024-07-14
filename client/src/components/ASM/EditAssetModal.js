import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import './EditAssetModal.css';

const EditAssetModal = ({ editAsset, setEditAsset, showModal, setShowModal, handleUpdateAsset }) => {
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Asset</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Domain</Form.Label>
            <Form.Control
              type="text"
              value={editAsset.domain}
              onChange={(e) => setEditAsset({ ...editAsset, domain: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Control
              type="text"
              value={editAsset.type}
              onChange={(e) => setEditAsset({ ...editAsset, type: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>IP Address</Form.Label>
            <Form.Control
              type="text"
              value={editAsset.ip}
              onChange={(e) => setEditAsset({ ...editAsset, ip: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ports</Form.Label>
            <Form.Control
              type="text"
              value={editAsset.ports.join(', ')}
              onChange={(e) => setEditAsset({ ...editAsset, ports: e.target.value.split(',').map(Number) })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateAsset}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditAssetModal;

import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './ConfirmDeleteModal.css';

const ConfirmDeleteModal = ({ showConfirmation, setShowConfirmation, confirmDeleteAssets }) => {
  return (
    <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete the selected assets?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirmDeleteAssets}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteModal;

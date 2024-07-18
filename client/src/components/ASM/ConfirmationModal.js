// src/components/ASM/ConfirmationModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, onHide, onConfirm, domain }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        This will trigger an Auto Discovery on the domain {domain}. Do you want to proceed?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          No
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;

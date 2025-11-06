import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsCheckCircle } from 'react-icons/bs';

function SuccessModal({ show, onHide, message, title = 'Success' }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <BsCheckCircle size={64} style={{ color: '#28a745', marginBottom: '1rem' }} />
        <h5 className="mb-3">{title}</h5>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pb-4">
        <Button variant="dark" onClick={onHide}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SuccessModal;


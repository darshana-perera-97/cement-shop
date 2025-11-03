import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import API_BASE_URL from '../config';

function ViewBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bills`);
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      } else {
        setError('Failed to fetch bills');
      }
    } catch (error) {
      setError('Error connecting to server. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleView = (bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBill(null);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">View Bills</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {bills.length === 0 ? (
        <Alert variant="info">No bills found.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Total Bill</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => (
              <tr key={index}>
                <td>{formatDate(bill.date)}</td>
                <td>{bill.customerName}</td>
                <td>{bill.billTotal.toFixed(2)}</td>
                <td>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => handleView(bill)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for viewing bill details */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bill Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBill && (
            <>
              <div className="mb-3">
                <p><strong>Customer ID:</strong> {selectedBill.customerId}</p>
                <p><strong>Customer Name:</strong> {selectedBill.customerName}</p>
                <p><strong>Stock Number:</strong> {selectedBill.stockNumber}</p>
                <p><strong>Date:</strong> {formatDate(selectedBill.date)}</p>
              </div>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th style={{ width: '25%', textAlign: 'left' }}>Cement Type</th>
                    <th style={{ width: '25%' }}>Bags</th>
                    <th style={{ width: '25%' }}>Unit Price</th>
                    <th style={{ width: '25%' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td style={{ textAlign: 'left', padding: '0.375rem 0.75rem' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '0.375rem 0.75rem' }}>{item.bags}</td>
                      <td style={{ padding: '0.375rem 0.75rem' }}>
                        {item.unitPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.375rem 0.75rem' }}>
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      colSpan={3}
                      style={{ textAlign: 'right', fontWeight: 'bold', padding: '0.375rem 0.75rem' }}
                    >
                      Bill Total:
                    </td>
                    <td style={{ fontWeight: 'bold', padding: '0.375rem 0.75rem' }}>
                      {selectedBill.billTotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ViewBills;

import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        setError('Failed to fetch customers');
      }
    } catch (error) {
      setError('Error connecting to server. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (customerId) => {
    navigate(`/customer/${customerId}`);
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
      <h1 className="mb-4">View Customers</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {customers.length === 0 ? (
        <Alert variant="info">No customers found.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.customerId}>
                <td>{customer.customerId}</td>
                <td>{customer.customerName}</td>
                <td>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => handleView(customer.customerId)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ViewCustomers;

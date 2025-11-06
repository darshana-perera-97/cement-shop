import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Form, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const filterCustomers = () => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) => {
        const name = (customer.customerName || '').toLowerCase();
        const location = (customer.location || '').toLowerCase();
        const customerId = (customer.customerId || '').toLowerCase();
        return name.includes(query) ||
               location.includes(query) ||
               customerId.includes(query);
      });
      setFilteredCustomers(filtered);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
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
        <>
          {/* Search Field */}
          <Card className="mb-3">
            <Card.Body>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by name, location, or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.outline = 'none'}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Results count */}
          {searchQuery && (
            <div className="mb-3" style={{ fontSize: '14px', color: '#6c757d' }}>
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
            </div>
          )}

          {/* Customers Table */}
          {filteredCustomers.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <div style={{ fontSize: '48px', color: '#6c757d', marginBottom: '16px' }}>🔍</div>
                <div style={{ color: '#6c757d' }}>No customers match your search</div>
              </Card.Body>
            </Card>
          ) : (
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th className="d-none d-md-table-cell">Customer ID</th>
                  <th>Customer Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customerId}>
                    <td className="d-none d-md-table-cell">{customer.customerId}</td>
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
        </>
      )}
    </Container>
  );
}

export default ViewCustomers;

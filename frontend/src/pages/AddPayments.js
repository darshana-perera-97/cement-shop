import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, ListGroup } from 'react-bootstrap';
import API_BASE_URL from '../config';

function AddPayments() {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    date: '',
    notes: ''
  });
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

  useEffect(() => {
    fetchCustomers();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setShowCustomerDropdown(true);
    if (value === '') {
      setFormData((prev) => ({
        ...prev,
        customerId: '',
        customerName: ''
      }));
    }
  };

  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customer.customerId,
      customerName: customer.customerName
    }));
    setCustomerSearch(customer.customerName);
    setShowCustomerDropdown(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, message: '', variant: '' });

    try {
      const paymentData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        amount: parseFloat(formData.amount) || 0,
        date: formData.date,
        notes: formData.notes
      };

      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          show: true,
          message: 'Payment added successfully!',
          variant: 'success'
        });
        // Reset form
        setFormData({
          customerId: '',
          customerName: '',
          amount: '',
          date: '',
          notes: ''
        });
        setCustomerSearch('');
      } else {
        setAlert({
          show: true,
          message: data.error || 'Failed to add payment',
          variant: 'danger'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: 'Error connecting to server. Please make sure the backend server is running.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Add Payments</h1>
      <Card>
        <Card.Body>
          {alert.show && (
            <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false })}>
              {alert.message}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 customer-search-container" style={{ position: 'relative' }}>
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Customer Name *</Form.Label>
              <Form.Control
                type="text"
                value={customerSearch}
                onChange={handleCustomerSearch}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Search customer by name or ID"
                style={{ outline: 'none', boxShadow: 'none' }}
                required
              />
              {showCustomerDropdown && customerSearch && filteredCustomers.length > 0 && (
                <ListGroup
                  style={{
                    position: 'absolute',
                    zIndex: 1000,
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    marginTop: '2px'
                  }}
                >
                  {filteredCustomers.map((customer) => (
                    <ListGroup.Item
                      key={customer.customerId}
                      action
                      onClick={() => handleCustomerSelect(customer)}
                      style={{ cursor: 'pointer' }}
                    >
                      {customer.customerName} ({customer.customerId})
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              {showCustomerDropdown && customerSearch && filteredCustomers.length === 0 && (
                <ListGroup
                  style={{
                    position: 'absolute',
                    zIndex: 1000,
                    width: '100%',
                    marginTop: '2px'
                  }}
                >
                  <ListGroup.Item>No customers found</ListGroup.Item>
                </ListGroup>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Amount *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleFormChange}
                placeholder="Enter payment amount"
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => (e.target.style.outline = 'none')}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Date *</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => (e.target.style.outline = 'none')}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Enter notes (optional)"
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => (e.target.style.outline = 'none')}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Payment'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddPayments;

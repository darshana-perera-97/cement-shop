import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Table, ListGroup } from 'react-bootstrap';
import API_BASE_URL from '../config';

function AddBill() {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    stockNumber: '',
    date: ''
  });
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [items, setItems] = useState([
    { name: 'Tokyo', bags: '', unitPrice: '', total: 0 },
    { name: 'Sanstha', bags: '', unitPrice: '', total: 0 },
    { name: 'Atlas', bags: '', unitPrice: '', total: 0 },
    { name: 'Nipon', bags: '', unitPrice: '', total: 0 }
  ]);
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

  const filteredCustomers = customers.filter(customer =>
    customer.customerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setShowCustomerDropdown(true);
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        customerName: ''
      }));
    }
  };

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.customerId,
      customerName: customer.customerName
    }));
    setCustomerSearch(customer.customerName);
    setShowCustomerDropdown(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    // Calculate total for this item
    const bags = parseFloat(newItems[index].bags) || 0;
    const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
    newItems[index].total = bags * unitPrice;
    
    setItems(newItems);
  };

  const calculateBillTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ show: false, message: '', variant: '' });

    try {
      const billData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        stockNumber: formData.stockNumber,
        date: formData.date,
        items: items.map(item => ({
          name: item.name,
          bags: parseFloat(item.bags) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          total: item.total
        })),
        billTotal: calculateBillTotal()
      };

      const response = await fetch(`${API_BASE_URL}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          show: true,
          message: 'Bill added successfully!',
          variant: 'success'
        });
        // Reset form
        setFormData({
          customerId: '',
          customerName: '',
          stockNumber: '',
          date: ''
        });
        setCustomerSearch('');
        setItems([
          { name: 'Tokyo', bags: '', unitPrice: '', total: 0 },
          { name: 'Sanstha', bags: '', unitPrice: '', total: 0 },
          { name: 'Atlas', bags: '', unitPrice: '', total: 0 },
          { name: 'Nipon', bags: '', unitPrice: '', total: 0 }
        ]);
      } else {
        setAlert({
          show: true,
          message: data.error || 'Failed to add bill',
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
      <h1 className="mb-4">Add Bill</h1>
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
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Stock Number</Form.Label>
              <Form.Control
                type="text"
                name="stockNumber"
                value={formData.stockNumber}
                onChange={handleFormChange}
                placeholder="Enter stock number"
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.outline = 'none'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.outline = 'none'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ textAlign: 'left', display: 'block' }}>Cement Type</Form.Label>
              <Table striped bordered hover>
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: '25%', textAlign: 'left' }}>Cement Type</th>
                    <th style={{ width: '25%' }}>Bags</th>
                    <th style={{ width: '25%' }}>Unit Price</th>
                    <th style={{ width: '25%' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ width: '25%', textAlign: 'left', padding: '0.375rem 0.75rem' }}>{item.name}</td>
                      <td style={{ width: '25%' }}>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={item.bags}
                          onChange={(e) => handleItemChange(index, 'bags', e.target.value)}
                          placeholder="0"
                          style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                          onFocus={(e) => e.target.style.outline = 'none'}
                        />
                      </td>
                      <td style={{ width: '25%' }}>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          placeholder="0"
                          style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                          onFocus={(e) => e.target.style.outline = 'none'}
                        />
                      </td>
                      <td style={{ width: '25%', padding: '0.375rem 0.75rem' }}>{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold', padding: '0.375rem 0.75rem' }}>
                      Bill Total:
                    </td>
                    <td style={{ fontWeight: 'bold', padding: '0.375rem 0.75rem' }}>{calculateBillTotal().toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Bill'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddBill;

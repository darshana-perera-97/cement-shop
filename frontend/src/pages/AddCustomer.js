import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function AddCustomer() {
    const [formData, setFormData] = useState({
        customerName: '',
        location: '',
        contactNumber: '',
        pastBills: ''
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert({ show: false, message: '', variant: '' });

        try {
            const response = await fetch('http://localhost:5000/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName: formData.customerName,
                    location: formData.location,
                    contactNumber: formData.contactNumber,
                    pastBills: formData.pastBills ? parseFloat(formData.pastBills) : 0
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setAlert({
                    show: true,
                    message: `Customer added successfully! Customer ID: ${data.customer.customerId}`,
                    variant: 'success'
                });
                // Reset form
                setFormData({
                    customerName: '',
                    location: '',
                    contactNumber: '',
                    pastBills: ''
                });
            } else {
                setAlert({
                    show: true,
                    message: data.error || 'Failed to add customer',
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
            <h1 className="mb-4">Add Customer</h1>
            <Card>
                <Card.Body>
                    {alert.show && (
                        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false })}>
                            {alert.message}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ textAlign: 'left', display: 'block' }}>Customer Name *</Form.Label>
                            <Form.Control
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Enter customer name"
                                style={{ outline: 'none', boxShadow: 'none' }}
                                onFocus={(e) => e.target.style.outline = 'none'}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ textAlign: 'left', display: 'block' }}>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter location"
                                style={{ outline: 'none', boxShadow: 'none' }}
                                onFocus={(e) => e.target.style.outline = 'none'}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ textAlign: 'left', display: 'block' }}>Contact Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Enter contact number"
                                style={{ outline: 'none', boxShadow: 'none' }}
                                onFocus={(e) => e.target.style.outline = 'none'}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ textAlign: 'left', display: 'block' }}>Past Bills</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="pastBills"
                                value={formData.pastBills}
                                onChange={handleChange}
                                placeholder="Enter past bills amount"
                                style={{ outline: 'none', boxShadow: 'none' }}
                                onFocus={(e) => e.target.style.outline = 'none'}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Customer'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AddCustomer;

import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal, Form, Card, Pagination } from 'react-bootstrap';
import API_BASE_URL from '../config';

function ViewPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    date: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    fetchPayments();
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

  useEffect(() => {
    filterPayments();
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, payments]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateMonthDay = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const filterPayments = () => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter((payment) => {
        const customerName = (payment.customerName || '').toLowerCase();
        const customerId = (payment.customerId || '').toLowerCase();
        const formattedDate = formatDate(payment.date).toLowerCase();
        const dateString = (payment.date || '').toLowerCase();
        const notes = (payment.notes || '').toLowerCase();
        
        return customerName.includes(query) ||
               customerId.includes(query) ||
               formattedDate.includes(query) ||
               dateString.includes(query) ||
               notes.includes(query);
      });
      setFilteredPayments(filtered);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
        setFilteredPayments(data);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (error) {
      setError('Error connecting to server. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setEditData({
      customerId: payment.customerId || '',
      customerName: payment.customerName || '',
      amount: payment.amount || '',
      date: payment.date || '',
      notes: payment.notes || ''
    });
    setCustomerSearch(payment.customerName || '');
    setIsEditing(false);
    setSaveError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
    setIsEditing(false);
    setSaveError('');
    setCustomerSearch('');
  };

  const handleEditToggle = () => {
    setIsEditing(true);
    setSaveError('');
  };

  const handleEditCancel = () => {
    if (selectedPayment) {
      setEditData({
        customerId: selectedPayment.customerId || '',
        customerName: selectedPayment.customerName || '',
        amount: selectedPayment.amount || '',
        date: selectedPayment.date || '',
        notes: selectedPayment.notes || ''
      });
      setCustomerSearch(selectedPayment.customerName || '');
    }
    setIsEditing(false);
    setSaveError('');
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
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
      setEditData((prev) => ({
        ...prev,
        customerId: '',
        customerName: ''
      }));
    }
  };

  const handleCustomerSelect = (customer) => {
    setEditData((prev) => ({
      ...prev,
      customerId: customer.customerId,
      customerName: customer.customerName
    }));
    setCustomerSearch(customer.customerName);
    setShowCustomerDropdown(false);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.First key="first" onClick={() => handlePageChange(1)} />
      );
      items.push(
        <Pagination.Prev key="prev" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} />
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      items.push(
        <Pagination.Next key="next" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} />
      );
      items.push(
        <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} />
      );
    }

    return items;
  };

  const handleSave = async () => {
    if (!selectedPayment || !selectedPayment.createdAt) {
      setSaveError('Cannot update payment: missing identifier');
      return;
    }

    if (!editData.customerId || !editData.customerName) {
      setSaveError('Customer selection is required');
      return;
    }

    if (!editData.amount || parseFloat(editData.amount) <= 0) {
      setSaveError('Valid payment amount is required');
      return;
    }

    if (!editData.date) {
      setSaveError('Date is required');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const paymentData = {
        createdAt: selectedPayment.createdAt,
        customerId: editData.customerId,
        customerName: editData.customerName,
        amount: parseFloat(editData.amount),
        date: editData.date,
        notes: editData.notes || ''
      };

      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh payments list
        await fetchPayments();
        handleCloseModal();
      } else {
        setSaveError(data.error || 'Failed to update payment');
      }
    } catch (error) {
      setSaveError('Error connecting to server. Please make sure the backend server is running.');
    } finally {
      setSaving(false);
    }
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
      <h1 className="mb-4">View Payments</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {payments.length === 0 ? (
        <Alert variant="info">No payments found.</Alert>
      ) : (
        <>
          {/* Search Field */}
          <Card className="mb-3">
            <Card.Body>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by customer name, ID, date, or notes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.outline = 'none'}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Results count */}
          <div className="mb-3" style={{ fontSize: '14px', color: '#6c757d' }}>
            Showing {filteredPayments.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPayments.length)} of {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
            {searchQuery && ' (filtered)'}
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <div style={{ fontSize: '48px', color: '#6c757d', marginBottom: '16px' }}>🔍</div>
                <div style={{ color: '#6c757d' }}>No payments match your search</div>
              </Card.Body>
            </Card>
          ) : (
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th className="d-none d-md-table-cell">Customer ID</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((payment, index) => (
                  <tr key={index}>
                    <td>
                      <span className="d-none d-md-inline">{formatDate(payment.date)}</span>
                      <span className="d-inline d-md-none">{formatDateMonthDay(payment.date)}</span>
                    </td>
                    <td>{payment.customerName}</td>
                    <td className="d-none d-md-table-cell">{payment.customerId}</td>
                    <td>{payment.amount.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => handleView(payment)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {filteredPayments.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {renderPaginationItems()}
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal for viewing/editing payment details */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              {saveError && (
                <Alert variant="danger" dismissible onClose={() => setSaveError('')}>
                  {saveError}
                </Alert>
              )}
              <div className="mb-3">
                {isEditing ? (
                  <>
                    <Form.Group className="mb-3 customer-search-container" style={{ position: 'relative' }}>
                      <Form.Label><strong>Customer Name:</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={customerSearch}
                        onChange={handleCustomerSearch}
                        onFocus={() => setShowCustomerDropdown(true)}
                        placeholder="Search customer by name or ID"
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                      {showCustomerDropdown && customerSearch && filteredCustomers.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            zIndex: 1000,
                            width: '100%',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginTop: '2px',
                            backgroundColor: 'white',
                            border: '1px solid #ced4da',
                            borderRadius: '0.25rem'
                          }}
                        >
                          {filteredCustomers.map((customer) => (
                            <div
                              key={customer.customerId}
                              onClick={() => handleCustomerSelect(customer)}
                              style={{
                                padding: '0.5rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #e9ecef'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              {customer.customerName} ({customer.customerId})
                            </div>
                          ))}
                        </div>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>Amount:</strong></Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={editData.amount}
                        onChange={(e) => handleEditChange('amount', e.target.value)}
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>Date:</strong></Form.Label>
                      <Form.Control
                        type="date"
                        value={editData.date}
                        onChange={(e) => handleEditChange('date', e.target.value)}
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>Notes:</strong></Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editData.notes}
                        onChange={(e) => handleEditChange('notes', e.target.value)}
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    </Form.Group>
                  </>
                ) : (
                  <>
                    <p><strong>Customer ID:</strong> {selectedPayment.customerId}</p>
                    <p><strong>Customer Name:</strong> {selectedPayment.customerName}</p>
                    <p><strong>Amount:</strong> {selectedPayment.amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> {formatDate(selectedPayment.date)}</p>
                    {selectedPayment.notes && (
                      <p><strong>Notes:</strong> {selectedPayment.notes}</p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleEditCancel} disabled={saving}>
                Cancel
              </Button>
              <Button variant="dark" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="dark" onClick={handleEditToggle}>
                Edit Payment
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ViewPayments;


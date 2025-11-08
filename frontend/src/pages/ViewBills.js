import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal, Form, Card } from 'react-bootstrap';
import API_BASE_URL from '../config';

function ViewBills() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    stockNumber: '',
    date: '',
    items: []
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [searchQuery, bills]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateMonthDay = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const filterBills = () => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter((bill) => {
        const customerName = (bill.customerName || '').toLowerCase();
        const stockNumber = (bill.stockNumber || '').toLowerCase();
        const formattedDate = formatDate(bill.date).toLowerCase();
        const dateString = (bill.date || '').toLowerCase();
        
        return customerName.includes(query) ||
               stockNumber.includes(query) ||
               formattedDate.includes(query) ||
               dateString.includes(query);
      });
      setFilteredBills(filtered);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bills`);
      if (response.ok) {
        const data = await response.json();
        setBills(data);
        setFilteredBills(data);
      } else {
        setError('Failed to fetch bills');
      }
    } catch (error) {
      setError('Error connecting to server. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (bill) => {
    setSelectedBill(bill);
    setEditData({
      stockNumber: bill.stockNumber || '',
      date: bill.date,
      items: bill.items.map(item => ({
        name: item.name,
        bags: item.bags,
        unitPrice: item.unitPrice,
        total: item.total
      }))
    });
    setIsEditing(false);
    setSaveError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBill(null);
    setIsEditing(false);
    setSaveError('');
  };

  const handleEditToggle = () => {
    setIsEditing(true);
    setSaveError('');
  };

  const handleEditCancel = () => {
    if (selectedBill) {
      setEditData({
        stockNumber: selectedBill.stockNumber || '',
        date: selectedBill.date,
        items: selectedBill.items.map(item => ({
          name: item.name,
          bags: item.bags,
          unitPrice: item.unitPrice,
          total: item.total
        }))
      });
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...editData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: parseFloat(value) || 0
    };
    
    // Calculate total for this item
    const bags = newItems[index].bags || 0;
    const unitPrice = newItems[index].unitPrice || 0;
    newItems[index].total = bags * unitPrice;
    
    setEditData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const calculateBillTotal = () => {
    return editData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSave = async () => {
    if (!selectedBill || !selectedBill.createdAt) {
      setSaveError('Cannot update bill: missing identifier');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const billData = {
        createdAt: selectedBill.createdAt,
        customerId: selectedBill.customerId,
        customerName: selectedBill.customerName,
        stockNumber: editData.stockNumber,
        date: editData.date,
        items: editData.items.map(item => ({
          name: item.name,
          bags: item.bags || 0,
          unitPrice: item.unitPrice || 0,
          total: item.total || 0
        })),
        billTotal: calculateBillTotal()
      };

      const response = await fetch(`${API_BASE_URL}/api/bills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh bills list
        await fetchBills();
        handleCloseModal();
      } else {
        setSaveError(data.error || 'Failed to update bill');
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
      <h1 className="mb-4">View Bills</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {bills.length === 0 ? (
        <Alert variant="info">No bills found.</Alert>
      ) : (
        <>
          {/* Search Field */}
          <Card className="mb-3">
            <Card.Body>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by customer name, stock number, or date"
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
              {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''} found
            </div>
          )}

          {/* Bills Table */}
          {filteredBills.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <div style={{ fontSize: '48px', color: '#6c757d', marginBottom: '16px' }}>🔍</div>
                <div style={{ color: '#6c757d' }}>No bills match your search</div>
              </Card.Body>
            </Card>
          ) : (
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Customer Name</th>
                  <th className="d-none d-md-table-cell">Stock ID</th>
                  <th>Total Bill</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill, index) => (
                  <tr key={index}>
                    <td>
                      <span className="d-none d-md-inline">{formatDate(bill.date)}</span>
                      <span className="d-inline d-md-none">{formatDateMonthDay(bill.date)}</span>
                    </td>
                    <td>{bill.customerName}</td>
                    <td className="d-none d-md-table-cell">{bill.stockNumber || 'N/A'}</td>
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
        </>
      )}

      {/* Modal for viewing bill details */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bill Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBill && (
            <>
              {saveError && (
                <Alert variant="danger" dismissible onClose={() => setSaveError('')}>
                  {saveError}
                </Alert>
              )}
              <div className="mb-3">
                <p><strong>Customer ID:</strong> {selectedBill.customerId}</p>
                <p><strong>Customer Name:</strong> {selectedBill.customerName}</p>
                {isEditing ? (
                  <>
                    <Form.Group className="mb-2">
                      <Form.Label><strong>Stock Number:</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={editData.stockNumber}
                        onChange={(e) => handleEditChange('stockNumber', e.target.value)}
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label><strong>Date:</strong></Form.Label>
                      <Form.Control
                        type="date"
                        value={editData.date}
                        onChange={(e) => handleEditChange('date', e.target.value)}
                        style={{ outline: 'none', boxShadow: 'none' }}
                      />
                    </Form.Group>
                  </>
                ) : (
                  <>
                    <p><strong>Stock Number:</strong> {selectedBill.stockNumber || 'N/A'}</p>
                    <p><strong>Date:</strong> {formatDate(selectedBill.date)}</p>
                  </>
                )}
              </div>
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
                  {editData.items.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      <td style={{ textAlign: 'left', padding: '0.375rem 0.75rem' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '0.375rem 0.75rem' }}>
                        {isEditing ? (
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={item.bags}
                            onChange={(e) => handleItemChange(itemIndex, 'bags', e.target.value)}
                            style={{ outline: 'none', boxShadow: 'none', border: 'none', padding: '0.375rem 0.75rem' }}
                            onFocus={(e) => e.target.style.outline = 'none'}
                          />
                        ) : (
                          item.bags
                        )}
                      </td>
                      <td style={{ padding: '0.375rem 0.75rem' }}>
                        {isEditing ? (
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(itemIndex, 'unitPrice', e.target.value)}
                            style={{ outline: 'none', boxShadow: 'none', border: 'none', padding: '0.375rem 0.75rem' }}
                            onFocus={(e) => e.target.style.outline = 'none'}
                          />
                        ) : (
                          item.unitPrice.toFixed(2)
                        )}
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
                      {isEditing ? calculateBillTotal().toFixed(2) : selectedBill.billTotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </Table>
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
                Edit Data
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

export default ViewBills;

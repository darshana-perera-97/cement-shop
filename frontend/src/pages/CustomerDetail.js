import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config';

function CustomerDetail() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [combinedTransactions, setCombinedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer details
      const customerResponse = await fetch(`${API_BASE_URL}/api/customers`);
      if (customerResponse.ok) {
        const customers = await customerResponse.json();
        const foundCustomer = customers.find(c => c.customerId === customerId);
        if (foundCustomer) {
          setCustomer(foundCustomer);
        } else {
          setError('Customer not found');
        }
      }

      // Fetch bills
      const billsResponse = await fetch(`${API_BASE_URL}/api/bills`);
      if (billsResponse.ok) {
        const allBills = await billsResponse.json();
        const customerBills = allBills.filter(bill => bill.customerId === customerId);
        setBills(customerBills);
      }

      // Fetch payments
      const paymentsResponse = await fetch(`${API_BASE_URL}/api/payments`);
      if (paymentsResponse.ok) {
        const allPayments = await paymentsResponse.json();
        const customerPayments = allPayments.filter(payment => payment.customerId === customerId);
        setPayments(customerPayments);
      }
    } catch (error) {
      setError('Error connecting to server. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Combine bills and payments and sort by date
    const transactions = [
      ...bills.map(bill => ({
        date: bill.date,
        description: `Bill - Stock: ${bill.stockNumber}`,
        payments: 0,
        bills: bill.billTotal,
        type: 'bill'
      })),
      ...payments.map(payment => ({
        date: payment.date,
        description: payment.notes || 'Payment',
        payments: payment.amount,
        bills: 0,
        type: 'payment'
      }))
    ];

    // Sort by date (oldest first, latest at bottom)
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setCombinedTransactions(transactions);
  }, [bills, payments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const totalBills = bills.reduce((sum, bill) => sum + (bill.billTotal || 0), 0);
  const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const toBePaid = totalBills - totalPayments;

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !customer) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Customer Details</h1>
      
      {customer && (
        <>
          {/* Basic Customer Details */}
          <Card className="mb-4">
            <Card.Body>
              <h5>Basic Details</h5>
              <Table striped bordered size="sm">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Customer ID:</td>
                    <td>{customer.customerId}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Customer Name:</td>
                    <td>{customer.customerName}</td>
                  </tr>
                  {customer.location && (
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Location:</td>
                      <td>{customer.location}</td>
                    </tr>
                  )}
                  {customer.contactNumber && (
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Contact Number:</td>
                      <td>{customer.contactNumber}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card>
                <Card.Body>
                  <h6 className="text-muted">Total Bills</h6>
                  <h3>{totalBills.toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <h6 className="text-muted">Total Payments</h6>
                  <h3>{totalPayments.toFixed(2)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <h6 className="text-muted">To be Paid</h6>
                  <h3 style={{ color: toBePaid > 0 ? '#dc3545' : '#28a745' }}>
                    {toBePaid.toFixed(2)}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Combined Transactions Table */}
          <Card>
            <Card.Body>
              <h5 className="mb-3">Transaction History</h5>
              {combinedTransactions.length === 0 ? (
                <Alert variant="info">No transactions found.</Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Payments</th>
                      <th>Bills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>{formatDate(transaction.date)}</td>
                        <td>{transaction.description}</td>
                        <td style={{ color: transaction.type === 'payment' ? '#28a745' : '#6c757d' }}>
                          {transaction.payments > 0 ? transaction.payments.toFixed(2) : '-'}
                        </td>
                        <td style={{ color: transaction.type === 'bill' ? '#dc3545' : '#6c757d' }}>
                          {transaction.bills > 0 ? transaction.bills.toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default CustomerDetail;

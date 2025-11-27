import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Form, Card, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
    setCurrentPage(1); // Reset to first page when search changes
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

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
          <div className="mb-3" style={{ fontSize: '14px', color: '#6c757d' }}>
            Showing {filteredCustomers.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
            {searchQuery && ' (filtered)'}
          </div>

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
                {currentItems.map((customer) => (
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

          {/* Pagination */}
          {filteredCustomers.length > itemsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                {renderPaginationItems()}
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default ViewCustomers;

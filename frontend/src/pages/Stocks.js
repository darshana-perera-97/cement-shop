import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Form, Card } from 'react-bootstrap';
import API_BASE_URL from '../config';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [searchQuery, stocks]);

  const filterStocks = () => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter((stock) =>
        stock.stockId.toLowerCase().includes(query)
      );
      setFilteredStocks(filtered);
    }
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stocks`);
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
        setFilteredStocks(data);
      } else {
        setError('Failed to fetch stocks');
      }
    } catch (error) {
      setError('Error connecting to server. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
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
      <h1 className="mb-4">Stocks</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {stocks.length === 0 ? (
        <Alert variant="info">No stocks found.</Alert>
      ) : (
        <>
          {/* Search Field */}
          <Card className="mb-3">
            <Card.Body>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by stock ID"
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
              {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''} found
            </div>
          )}

          {/* Stocks Table */}
          {filteredStocks.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <div style={{ fontSize: '48px', color: '#6c757d', marginBottom: '16px' }}>🔍</div>
                <div style={{ color: '#6c757d' }}>No stocks match your search</div>
              </Card.Body>
            </Card>
          ) : (
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Stock ID</th>
                  <th>Tokyo</th>
                  <th>Sanstha</th>
                  <th>Atlas</th>
                  <th>Nipon</th>
                  <th>Total Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock, index) => (
                  <tr key={index}>
                    <td>{stock.stockId}</td>
                    <td>{stock.tokyo || 0}</td>
                    <td>{stock.sanstha || 0}</td>
                    <td>{stock.atlas || 0}</td>
                    <td>{stock.nipon || 0}</td>
                    <td>{stock.totalNumber || 0}</td>
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

export default Stocks;


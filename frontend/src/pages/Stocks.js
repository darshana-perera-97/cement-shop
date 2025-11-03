import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/stocks');
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
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
        <Table striped bordered hover>
          <thead>
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
            {stocks.map((stock, index) => (
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
    </Container>
  );
}

export default Stocks;


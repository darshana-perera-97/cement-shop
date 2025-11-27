import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner, Form, Card, Pagination } from 'react-bootstrap';
import API_BASE_URL from '../config';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    filterStocks();
    setCurrentPage(1); // Reset to first page when search changes
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

  // Calculate total bags for each type across all stocks
  const calculateTotals = () => {
    const totals = {
      tokyo: 0,
      samudra: 0,
      atlas: 0,
      nipon: 0,
      total: 0
    };
    
    stocks.forEach((stock) => {
      totals.tokyo += parseFloat(stock.tokyo || 0);
      totals.samudra += parseFloat(stock.sanstha || stock.Samudra || 0);
      totals.atlas += parseFloat(stock.atlas || 0);
      totals.nipon += parseFloat(stock.nipon || 0);
      totals.total += parseFloat(stock.totalNumber || 0);
    });
    
    return totals;
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

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
          <div className="mb-3" style={{ fontSize: '14px', color: '#6c757d' }}>
            Showing {filteredStocks.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStocks.length)} of {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''}
            {searchQuery && ' (filtered)'}
          </div>

          {/* Total Bags Summary */}
          {stocks.length > 0 && (
            <Card className="mb-3" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body>
                <h6 className="mb-3">Total Bags Across All Stocks</h6>
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <strong>Tokyo:</strong> {calculateTotals().tokyo}
                  </div>
                  <div className="col-md-3 mb-2">
                    <strong>Samudra:</strong> {calculateTotals().samudra}
                  </div>
                  <div className="col-md-3 mb-2">
                    <strong>Atlas:</strong> {calculateTotals().atlas}
                  </div>
                  <div className="col-md-3 mb-2">
                    <strong>Nipon:</strong> {calculateTotals().nipon}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-12">
                    <strong>Grand Total:</strong> {calculateTotals().total}
                  </div>
                </div>
              </Card.Body>
            </Card>
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
                  <th>Samudra</th>
                  <th>Atlas</th>
                  <th>Nipon</th>
                  <th>Total Number</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((stock, index) => (
                  <tr key={index}>
                    <td>{stock.stockId}</td>
                    <td>{stock.tokyo || 0}</td>
                    <td>{stock.sanstha || stock.Samudra || 0}</td>
                    <td>{stock.atlas || 0}</td>
                    <td>{stock.nipon || 0}</td>
                    <td>{stock.totalNumber || 0}</td>
                  </tr>
                ))}
                {filteredStocks.length > 0 && (
                  <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                    <td>Total</td>
                    <td>{calculateTotals().tokyo}</td>
                    <td>{calculateTotals().samudra}</td>
                    <td>{calculateTotals().atlas}</td>
                    <td>{calculateTotals().nipon}</td>
                    <td>{calculateTotals().total}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {filteredStocks.length > itemsPerPage && (
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

export default Stocks;


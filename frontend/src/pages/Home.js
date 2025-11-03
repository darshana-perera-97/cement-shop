import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Home() {
  const navigationCards = [
    { title: 'Add Customer', path: '/add-customer' },
    { title: 'View Customers', path: '/view-customers' },
    { title: 'Add Bills', path: '/add-bill' },
    { title: 'View Bills', path: '/view-bills' },
    { title: 'Add Payments', path: '/add-payments' },
    { title: 'Stocks', path: '/stocks' },
  ];

  return (
    <Container className="mt-5">
      <h1 className="mb-4 text-center">Home</h1>
      <Row className="g-4">
        {navigationCards.map((card, index) => (
          <Col key={index} xs={12} sm={6} md={4}>
            <Link to={card.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card className="h-100 shadow-sm" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                <Card.Body className="d-flex align-items-center justify-content-center" style={{ minHeight: '150px' }}>
                  <Card.Title className="mb-0 text-center">{card.title}</Card.Title>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Home;


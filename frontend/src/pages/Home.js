import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsPersonPlus, BsPeople, BsReceipt, BsFileEarmarkText, BsCreditCard, BsBoxes } from 'react-icons/bs';

function Home() {
  const navigationCards = [
    { title: 'Add Customer', path: '/add-customer', icon: <BsPersonPlus size={48} /> },
    { title: 'View Customers', path: '/view-customers', icon: <BsPeople size={48} /> },
    { title: 'Add Bills', path: '/add-bill', icon: <BsReceipt size={48} /> },
    { title: 'View Bills', path: '/view-bills', icon: <BsFileEarmarkText size={48} /> },
    { title: 'Add Payments', path: '/add-payments', icon: <BsCreditCard size={48} /> },
    { title: 'View Payments', path: '/view-payments', icon: <BsCreditCard size={48} /> },
    { title: 'Stocks', path: '/stocks', icon: <BsBoxes size={48} /> },
  ];

  return (
    <Container className="mt-5" style={{ paddingBottom: '3rem' }}>
      <h1 className="mb-4 text-center">Home</h1>
      <Row className="g-4">
        {navigationCards.map((card, index) => (
          <Col key={index} xs={6} sm={6} md={4}>
            <Link to={card.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card className="h-100 shadow-sm" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '150px' }}>
                  <div className="mb-3" style={{ color: '#6c757d' }}>
                    {card.icon}
                  </div>
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


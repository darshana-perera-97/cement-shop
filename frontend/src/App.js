import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './App.css';
import Home from './pages/Home';
import AddCustomer from './pages/AddCustomer';
import ViewCustomers from './pages/ViewCustomers';
import CustomerDetail from './pages/CustomerDetail';
import AddBill from './pages/AddBill';
import ViewBills from './pages/ViewBills';
import AddPayments from './pages/AddPayments';
import Stocks from './pages/Stocks';

function NavigationBar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">Cement Store</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {!isHomePage && (
              <Nav.Link as={Link} to="/">Back to Home</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/view-customers" element={<ViewCustomers />} />
          <Route path="/customer/:customerId" element={<CustomerDetail />} />
          <Route path="/add-bill" element={<AddBill />} />
          <Route path="/view-bills" element={<ViewBills />} />
          <Route path="/add-payments" element={<AddPayments />} />
          <Route path="/stocks" element={<Stocks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

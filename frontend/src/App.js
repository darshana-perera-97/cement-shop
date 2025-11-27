import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import AddCustomer from './pages/AddCustomer';
import ViewCustomers from './pages/ViewCustomers';
import CustomerDetail from './pages/CustomerDetail';
import AddBill from './pages/AddBill';
import ViewBills from './pages/ViewBills';
import AddPayments from './pages/AddPayments';
import ViewPayments from './pages/ViewPayments';
import Stocks from './pages/Stocks';

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on login page
  if (isLoginPage) {
    return null;
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">Cement Store</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            {!isHomePage && (
              <Nav.Link as={Link} to="/" className="me-3">Back to Home</Nav.Link>
            )}
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function AppRoutes() {
  return (
    <>
      <NavigationBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-customer"
          element={
            <ProtectedRoute>
              <AddCustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-customers"
          element={
            <ProtectedRoute>
              <ViewCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/:customerId"
          element={
            <ProtectedRoute>
              <CustomerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-bill"
          element={
            <ProtectedRoute>
              <AddBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-bills"
          element={
            <ProtectedRoute>
              <ViewBills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-payments"
          element={
            <ProtectedRoute>
              <AddPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-payments"
          element={
            <ProtectedRoute>
              <ViewPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stocks"
          element={
            <ProtectedRoute>
              <Stocks />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

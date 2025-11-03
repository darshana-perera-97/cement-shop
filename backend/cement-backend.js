const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 2028;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
} else {
  console.log('Data directory exists:', dataDir);
}

// Helper function to read customers
function readCustomers() {
  const filePath = path.join(dataDir, 'customers.json');
  if (!fs.existsSync(filePath)) {
    console.log('Customers file does not exist, returning empty array');
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const customers = data ? JSON.parse(data) : [];
    console.log(`Read ${customers.length} customers from file`);
    return customers;
  } catch (error) {
    console.error('Error reading customers file:', error);
    return [];
  }
}

// Helper function to write customers
function writeCustomers(customers) {
  const filePath = path.join(dataDir, 'customers.json');
  fs.writeFileSync(filePath, JSON.stringify(customers, null, 2), 'utf8');
  console.log(`Saved ${customers.length} customers to file`);
}

// Helper function to generate CustomerId (CUSXXXXX format)
function generateCustomerId(existingCustomers) {
  let maxNumber = 0;
  
  existingCustomers.forEach(customer => {
    if (customer.customerId && customer.customerId.startsWith('CUS')) {
      const number = parseInt(customer.customerId.substring(3));
      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }
  });
  
  const nextNumber = maxNumber + 1;
  const customerId = `CUS${String(nextNumber).padStart(5, '0')}`;
  console.log(`Generated Customer ID: ${customerId} (from ${existingCustomers.length} existing customers)`);
  return customerId;
}

// API Routes
app.post('/api/customers', (req, res) => {
  try {
    console.log('POST /api/customers - Adding new customer');
    const { customerName, location, contactNumber, pastBills } = req.body;

    // Validation
    if (!customerName) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ error: 'Customer name is required' });
    }

    console.log('Validation passed, reading existing customers...');
    const customers = readCustomers();
    
    // Generate CustomerId
    const customerId = generateCustomerId(customers);

    // Create new customer object
    const newCustomer = {
      customerId,
      customerName,
      location: location || '',
      contactNumber: contactNumber || '',
      pastBills: pastBills || 0,
      createdAt: new Date().toISOString()
    };

    console.log('New customer object created:', JSON.stringify(newCustomer, null, 2));

    // Add to array
    customers.push(newCustomer);

    // Save to file
    writeCustomers(customers);

    console.log('Customer added successfully:', customerId);
    res.status(201).json({ message: 'Customer added successfully', customer: newCustomer });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/customers', (req, res) => {
  try {
    console.log('GET /api/customers - Fetching all customers');
    const customers = readCustomers();
    console.log(`Returning ${customers.length} customers`);
    res.json(customers);
  } catch (error) {
    console.error('Error reading customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to read bills
function readBills() {
  const filePath = path.join(dataDir, 'bills.json');
  if (!fs.existsSync(filePath)) {
    console.log('Bills file does not exist, returning empty array');
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const bills = data ? JSON.parse(data) : [];
    console.log(`Read ${bills.length} bills from file`);
    return bills;
  } catch (error) {
    console.error('Error reading bills file:', error);
    return [];
  }
}

// Helper function to write bills
function writeBills(bills) {
  const filePath = path.join(dataDir, 'bills.json');
  fs.writeFileSync(filePath, JSON.stringify(bills, null, 2), 'utf8');
  console.log(`Saved ${bills.length} bills to file`);
}

// API Routes for Bills
app.post('/api/bills', (req, res) => {
  try {
    console.log('POST /api/bills - Adding new bill');
    const { customerId, customerName, stockNumber, date, items, billTotal } = req.body;

    // Validation
    if (!customerId || !customerName) {
      console.log('Validation failed: Missing customer information');
      return res.status(400).json({ error: 'Customer selection is required' });
    }
    if (!stockNumber || !date) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ error: 'Stock number and date are required' });
    }

    console.log('Validation passed, reading existing bills...');
    const bills = readBills();

    // Create new bill object
    const newBill = {
      customerId,
      customerName,
      stockNumber,
      date,
      items: items || [],
      billTotal: billTotal || 0,
      createdAt: new Date().toISOString()
    };

    console.log('New bill object created:', JSON.stringify(newBill, null, 2));

    // Add to array
    bills.push(newBill);

    // Save to file
    writeBills(bills);

    // Update stocks data
    console.log('Updating stocks data...');
    const stocks = readStocks();
    const stockIndex = stocks.findIndex(s => s.stockId === stockNumber);

    // Calculate cement counts from items
    const tokyoCount = items.find(item => item.name === 'Tokyo')?.bags || 0;
    const sansthaCount = items.find(item => item.name === 'Sanstha')?.bags || 0;
    const atlasCount = items.find(item => item.name === 'Atlas')?.bags || 0;
    const niponCount = items.find(item => item.name === 'Nipon')?.bags || 0;
    const totalNumber = parseFloat(tokyoCount) + parseFloat(sansthaCount) + parseFloat(atlasCount) + parseFloat(niponCount);

    if (stockIndex !== -1) {
      // Update existing stock
      stocks[stockIndex].tokyo = (parseFloat(stocks[stockIndex].tokyo) || 0) + parseFloat(tokyoCount);
      stocks[stockIndex].sanstha = (parseFloat(stocks[stockIndex].sanstha) || 0) + parseFloat(sansthaCount);
      stocks[stockIndex].atlas = (parseFloat(stocks[stockIndex].atlas) || 0) + parseFloat(atlasCount);
      stocks[stockIndex].nipon = (parseFloat(stocks[stockIndex].nipon) || 0) + parseFloat(niponCount);
      stocks[stockIndex].totalNumber = (parseFloat(stocks[stockIndex].totalNumber) || 0) + parseFloat(totalNumber);
      console.log(`Updated existing stock ${stockNumber}`);
    } else {
      // Create new stock
      stocks.push({
        stockId: stockNumber,
        tokyo: parseFloat(tokyoCount) || 0,
        sanstha: parseFloat(sansthaCount) || 0,
        atlas: parseFloat(atlasCount) || 0,
        nipon: parseFloat(niponCount) || 0,
        totalNumber: parseFloat(totalNumber) || 0,
        createdAt: new Date().toISOString()
      });
      console.log(`Created new stock ${stockNumber}`);
    }

    // Save stocks
    writeStocks(stocks);

    // Update customer data in customers.json - update totalBills
    console.log('Updating customer totalBills...');
    const customers = readCustomers();
    const customerIndex = customers.findIndex(c => c.customerId === customerId);

    if (customerIndex !== -1) {
      // Calculate total bills from bills.json for this customer
      const customerBills = bills.filter(b => b.customerId === customerId);
      const totalBills = customerBills.reduce(
        (sum, bill) => sum + (bill.billTotal || 0), 0
      );

      // Update totalBills in customer record
      customers[customerIndex].totalBills = totalBills;

      // Save updated customers
      writeCustomers(customers);
      console.log(`Updated customer ${customerId} with totalBills: ${totalBills}`);
    } else {
      console.log(`Customer ${customerId} not found, bill saved but customer not updated`);
    }

    console.log('Bill added successfully:', stockNumber);
    res.status(201).json({ message: 'Bill added successfully', bill: newBill });
  } catch (error) {
    console.error('Error adding bill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bills', (req, res) => {
  try {
    console.log('GET /api/bills - Fetching all bills');
    const bills = readBills();
    console.log(`Returning ${bills.length} bills`);
    res.json(bills);
  } catch (error) {
    console.error('Error reading bills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to read payments
function readPayments() {
  const filePath = path.join(dataDir, 'payments.json');
  if (!fs.existsSync(filePath)) {
    console.log('Payments file does not exist, returning empty array');
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const payments = data ? JSON.parse(data) : [];
    console.log(`Read ${payments.length} payments from file`);
    return payments;
  } catch (error) {
    console.error('Error reading payments file:', error);
    return [];
  }
}

// Helper function to write payments
function writePayments(payments) {
  const filePath = path.join(dataDir, 'payments.json');
  fs.writeFileSync(filePath, JSON.stringify(payments, null, 2), 'utf8');
  console.log(`Saved ${payments.length} payments to file`);
}

// API Routes for Payments
app.post('/api/payments', (req, res) => {
  try {
    console.log('POST /api/payments - Adding new payment');
    const { customerId, customerName, amount, date, notes } = req.body;

    // Validation
    if (!customerId || !customerName) {
      console.log('Validation failed: Missing customer information');
      return res.status(400).json({ error: 'Customer selection is required' });
    }
    if (!amount || amount <= 0) {
      console.log('Validation failed: Invalid amount');
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }
    if (!date) {
      console.log('Validation failed: Missing date');
      return res.status(400).json({ error: 'Date is required' });
    }

    console.log('Validation passed, reading existing payments...');
    const payments = readPayments();

    // Create new payment object
    const newPayment = {
      customerId,
      customerName,
      amount: parseFloat(amount),
      date,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    console.log('New payment object created:', JSON.stringify(newPayment, null, 2));

    // Add to payments array
    payments.push(newPayment);

    // Save payments to file
    writePayments(payments);

    // Update customer data in customers.json - only update totalPayments
    console.log('Updating customer totalPayments...');
    const customers = readCustomers();
    const customerIndex = customers.findIndex(c => c.customerId === customerId);

    if (customerIndex !== -1) {
      // Calculate total payments from payments.json for this customer
      const customerPayments = payments.filter(p => p.customerId === customerId);
      const totalPayments = customerPayments.reduce(
        (sum, payment) => sum + payment.amount, 0
      );

      // Update only totalPayments in customer record
      customers[customerIndex].totalPayments = totalPayments;

      // Save updated customers
      writeCustomers(customers);
      console.log(`Updated customer ${customerId} with totalPayments: ${totalPayments}`);
    } else {
      console.log(`Customer ${customerId} not found, payment saved but customer not updated`);
    }

    console.log('Payment added successfully');
    res.status(201).json({ message: 'Payment added successfully', payment: newPayment });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/payments', (req, res) => {
  try {
    console.log('GET /api/payments - Fetching all payments');
    const payments = readPayments();
    console.log(`Returning ${payments.length} payments`);
    res.json(payments);
  } catch (error) {
    console.error('Error reading payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to read stocks
function readStocks() {
  const filePath = path.join(dataDir, 'stocks.json');
  if (!fs.existsSync(filePath)) {
    console.log('Stocks file does not exist, returning empty array');
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const stocks = data ? JSON.parse(data) : [];
    console.log(`Read ${stocks.length} stocks from file`);
    return stocks;
  } catch (error) {
    console.error('Error reading stocks file:', error);
    return [];
  }
}

// Helper function to write stocks
function writeStocks(stocks) {
  const filePath = path.join(dataDir, 'stocks.json');
  fs.writeFileSync(filePath, JSON.stringify(stocks, null, 2), 'utf8');
  console.log(`Saved ${stocks.length} stocks to file`);
}

// API Routes for Stocks
app.get('/api/stocks', (req, res) => {
  try {
    console.log('GET /api/stocks - Fetching all stocks');
    const stocks = readStocks();
    console.log(`Returning ${stocks.length} stocks`);
    res.json(stocks);
  } catch (error) {
    console.error('Error reading stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


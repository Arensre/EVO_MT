const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const customerRoutes = require('./routes/customers');
const personRoutes = require('./routes/persons');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Customer routes
app.get('/api/customers', customerRoutes.getCustomers);
app.get('/api/customers/:id', customerRoutes.getCustomerById);
app.post('/api/customers', customerRoutes.createCustomer);
app.put('/api/customers/:id', customerRoutes.updateCustomer);
app.delete('/api/customers/:id', customerRoutes.deleteCustomer);
app.get('/api/customers/:id/persons', customerRoutes.getCustomerPersons);

// Person routes
app.post('/api/persons', personRoutes.createPerson);
app.put('/api/persons/:id', personRoutes.updatePerson);
app.delete('/api/persons/:id', personRoutes.deletePerson);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 EVO_MT Backend API running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './src/config/database.js';

// Load environment variables
dotenv.config();

// Import routes
import transactionRoutes from './src/routes/transactions.js';
import categoryRoutes from './src/routes/categories.js';
import budgetRoutes from './src/routes/budgets.js';
import reportRoutes from './src/routes/reports.js';
import accountRoutes from './src/routes/accounts.js';
import aiRoutes from './src/routes/ai.js';
import snowballDebtRoutes from './src/routes/snowballDebts.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/snowball-debts', snowballDebtRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Tranki', version: '1.0.0' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ████████╗██████╗  █████╗ ███╗   ██╗██╗  ██╗██╗
  ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██║ ██╔╝██║
     ██║   ██████╔╝███████║██╔██╗ ██║█████╔╝ ██║
     ██║   ██╔══██╗██╔══██║██║╚██╗██║██╔═██╗ ██║
     ██║   ██║  ██║██║  ██║██║ ╚████║██║  ██╗██║
     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝

  🚀 Tranki backend running on http://localhost:${PORT}
  💰 Stay calm about your finances!
  `);
});

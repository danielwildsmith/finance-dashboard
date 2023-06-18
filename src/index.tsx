import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthForm } from './components/pages/auth';
import { Dashboard } from './components/pages/dashboard';
import { Transactions } from './components/pages/transactions';
import { Balances } from './components/pages/balances';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <>
    <CssBaseline />
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm type={'signin'} />} />
        <Route path="/signup" element={<AuthForm type={'signup'} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/balances" element={<Balances />} />
      </Routes>
    </Router> 
  </>
);
// <Route path="*" element={<NotFound />} />

/*
  COLOR PALETTE
 
  dark background: #23272f
  boxes: #343a46
  blue highlight: #139eca
  white text: #f6f7f9
  grey text: #878fa0
  text against box color: #707787 
*/
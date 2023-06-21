import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthForm } from './components/pages/auth';
import { Dashboard } from './components/pages/dashboard';
import { Transactions } from './components/pages/transactions';
import { Balances } from './components/pages/balances';
import { PageNotFound } from './components/pages/not-found';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <>
    <CssBaseline />
    <HashRouter>
      <Routes>
        <Route path="/" element={<AuthForm type={'signin'} />} />
        <Route path="/signup" element={<AuthForm type={'signup'} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/balances" element={<Balances />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </HashRouter> 
  </>
);

/*
  COLOR PALETTE
 
  dark background: #23272f
  boxes: #343a46
  blue highlight: #139eca
  white text: #f6f7f9
  grey text: #878fa0
  text against box color: #707787 
*/
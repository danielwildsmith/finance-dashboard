import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { LoginForm } from './components/login';
import App from './Plaid-Link';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <>
    <CssBaseline />
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/plaid" element={<App />} />
      </Routes>
    </Router> 
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
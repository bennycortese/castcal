import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from '@clerk/react';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY
root.render(
  // @ts-ignore — Clerk v6 types incorrectly strip all ClerkProvider props
  <ClerkProvider publishableKey={PUBLISHABLE_KEY ?? ''}>
    <App />
  </ClerkProvider>
);

reportWebVitals();

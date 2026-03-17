import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { NotesProvider } from './context/NotesContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home view="dashboard" />} />
              <Route path="notes" element={<Home view="all" />} />
              <Route path="archived" element={<Home view="archived" />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: 'dark:bg-slate-800 dark:text-white border dark:border-slate-700',
            style: { borderRadius: '12px', padding: '16px' }
          }}
        />
      </NotesProvider>
    </AuthProvider>
  );
}

export default App;

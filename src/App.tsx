import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { NotesProvider } from './context/NotesContext';

function App() {
  return (
    <NotesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home view="dashboard" />} />
            <Route path="notes" element={<Home view="all" />} />
            <Route path="archived" element={<Home view="archived" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
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
  );
}

export default App;

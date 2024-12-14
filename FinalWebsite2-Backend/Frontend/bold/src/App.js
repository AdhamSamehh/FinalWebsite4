import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar/NavBar';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <NavBar />
          <div className="content">
            <AppRoutes />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

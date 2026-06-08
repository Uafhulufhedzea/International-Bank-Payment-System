import React, { useState } from 'react';
import Register from './components/register';
import Login from './components/login';
import Payment from './components/payment';
import Portal from './components/portal';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInEmployee, setLoggedInEmployee] = useState(null);
  const [view, setView] = useState('welcome');

  const handleLogin = (username) => {
    setLoggedInUser(username);
  };

  const handleEmployeeLogin = (username) => {
    setLoggedInEmployee(username);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setLoggedInEmployee(null);
    setView('welcome');
  };

  return (
    <div className="App" style={{ textAlign: 'center', fontFamily: 'Arial' }}>
      <nav style={{ padding: '20px', background: '#282c34', color: 'white' }}>
        <h3 style={{ margin: 0 }}>International Bank Payment System</h3>
      </nav>

      {/* Employee logged in - show portal */}
      {loggedInEmployee ? (
        <div>
          <div style={{ padding: '10px', background: '#cce5ff' }}>
            <span>Employee: <b>{loggedInEmployee}</b></span>{' | '}
            <button onClick={() => handleLogout()}>Logout</button>
          </div>
          <Portal />
        </div>

      /* Customer logged in - show payment form */
      ) : loggedInUser ? (
        <div>
          <div style={{ padding: '10px', background: '#d4edda' }}>
            <span>Welcome, <b>{loggedInUser}</b>!</span>{' | '}
            <button onClick={() => handleLogout()}>Logout</button>
          </div>
          <Payment />
        </div>

      /* Not logged in - show welcome / register / login */
      ) : (
        <div>
          {view === 'welcome' && (
            <div style={{ padding: '60px 40px' }}>
              <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Welcome</h1>
              <p style={{ color: '#555', marginBottom: '30px' }}>
                Secure international payments portal. Register as a new customer or log in to continue.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button onClick={() => setView('register')}
                  style={{ padding: '12px 30px', fontSize: '16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Register
                </button>
                <button onClick={() => setView('login')}
                  style={{ padding: '12px 30px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Login
                </button>
              </div>
            </div>
          )}

          {(view === 'register' || view === 'login') && (
            <div style={{ padding: '10px', background: '#eee' }}>
              <button onClick={() => setView('welcome')}
                style={{ marginRight: '10px', cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setView('register')}
                style={{ fontWeight: view === 'register' ? 'bold' : 'normal', cursor: 'pointer' }}>Register</button>{' | '}
              <button onClick={() => setView('login')}
                style={{ fontWeight: view === 'login' ? 'bold' : 'normal', cursor: 'pointer' }}>Login</button>
            </div>
          )}

          {view === 'register' && <Register />}
          {view === 'login' && <Login onLogin={handleLogin} onEmployeeLogin={handleEmployeeLogin} />}
        </div>
      )}
    </div>
  );
}

export default App;

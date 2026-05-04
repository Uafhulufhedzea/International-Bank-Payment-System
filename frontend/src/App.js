import React, { useState } from 'react';
import Register from './components/register';
import Login from './components/login';
import Payment from './components/payment';
import Portal from './components/portal';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [view, setView] = useState('register'); // 'register' or 'login'

  const handleLogin = (username) => {
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setView('login');
  };

  return (
    <div className="App" style={{ textAlign: 'center', fontFamily: 'Arial' }}>
      <nav style={{ padding: '20px', background: '#282c34', color: 'white' }}>
        <h3 style={{ margin: 0 }}>International Bank Payment System</h3>
      </nav>

      {!loggedInUser ? (
        // Not logged in: show Register or Login
        <div>
          <div style={{ padding: '10px', background: '#eee' }}>
            <button onClick={() => setView('register')}>Register</button>{' | '}
            <button onClick={() => setView('login')}>Login</button>
          </div>
          {view === 'register' && <Register />}
          {view === 'login' && <Login onLogin={handleLogin} />}
        </div>
      ) : (
        // Logged in: show Payment and Portal
        <div>
          <div style={{ padding: '10px', background: '#d4edda' }}>
            <span>Welcome, <b>{loggedInUser}</b>!</span>{' | '}
            <button onClick={() => handleLogout()}>Logout</button>
          </div>
          <Payment />

          {/* Employee Portal — shown here for testing/demo purposes only.
              In production, this would be a separate staff-only application. */}
          <div style={{ marginTop: '40px', padding: '10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', marginLeft: '40px', marginRight: '40px' }}>
            <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#856404' }}>
              <b>Testing Only:</b> The portal below is the Employee Verification Portal. 
              It is included here solely to demonstrate that submitted payments are being stored and can be verified by bank employees.
            </p>
          </div>
          <Portal />
        </div>
      )}
    </div>
  );
}

export default App;

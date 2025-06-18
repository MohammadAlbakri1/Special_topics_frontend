import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/users/login', { email, password });
      setMessage(`✅ Welcome, ${res.data.user.name}`);
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
     
      setTimeout(() => {
        navigate('/');
      }, 1000); 
      
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || 'Login failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Sign In</h2>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`btn btn-primary ${loading ? 'btn-secondary' : ''}`}
            style={{ width: '100%' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="nav-links">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
          <p><Link to="/">← Back to Events</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
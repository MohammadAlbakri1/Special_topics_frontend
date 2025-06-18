import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
  
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    api.get('/events')
      .then((res) => {
        console.log('✅ Events fetched:', res.data);
        setEvents(res.data);
      })
      .catch((err) => {
        console.error('❌ Error fetching events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading events</div>
      </div>
    );
  }

  return (
    <div className="container">
     
      <div className="header">
        <h1>All Events</h1>
        
        {user ? (
          
          <div className="user-info">
            <span className="user-welcome">
              Welcome, <strong>{user.name}</strong> ({user.role})
            </span>
            <div className="btn-group">
              <Link to="/my-events" className="btn btn-primary">
                📅 My Events
              </Link>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link to="/create-event" className="btn btn-success">
                  + Add Event
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          
          <div className="btn-group">
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-success">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {}
      {events.length === 0 ? (
        <div className="loading">No events found</div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="event-card"
            >
              <img
                src={event.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={event.title}
              />
              <div className="event-card-content">
                <h3>{event.title}</h3>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
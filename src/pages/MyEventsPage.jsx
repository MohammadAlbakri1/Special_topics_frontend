import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const MyEventsPage = () => {
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserEvents = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/tickets/${user.id}`);
        setUserEvents(response.data);
      } catch (err) {
        setError('Failed to fetch your events');
        console.error('❌ Error fetching user events:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  // Group events by status (upcoming vs past)



  if (!user) {
    return (
      <div className="container">
        <div className="loading">Checking authentication</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1>My Events</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Events you've registered for, {user.name}
          </p>
        </div>
        <Link to="/" className="btn btn-secondary">
          ← Back to All Events
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading your events</div>
      ) : error ? (
        <div className="message error">{error}</div>
      ) : userEvents.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#666', marginBottom: '15px' }}>No Events Yet</h3>
          <p style={{ color: '#888', marginBottom: '25px' }}>
            You haven't registered for any events yet.
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Events
          </Link>
        </div>
      ) : (
        <div>
          {/* All Events */}
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '20px',
            fontSize: '1.8rem',
            borderBottom: '2px solid #667eea',
            paddingBottom: '10px'
          }}>
            My Registered Events ({userEvents.length})
          </h2>
          <div className="events-grid">
            {userEvents.map((event) => (
              <EventCard key={event.ticket_id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event }) => {
  const eventDate = new Date(event.date);
  const claimedDate = new Date(event.claimed_at);
  
  return (
    <Link
      to={`/events/${event.id}`}
      className="event-card"
    >
      <img
        src={event.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={event.title}
      />
      
      <div className="event-card-content">
        <h3>{event.title}</h3>
        <p><strong>📍 Location:</strong> {event.location}</p>
        <p><strong>📅 Event Date:</strong> {eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        
        {/* Registration Info */}
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '6px',
          borderLeft: '4px solid #667eea'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#666',
            fontWeight: '500'
          }}>
            ✅ Registered: {claimedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MyEventsPage;
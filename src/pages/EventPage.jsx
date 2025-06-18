import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [claimDate, setClaimDate] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    api.get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error('❌ Error fetching event:', err));
  }, [id]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setWeatherLoading(true);
      setWeatherError('');
      
      try {
        const city = event.location.split(',')[0].trim();
        
        const response = await api.get(`/weather/weather?city=${encodeURIComponent(city)}`);
        setWeather(response.data);
      } catch (err) {
        setWeatherError('Unable to fetch weather data');
        console.error('❌ Weather fetch error:', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    if (event && event.location) {
      fetchWeatherData();
    }
  }, [event]);

 
  useEffect(() => {
    if (user && event) {
      api.get(`/tickets/${user.id}`)
        .then((res) => {
          const userTickets = res.data;
          const eventTicket = userTickets.find(ticket => ticket.id === parseInt(id));
          if (eventTicket) {
            setIsRegistered(true);
            setClaimDate(eventTicket.claimed_at);
          }
        })
        .catch((err) => console.error('❌ Error checking registration status:', err));
    }
  }, [user, event, id]);

  const handleRegisterForEvent = async () => {
    if (!user) {
      setMessage('❌ Please sign in to register for events');
      return;
    }

    setRegistering(true);
    setMessage('');

    try {
      const response = await api.post('/tickets/claim', {
        user_id: user.id,
        event_id: event.id
      });

      setMessage('✅ Successfully registered for the event!');
      setIsRegistered(true);
      setClaimDate(response.data.ticket.claimed_at);
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage('⚠️ You are already registered for this event');
        setIsRegistered(true);
      } else {
        setMessage(`❌ ${err.response?.data?.error || 'Failed to register for event'}`);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
   
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?\n\nThis action cannot be undone and will affect all registered users.`
    );
    
    if (!confirmed) return;

    setDeleting(true);
    setMessage('');

    try {
      await api.delete(`/events/${event.id}`, {
        headers: {
          'x-user-role': user.role,
          'x-user-id': user.id
        }
      });

      setMessage('✅ Event deleted successfully! Redirecting...');
      
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || 'Failed to delete event'}`);
    } finally {
      setDeleting(false);
    }
  };

 
  const canDeleteEvent = user && (
    user.role === 'admin' || 
    (user.role === 'organizer' && event && user.id === event.organizer_id)
  );

  if (!event) {
    return (
      <div className="container">
        <div className="loading">Loading event details</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" className="back-link">
          ← Back to All Events
        </Link>
        
      
        {canDeleteEvent && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link 
              to={`/edit-event/${event.id}`}
              className="btn btn-secondary"
            >
              ✏️ Edit Event
            </Link>
            <button
              onClick={handleDeleteEvent}
              disabled={deleting}
              className="btn btn-danger"
              style={{
                opacity: deleting ? 0.6 : 1,
                cursor: deleting ? 'not-allowed' : 'pointer'
              }}
            >
              {deleting ? 'Deleting...' : '🗑️ Delete Event'}
            </button>
          </div>
        )}
      </div>
      
      <div className="event-detail">
        <img
          src={event.image_url || 'https://via.placeholder.com/800x400?text=No+Image'}
          alt={event.title}
        />
        
        <div className="event-detail-content">
          <h1>{event.title}</h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto', 
            gap: '20px', 
            alignItems: 'start',
            marginBottom: '25px'
          }}>
            <div>
              <p style={{ fontSize: '18px', marginBottom: '20px', lineHeight: '1.6' }}>
                <strong>Description:</strong> {event.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  minWidth: '200px'
                }}>
                  <p style={{ margin: 0, fontSize: '16px' }}>
                    <strong style={{ color: '#667eea' }}>📍 Location:</strong><br />
                    {event.location}
                  </p>
                </div>
                
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  minWidth: '200px'
                }}>
                  <p style={{ margin: 0, fontSize: '16px' }}>
                    <strong style={{ color: '#667eea' }}>📅 Date:</strong><br />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

               
                <div style={{ 
                  background: weatherLoading ? '#f8f9fa' : weather ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' : '#f8f9fa',
                  padding: '15px', 
                  borderRadius: '8px',
                  minWidth: '200px',
                  color: weather && !weatherLoading ? 'white' : '#333'
                }}>
                  {weatherLoading ? (
                    <p style={{ margin: 0, fontSize: '16px' }}>
                      <strong style={{ color: '#667eea' }}>🌤️ Weather:</strong><br />
                      Loading...
                    </p>
                  ) : weatherError ? (
                    <p style={{ margin: 0, fontSize: '16px' }}>
                      <strong style={{ color: '#667eea' }}>🌤️ Weather:</strong><br />
                      <span style={{ fontSize: '14px', color: '#666' }}>Unable to load</span>
                    </p>
                  ) : weather ? (
                    <p style={{ margin: 0, fontSize: '16px' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.9)' }}>🌤️ Weather:</strong><br />
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{Math.round(weather.temperature)}°C</span><br />
                      <span style={{ fontSize: '14px', opacity: '0.9', textTransform: 'capitalize' }}>
                        {weather.condition}
                      </span>
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '16px' }}>
                      <strong style={{ color: '#667eea' }}>🌤️ Weather:</strong><br />
                      <span style={{ fontSize: '14px', color: '#666' }}>No data</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            
           
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '25px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              minWidth: '250px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>
                Join This Event
              </h3>
              
              {!user ? (
                <div>
                  <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                    Sign in to register for this event
                  </p>
                  <Link to="/login" className="btn" style={{ 
                    background: 'white', 
                    color: '#667eea',
                    width: '100%',
                    textAlign: 'center'
                  }}>
                    Sign In to Register
                  </Link>
                </div>
              ) : isRegistered ? (
                <div>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
                      ✅ Registration Confirmed!
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', opacity: '0.9' }}>
                      Registered on: {new Date(claimDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p style={{ fontSize: '14px', margin: 0, opacity: '0.9' }}>
                    See you at the event, {user.name}!
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                    Hi {user.name}! Ready to join?
                  </p>
                  <button
                    onClick={handleRegisterForEvent}
                    disabled={registering}
                    className="btn"
                    style={{
                      background: registering ? 'rgba(255, 255, 255, 0.3)' : 'white',
                      color: registering ? '#ccc' : '#667eea',
                      width: '100%',
                      cursor: registering ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {registering ? 'Registering...' : 'Register for Event'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
        
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
              {message}
            </div>
          )}

         
          {weather && !weatherError && (
            <div style={{ 
              background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
              padding: '25px',
              borderRadius: '12px',
              marginTop: '25px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(116, 185, 255, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', textAlign: 'center' }}>
                🌤️ Weather Forecast for {weather.city}
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Temperature</h4>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                    {Math.round(weather.temperature)}°C
                  </p>
                </div>
                
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Conditions</h4>
                  <p style={{ margin: 0, fontSize: '1.2rem', textTransform: 'capitalize' }}>
                    {weather.condition}
                  </p>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '14px', opacity: '0.9' }}>
                  💡 <strong>Event Day Weather:</strong> Plan accordingly for the weather conditions in {weather.city}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPage;
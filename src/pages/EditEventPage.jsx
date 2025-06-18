import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [eventLoading, setEventLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    image_url: ''
  });

  useEffect(() => {
    // Check if user is logged in and has permission
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Redirect if user doesn't have permission
      if (userData.role !== 'organizer' && userData.role !== 'admin') {
        navigate('/');
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchEventData = async () => {
      setEventLoading(true);
      try {
        const response = await api.get(`/events/${id}`);
        const event = response.data;
        
        // Check if user can edit this event
        if (user.role !== 'admin' && event.organizer_id !== user.id) {
          navigate('/');
          return;
        }

        // Format date for input field
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toISOString().slice(0, 16);

        setFormData({
          title: event.title,
          description: event.description,
          location: event.location,
          date: formattedDate,
          image_url: event.image_url || ''
        });
      } catch (err) {
        
        console.error('Error fetching event:', err);
      } finally {
        setEventLoading(false);
      }
    };

    if (user) {
      fetchEventData();
    }
  }, [user, id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/events/${id}`, formData, {
        headers: {
          'x-user-role': user.role,
          'x-user-id': user.id
        }
      });

      navigate(`/events/${id}`);

    } catch (err) {
      console.error('Error updating event:', err);
      alert('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if checking authentication or loading event
  if (!user || eventLoading) {
    return (
      <div className="container">
        <div className="loading">Loading event data...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to={`/events/${id}`} className="back-link">
        ← Back to Event
      </Link>

      <div className="form-container" style={{ maxWidth: '600px' }}>
        <h2>Edit Event</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Event Date</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Event Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Updating...' : 'Update Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;
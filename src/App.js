import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import SignIn from './pages/Login';
import Register from './pages/Register';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import MyEventsPage from './pages/MyEventsPage';
import './styles.css';
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events/:id" element={<EventPage />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-event" element={<CreateEventPage />} />
      <Route path="/edit-event/:id" element={<EditEventPage />} />
      <Route path="/my-events" element={<MyEventsPage />} />
    </Routes>
  );
}

export default App;
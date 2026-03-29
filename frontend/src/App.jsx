import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventsList from './pages/EventsList.jsx';
import EventDetails from './pages/EventDetails.jsx';
import ManageEvents from './pages/ManageEvents.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminEvents from './pages/AdminEvents.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
	return (
		<div className="container">
			<Navbar />
			<main>
				<Routes>
					<Route path="/" element={<Navigate to="/events" replace />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
					<Route path="/events" element={<EventsList />} />
					<Route path="/events/:id" element={<EventDetails />} />
					<Route path="/organizer/events" element={<ProtectedRoute roles={['organizer','admin']}><ManageEvents /></ProtectedRoute>} />
					<Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
					<Route path="/admin/events" element={<ProtectedRoute roles={['admin']}><AdminEvents /></ProtectedRoute>} />
				</Routes>
			</main>
		</div>
	);
}


import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	return (
		<nav className="navbar">
			<Link to="/events" className="brand">Campus Clubs</Link>
			<div className="nav-links">
				<Link to="/events">Events</Link>
				{user && <Link to="/dashboard">Dashboard</Link>}
				{user?.role === 'organizer' && <Link to="/organizer/events">Manage Events</Link>}
				{user?.role === 'admin' && <>
					<Link to="/admin/users">Users</Link>
					<Link to="/admin/events">Events Admin</Link>
				</>}
			</div>
			<div className="auth-actions">
				{!user ? (
					<>
						<Link to="/login">Login</Link>
						<Link to="/register" className="btn">Register</Link>
					</>
				) : (
					<button className="btn" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
				)}
			</div>
		</nav>
	);
}


import { Link } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';

export default function Dashboard() {
	const { user } = useAuth();
	return (
		<div>
			<h2>Welcome, {user?.name}</h2>
			<p>Role: {user?.role}</p>
			<div className="grid">
				<Link to="/events" className="card">Browse Events</Link>
				{user?.role === 'organizer' && <Link to="/organizer/events" className="card">Manage Events</Link>}
				{user?.role === 'admin' && <>
					<Link to="/admin/users" className="card">Manage Users</Link>
					<Link to="/admin/events" className="card">Manage All Events</Link>
				</>}
			</div>
		</div>
	);
}


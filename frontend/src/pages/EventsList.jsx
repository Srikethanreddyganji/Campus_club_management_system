import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

export default function EventsList() {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get('/events');
				setEvents(data);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <div className="center">Loading events...</div>;

	return (
		<div>
			<h2>Upcoming Events</h2>
			<div className="grid">
				{events.map(ev => (
					<Link key={ev._id} to={`/events/${ev._id}`} className="card">
						<h3>{ev.title}</h3>
						<p>{new Date(ev.date).toLocaleString()}</p>
						<p>{ev.location}</p>
						<p className="muted">{ev?.clubId?.name}</p>
					</Link>
				))}
			</div>
		</div>
	);
}


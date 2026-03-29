import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../services/auth.jsx';

export default function EventDetails() {
	const { id } = useParams();
	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [msg, setMsg] = useState('');
	const { user } = useAuth();

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(`/events/${id}`);
				setEvent(data);
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	async function register() {
		setMsg('');
		try {
			await api.post('/registrations', { eventId: id });
			setMsg('Registered successfully');
		} catch (err) {
			setMsg(err?.response?.data?.message || 'Registration failed');
		}
	}

	if (loading) return <div className="center">Loading...</div>;
	if (!event) return <div className="center">Event not found</div>;

	return (
		<div className="card">
			<h2>{event.title}</h2>
			<p>{event.description}</p>
			<p><strong>When:</strong> {new Date(event.date).toLocaleString()}</p>
			<p><strong>Where:</strong> {event.location}</p>
			<p className="muted"><strong>Club:</strong> {event?.clubId?.name}</p>
			{user && user.role === 'student' && (
				<button className="btn" onClick={register}>Register</button>
			)}
			{!user && <p className="muted">Login to register</p>}
			{msg && <p>{msg}</p>}
		</div>
	);
}


import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function AdminEvents() {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [participants, setParticipants] = useState([]);
	const [selectedEventId, setSelectedEventId] = useState(null);

	async function load() {
		const { data } = await api.get('/events');
		setEvents(data);
		setLoading(false);
	}

	useEffect(() => { load(); }, []);

	async function viewParticipants(id) {
		setSelectedEventId(id);
		const { data } = await api.get(`/events/${id}/participants`);
		setParticipants(data);
	}

	async function remove(id) {
		await api.delete(`/events/${id}`);
		await load();
	}

	return (
		<div>
			<h2>Admin: All Events</h2>
			{loading ? <div className="center">Loading...</div> : (
				<div className="grid">
					{events.map(ev => (
						<div key={ev._id} className="card">
							<h3>{ev.title}</h3>
							<p>{new Date(ev.date).toLocaleString()}</p>
							<p>{ev.location}</p>
							<div className="row">
								<button className="btn" onClick={() => viewParticipants(ev._id)}>Participants</button>
								<button className="btn danger" onClick={() => remove(ev._id)}>Delete</button>
							</div>
						</div>
					))}
				</div>
			)}
			{selectedEventId && (
				<div className="card">
					<h3>Participants</h3>
					<ul>
						{participants.map(p => (
							<li key={p._id}>{p.userId?.name} ({p.userId?.email})</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}


import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function ManageEvents() {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState({ title: '', description: '', date: '', location: '', clubId: '' });
	const [editingId, setEditingId] = useState(null);

	async function load() {
		const { data } = await api.get('/events');
		setEvents(data);
		setLoading(false);
	}

	useEffect(() => {
		load();
	}, []);

	function onChange(e) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	async function save(e) {
		e.preventDefault();
		if (editingId) {
			await api.put(`/events/${editingId}`, form);
		} else {
			await api.post('/events', form);
		}
		setForm({ title: '', description: '', date: '', location: '', clubId: '' });
		setEditingId(null);
		await load();
	}

	async function edit(ev) {
		setEditingId(ev._id);
		setForm({
			title: ev.title,
			description: ev.description,
			date: new Date(ev.date).toISOString().slice(0,16),
			location: ev.location,
			clubId: ev.clubId?._id || ev.clubId
		});
	}

	async function remove(id) {
		await api.delete(`/events/${id}`);
		await load();
	}

	return (
		<div>
			<h2>Manage Events</h2>
			<form className="card" onSubmit={save}>
				<input name="title" placeholder="Title" value={form.title} onChange={onChange} required />
				<textarea name="description" placeholder="Description" value={form.description} onChange={onChange} />
				<input type="datetime-local" name="date" value={form.date} onChange={onChange} required />
				<input name="location" placeholder="Location" value={form.location} onChange={onChange} required />
				<input name="clubId" placeholder="Club ID" value={form.clubId} onChange={onChange} required />
				<button className="btn">{editingId ? 'Update' : 'Create'}</button>
			</form>
			{loading ? <div className="center">Loading...</div> : (
				<div className="grid">
					{events.map(ev => (
						<div key={ev._id} className="card">
							<h3>{ev.title}</h3>
							<p>{new Date(ev.date).toLocaleString()}</p>
							<p>{ev.location}</p>
							<div className="row">
								<button className="btn" onClick={() => edit(ev)}>Edit</button>
								<button className="btn danger" onClick={() => remove(ev._id)}>Delete</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}


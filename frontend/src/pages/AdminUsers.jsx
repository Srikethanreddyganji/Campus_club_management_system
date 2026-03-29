import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function AdminUsers() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [edit, setEdit] = useState(null);

	async function load() {
		const { data } = await api.get('/users');
		setUsers(data);
		setLoading(false);
	}

	useEffect(() => { load(); }, []);

	async function save() {
		const { _id, ...body } = edit;
		await api.put(`/users/${_id}`, body);
		setEdit(null);
		await load();
	}

	async function remove(id) {
		await api.delete(`/users/${id}`);
		await load();
	}

	return (
		<div>
			<h2>Manage Users</h2>
			{loading ? <div className="center">Loading...</div> : (
				<table>
					<thead>
						<tr><th>Name</th><th>Email</th><th>Role</th><th>Club</th><th>Actions</th></tr>
					</thead>
					<tbody>
						{users.map(u => (
							<tr key={u._id}>
								<td>{u.name}</td>
								<td>{u.email}</td>
								<td>{u.role}</td>
								<td>{u.clubId || '-'}</td>
								<td>
									<button className="btn" onClick={() => setEdit({ ...u })}>Edit</button>
									<button className="btn danger" onClick={() => remove(u._id)}>Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			{edit && (
				<div className="card">
					<h3>Edit User</h3>
					<input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
					<select value={edit.role} onChange={e => setEdit({ ...edit, role: e.target.value })}>
						<option value="student">Student</option>
						<option value="organizer">Organizer</option>
						<option value="admin">Admin</option>
					</select>
					<input placeholder="Club ID" value={edit.clubId || ''} onChange={e => setEdit({ ...edit, clubId: e.target.value })} />
					<div className="row">
						<button className="btn" onClick={save}>Save</button>
						<button className="btn" onClick={() => setEdit(null)}>Cancel</button>
					</div>
				</div>
			)}
		</div>
	);
}


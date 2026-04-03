import {
	useEffect,
	useState,
  } from "react";
  
  import api from "../services/api.js";
  
  export default function AdminUsers() {
	const [users, setUsers] =
	  useState([]);
  
	const [loading, setLoading] =
	  useState(true);
  
	const [editUser, setEditUser] =
	  useState(null);
  
	useEffect(() => {
	  fetchUsers();
	}, []);
  
	async function fetchUsers() {
	  try {
		const { data } =
		  await api.get("/users");
  
		setUsers(data.users);
	  } catch (error) {
		console.error(error);
	  } finally {
		setLoading(false);
	  }
	}
  
	async function handleSave() {
	  try {
		const { _id, ...body } =
		  editUser;
  
		await api.put(
		  `/users/${_id}`,
		  body
		);
  
		setEditUser(null);
  
		fetchUsers();
	  } catch (error) {
		console.error(error);
	  }
	}
  
	async function handleDelete(id) {
	  try {
		await api.delete(
		  `/users/${id}`
		);
  
		fetchUsers();
	  } catch (error) {
		console.error(error);
	  }
	}
  
	return (
	  <div>
		<h2>
		  Manage Users
		</h2>
  
		{loading ? (
		  <div className="center">
			Loading...
		  </div>
		) : (
		  <table>
			<thead>
			  <tr>
				<th>Name</th>
				<th>Email</th>
				<th>Role</th>
				<th>Club</th>
				<th>
				  Actions
				</th>
			  </tr>
			</thead>
  
			<tbody>
			  {users.map(
				(user) => (
				  <tr
					key={
					  user._id
					}
				  >
					<td>
					  {
						user.name
					  }
					</td>
  
					<td>
					  {
						user.email
					  }
					</td>
  
					<td>
					  {
						user.role
					  }
					</td>
  
					<td>
					  {user
						?.clubId
						?.name ||
						"-"}
					</td>
  
					<td>
					  <button
						className="btn"
						onClick={() =>
						  setEditUser(
							{
							  ...user,
							}
						  )
						}
					  >
						Edit
					  </button>
  
					  <button
						className="btn danger"
						onClick={() =>
						  handleDelete(
							user._id
						  )
						}
					  >
						Delete
					  </button>
					</td>
				  </tr>
				)
			  )}
			</tbody>
		  </table>
		)}
  
		{editUser && (
		  <div className="card">
			<h3>
			  Edit User
			</h3>
  
			<input
			  value={
				editUser.name
			  }
			  onChange={(
				e
			  ) =>
				setEditUser(
				  {
					...editUser,
					name:
					  e
						.target
						.value,
				  }
				)
			  }
			/>
  
			<select
			  value={
				editUser.role
			  }
			  onChange={(
				e
			  ) =>
				setEditUser(
				  {
					...editUser,
					role:
					  e
						.target
						.value,
				  }
				)
			  }
			>
			  <option value="student">
				Student
			  </option>
  
			  <option value="organizer">
				Organizer
			  </option>
  
			  <option value="admin">
				Admin
			  </option>
			</select>
  
			<input
			  placeholder="Club ID"
			  value={
				editUser.clubId
				  ?._id || ""
			  }
			  onChange={(
				e
			  ) =>
				setEditUser(
				  {
					...editUser,
					clubId:
					  e
						.target
						.value,
				  }
				)
			  }
			/>
  
			<div className="row">
			  <button
				className="btn"
				onClick={
				  handleSave
				}
			  >
				Save
			  </button>
  
			  <button
				className="btn"
				onClick={() =>
				  setEditUser(
					null
				  )
				}
			  >
				Cancel
			  </button>
			</div>
		  </div>
		)}
	  </div>
	);
  }
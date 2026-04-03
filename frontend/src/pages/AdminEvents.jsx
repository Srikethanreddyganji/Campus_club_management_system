import {
	useEffect,
	useState,
  } from "react";
  
  import api from "../services/api.js";
  
  export default function AdminEvents() {
	const [events, setEvents] =
	  useState([]);
  
	const [loading, setLoading] =
	  useState(true);
  
	const [
	  participants,
	  setParticipants,
	] = useState([]);
  
	const [
	  selectedEventId,
	  setSelectedEventId,
	] = useState(null);
  
	useEffect(() => {
	  fetchEvents();
	}, []);
  
	async function fetchEvents() {
	  try {
		const { data } =
		  await api.get("/events");
  
		setEvents(data.events);
	  } catch (error) {
		console.error(error);
	  } finally {
		setLoading(false);
	  }
	}
  
	async function viewParticipants(
	  id
	) {
	  try {
		setSelectedEventId(id);
  
		const { data } =
		  await api.get(
			`/events/${id}/participants`
		  );
  
		setParticipants(
		  data.participants
		);
	  } catch (error) {
		console.error(error);
	  }
	}
  
	async function handleDelete(
	  id
	) {
	  try {
		await api.delete(
		  `/events/${id}`
		);
  
		fetchEvents();
	  } catch (error) {
		console.error(error);
	  }
	}
  
	return (
	  <div>
		<h2>
		  Admin: All Events
		</h2>
  
		{loading ? (
		  <div className="center">
			Loading...
		  </div>
		) : (
		  <div className="grid">
			{events.map(
			  (event) => (
				<div
				  key={
					event._id
				  }
				  className="card"
				>
				  <h3>
					{
					  event.title
					}
				  </h3>
  
				  <p>
					{new Date(
					  event.date
					).toLocaleString()}
				  </p>
  
				  <p>
					{
					  event.location
					}
				  </p>
  
				  <p>
					Status:{" "}
					{
					  event.status
					}
				  </p>
  
				  <div className="row">
					<button
					  className="btn"
					  onClick={() =>
						viewParticipants(
						  event._id
						)
					  }
					>
					  Participants
					</button>
  
					<button
					  className="btn danger"
					  onClick={() =>
						handleDelete(
						  event._id
						)
					  }
					>
					  Delete
					</button>
				  </div>
				</div>
			  )
			)}
		  </div>
		)}
  
		{selectedEventId && (
		  <div className="card">
			<h3>
			  Participants
			</h3>
  
			{participants.length ===
			0 ? (
			  <p>
				No participants
			  </p>
			) : (
			  <ul>
				{participants.map(
				  (
					participant
				  ) => (
					<li
					  key={
						participant._id
					  }
					>
					  {
						participant
						  .userId
						  ?.name
					  }{" "}
					  (
					  {
						participant
						  .userId
						  ?.email
					  }
					  )
					</li>
				  )
				)}
			  </ul>
			)}
		  </div>
		)}
	  </div>
	);
  }
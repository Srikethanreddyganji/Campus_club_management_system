import {
	useEffect,
	useState,
  } from "react";
  
  import { Link } from "react-router-dom";
  
  import api from "../services/api.js";
  
  export default function EventsList() {
	const [events, setEvents] =
	  useState([]);
  
	const [loading, setLoading] =
	  useState(true);
  
	useEffect(() => {
	  fetchEvents();
	}, []);
  
	async function fetchEvents() {
	  try {
		const { data } =
		  await api.get("/events");
  
		setEvents(data.events);
	  } catch (error) {
		console.error(
		  "Failed to fetch events",
		  error
		);
	  } finally {
		setLoading(false);
	  }
	}
  
	if (loading) {
	  return (
		<div className="center">
		  Loading events...
		</div>
	  );
	}
  
	return (
	  <div>
		<h2>
		  Upcoming Events
		</h2>
  
		<div className="grid">
		  {events.length === 0 ? (
			<p>
			  No events available
			</p>
		  ) : (
			events.map((event) => (
			  <Link
				key={event._id}
				to={`/events/${event._id}`}
				className="card"
			  >
				<h3>
				  {event.title}
				</h3>
  
				<p>
				  {new Date(
					event.date
				  ).toLocaleString()}
				</p>
  
				<p>
				  {event.location}
				</p>
  
				<p className="muted">
				  {
					event?.clubId
					  ?.name
				  }
				</p>
  
				<p className="muted">
				  Status:{" "}
				  {event.status}
				</p>
			  </Link>
			))
		  )}
		</div>
	  </div>
	);
  }
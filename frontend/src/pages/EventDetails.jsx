import {
	useEffect,
	useState,
  } from "react";
  
  import { useParams } from "react-router-dom";
  
  import api from "../services/api.js";
  import { useAuth } from "../services/auth.jsx";
  
  export default function EventDetails() {
	const { id } = useParams();
  
	const [event, setEvent] =
	  useState(null);
  
	const [loading, setLoading] =
	  useState(true);
  
	const [message, setMessage] =
	  useState("");
  
	const { user } = useAuth();
  
	useEffect(() => {
	  fetchEvent();
	}, [id]);
  
	async function fetchEvent() {
	  try {
		const { data } =
		  await api.get(
			`/events/${id}`
		  );
  
		setEvent(data.event);
	  } catch (error) {
		console.error(error);
	  } finally {
		setLoading(false);
	  }
	}
  
	async function handleRegister() {
	  setMessage("");
  
	  try {
		const { data } =
		  await api.post(
			"/registrations",
			{
			  eventId: id,
			}
		  );
  
		setMessage(
		  data.message ||
			"Registered successfully"
		);
	  } catch (error) {
		setMessage(
		  error?.response?.data
			?.message ||
			"Registration failed"
		);
	  }
	}
  
	if (loading) {
	  return (
		<div className="center">
		  Loading...
		</div>
	  );
	}
  
	if (!event) {
	  return (
		<div className="center">
		  Event not found
		</div>
	  );
	}
  
	return (
	  <div className="card">
		<h2>{event.title}</h2>
  
		<p>
		  {event.description}
		</p>
  
		<p>
		  <strong>When:</strong>{" "}
		  {new Date(
			event.date
		  ).toLocaleString()}
		</p>
  
		<p>
		  <strong>Where:</strong>{" "}
		  {event.location}
		</p>
  
		<p>
		  <strong>Status:</strong>{" "}
		  {event.status}
		</p>
  
		<p className="muted">
		  <strong>Club:</strong>{" "}
		  {
			event?.clubId
			  ?.name
		  }
		</p>
  
		{user &&
		  user.role ===
			"student" &&
		  event.status ===
			"upcoming" && (
			<button
			  className="btn"
			  onClick={
				handleRegister
			  }
			>
			  Participate
			</button>
		  )}
  
		{!user && (
		  <p className="muted">
			Login to participate
		  </p>
		)}
  
		{message && (
		  <p>{message}</p>
		)}
	  </div>
	);
  }
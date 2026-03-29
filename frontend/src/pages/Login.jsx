import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/auth.jsx';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	async function handleSubmit(e) {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			await login(email, password);
			navigate('/dashboard');
		} catch (err) {
			setError(err?.response?.data?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="card">
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
				<input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
				<button className="btn" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
				{error && <p className="error">{error}</p>}
			</form>
			<p>Don't have an account? <Link to="/register">Register</Link></p>
		</div>
	);
}


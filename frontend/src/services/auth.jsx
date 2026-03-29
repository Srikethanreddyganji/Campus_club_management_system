import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('token');
		const userJson = localStorage.getItem('user');
		if (token && userJson) {
			setUser(JSON.parse(userJson));
		}
		setLoading(false);
	}, []);

	async function login(email, password) {
		const { data } = await api.post('/auth/login', { email, password });
		localStorage.setItem('token', data.token);
		localStorage.setItem('user', JSON.stringify(data.user));
		setUser(data.user);
		return data.user;
	}

	async function register(payload) {
		const { data } = await api.post('/auth/register', payload);
		localStorage.setItem('token', data.token);
		localStorage.setItem('user', JSON.stringify(data.user));
		setUser(data.user);
		return data.user;
	}

	function logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setUser(null);
	}

	const value = { user, loading, login, register, logout };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}


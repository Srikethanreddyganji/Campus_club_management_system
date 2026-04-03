import {
	createContext,
	useContext,
	useEffect,
	useState,
  } from "react";
  
  import api from "./api.js";
  
  const AuthContext = createContext(null);
  
  export function AuthProvider({
	children,
  }) {
	const [user, setUser] =
	  useState(null);
  
	const [loading, setLoading] =
	  useState(true);
  
	useEffect(() => {
	  const token =
		localStorage.getItem("token");
  
	  const savedUser =
		localStorage.getItem("user");
  
	  if (token && savedUser) {
		setUser(JSON.parse(savedUser));
	  }
  
	  setLoading(false);
	}, []);
  
	async function login(
	  email,
	  password
	) {
	  const { data } =
		await api.post("/auth/login", {
		  email,
		  password,
		});
  
	  localStorage.setItem(
		"token",
		data.token
	  );
  
	  localStorage.setItem(
		"user",
		JSON.stringify(data.user)
	  );
  
	  setUser(data.user);
  
	  return data.user;
	}
  
	async function register(payload) {
		const { data } =
		  await api.post(
			"/auth/register",
			payload
		  );
	  
		localStorage.setItem(
		  "token",
		  data.token
		);
	  
		localStorage.setItem(
		  "user",
		  JSON.stringify(data.user)
		);
	  
		setUser(data.user);
	  
		return data.user;
	  }
  
	function logout() {
	  localStorage.removeItem(
		"token"
	  );
  
	  localStorage.removeItem(
		"user"
	  );
  
	  setUser(null);
  
	  window.location.href = "/login";
	}
  
	return (
	  <AuthContext.Provider
		value={{
		  user,
		  loading,
		  login,
		  register,
		  logout,
		}}
	  >
		{children}
	  </AuthContext.Provider>
	);
  }
  
  export function useAuth() {
	return useContext(AuthContext);
  }
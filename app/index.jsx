import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import App from "./App";
import { auth } from "./firebaseConfig";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    document.title = "Login Clínica Médica";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      setUser(userCredential.user);
      onLoginSuccess(userCredential.user);
    } catch (err) {
      setErro("Email ou senha incorretos!");
    }
  };

  if (user) {
    return <App user={user} />;
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login do Sistema</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Entrar
          </button>
        </form>

        {erro && <p style={styles.error}>{erro}</p>}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
    margin: 0,
    padding: 0,
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    width: "360px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  title: {
    marginBottom: "28px",
    fontSize: "24px",
    color: "#333",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "18px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    transition: "border 0.3s",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s",
  },
  error: {
    marginTop: "15px",
    color: "red",
    fontSize: "14px",
  },
};

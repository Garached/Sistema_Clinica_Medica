import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import App from "./App";
import { auth } from "./firebaseConfig";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [user, setUser] = useState(null);
  const [erro, setErro] = useState("");

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login do Sistema</h2>

        <form onSubmit={handleLogin}>
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
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px 50px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    width: "360px",
    textAlign: "center",
  },
  title: {
    marginBottom: "30px",
    fontSize: "24px",
    color: "#333",
    fontWeight: "bold",
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
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  error: {
    marginTop: "15px",
    color: "red",
    fontSize: "14px",
  },
};

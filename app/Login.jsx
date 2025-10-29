import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, senha);
        alert("Cadastro realizado com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
        onLogin(); // chama o painel principal
      }
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      alert("Erro: " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isRegister ? "Cadastro de Funcionário" : "Login de Funcionário"}</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.btnPrimary}>
            {isRegister ? "Cadastrar" : "Entrar"}
          </button>

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={styles.btnSwitch}
          >
            {isRegister ? "Já tenho conta" : "Criar nova conta"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eaf9f9",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    textAlign: "center",
    color: "#2b9aa3",
    marginBottom: "25px",
  },
  field: { marginBottom: "20px", display: "flex", flexDirection: "column" },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  btnPrimary: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#2b9aa3",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "10px",
  },
  btnSwitch: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#f0f0f0",
    color: "#333",
    cursor: "pointer",
  },
};

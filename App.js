import React, { useState } from "react";
import "./styles.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Dados de exemplo
  const pacientesExemplo = [
    { nome: "João Silva", cpf: "123.456.789-00", dataNasc: "12/05/1980", convenio: "Unimed", contato: "(11) 99999-9999" },
    { nome: "Maria Souza", cpf: "222.333.444-55", dataNasc: "20/11/1992", convenio: "Particular", contato: "(21) 98888-7777" },
  ];

  const agendamentosExemplo = [
    { hora: "08:30", paciente: "João Silva", medico: "Dr. Pedro", especialidade: "Cardiologia", sala: "2", status: "upcoming" },
    { hora: "09:00", paciente: "Maria Souza", medico: "Drª. Ana", especialidade: "Pediatria", sala: "1", status: "busy" },
  ];

  // Função para renderizar a página clicada
  const renderPage = () => {
    switch(activePage) {
      case "Dashboard":
        return (
          <section className="dashboard">
            <div className="card kpi">
              <h3>Agendamentos hoje</h3>
              <div className="kpi-big">27</div>
              <small>Confirmados: 22 • Cancelados: 5</small>
            </div>
            <div className="card kpi">
              <h3>Pacientes cadastrados</h3>
              <div className="kpi-big">1.452</div>
              <small>Novos este mês: 34</small>
            </div>
            <div className="card kpi">
              <h3>Receita (mês)</h3>
              <div className="kpi-big">R$ 68.340,00</div>
              <small>Convênios: 64%</small>
            </div>
            <div className="card calendar-preview">
              <h3>Próximas consultas</h3>
              <ul className="mini-calendar">
                {agendamentosExemplo.map((a,i) => (
                  <li key={i}><strong>{a.hora}</strong> — {a.paciente} ({a.especialidade})</li>
                ))}
              </ul>
              <div className="card-actions">
                <button className="btn">Ver Agenda Completa</button>
                <button className="btn btn-outline">Novo Agendamento</button>
              </div>
            </div>
          </section>
        );

      case "Pacientes":
        return (
          <div className="card">
            <div className="card-header">
              <h3>Pacientes</h3>
            </div>
            <div className="filters">
              <input placeholder="Pesquisar por nome, CPF ou telefone..." />
              <select>
                <option value="">Todos convênios</option>
                <option>Particular</option>
                <option>Unimed</option>
                <option>Bradesco</option>
              </select>
              <button className="btn btn-sm">Filtrar</button>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Data Nasc.</th>
                    <th>Convênio</th>
                    <th>Contato</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesExemplo.map((p,i) => (
                    <tr key={i}>
                      <td>{p.nome}</td>
                      <td>{p.cpf}</td>
                      <td>{p.dataNasc}</td>
                      <td>{p.convenio}</td>
                      <td>{p.contato}</td>
                      <td className="actions">
                        <button className="btn-icon">📄</button>
                        <button className="btn-icon">✏️</button>
                        <button className="btn-icon danger">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Agendamentos":
        return (
          <div className="card">
            <div className="card-header">
              <h3>Agendamentos / Calendário</h3>
            </div>
            <ul className="agenda-list">
              {agendamentosExemplo.map((a,i) => (
                <li key={i} className={a.status === "busy" ? "busy" : ""}>
                  <div className="time">{a.hora}</div>
                  <div className="info">
                    <strong>Consulta — {a.medico} ({a.especialidade})</strong>
                    <div>Paciente: {a.paciente} • Sala {a.sala}</div>
                  </div>
                  <div className="agenda-actions">
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon danger">Cancelar</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="card-footer">
              <button className="btn btn-primary">Agendar Nova Consulta</button>
            </div>
          </div>
        );

      case "Médicos":
        return (
          <div className="grid-3">
            <div className="card small">
              <h4>Médicos</h4>
              <ul className="compact-list">
                <li>Dr. Pedro — Cardiologia <span className="muted">[09:00–17:00]</span></li>
                <li>Drª. Ana — Pediatria <span className="muted">[08:00–14:00]</span></li>
                <li>Dr. Lucas — Ortopedia <span className="muted">[12:00–20:00]</span></li>
              </ul>
              <div className="card-actions">
                <button className="btn-sm">Gerenciar Médicos</button>
              </div>
            </div>
          </div>
        );

      case "Especialidades":
        return (
          <div className="grid-3">
            <div className="card small">
              <h4>Especialidades</h4>
              <ul className="compact-list">
                <li>Cardiologia • 4 médicos</li>
                <li>Pediatria • 3 médicos</li>
                <li>Ortopedia • 2 médicos</li>
              </ul>
              <div className="card-actions">
                <button className="btn-sm">Gerenciar Especialidades</button>
              </div>
            </div>
          </div>
        );

      case "Vacinas":
        return (
          <div className="grid-3">
            <div className="card small">
              <h4>Carteirinha de Vacinação</h4>
              <div className="vac-preview">
                <p><strong>João Silva</strong></p>
                <p>2 vacinas registradas • <a href="#">Ver histórico</a></p>
              </div>
              <div className="card-actions">
                <button className="btn-sm">Abrir Carteirinha</button>
              </div>
            </div>
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">CLÍNICA</div>
          <div className="brand-sub">Gestão médica</div>
        </div>
        <nav className="nav">
          {["Dashboard","Pacientes","Agendamentos","Médicos","Especialidades","Vacinas","Relatórios","Financeiro","Configurações"].map(item => (
            <button
              key={item}
              className={`nav-item ${activePage === item ? "active" : ""}`}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>Usuário: Recepção</small>
          <button className="btn-logout">Sair</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="search">
            <input placeholder="Pesquisar pacientes, CPF, médico, convênio..." />
          </div>
          <div className="top-actions">
            <button className="btn btn-primary">+ Novo Paciente</button>
            <div className="icon-bell" title="Notificações">
              <span className="badge">3</span>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <section className="content">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}

export default App;

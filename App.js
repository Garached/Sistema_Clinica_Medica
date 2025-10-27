import React, { useState } from 'react';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  const [pacientes, setPacientes] = useState([
    { id: 1, nome: "João Silva", cpf: "123.456.789-00", dataNasc: "12/05/1980", convenio: "Unimed" },
    { id: 2, nome: "Maria Souza", cpf: "222.333.444-55", dataNasc: "20/11/1992", convenio: "Particular" },
  ]);

  const [agendamentos, setAgendamentos] = useState([
    { id: 1, hora: "08:30", paciente: "João Silva", medico: "Dr. Pedro", especialidade: "Cardiologia", status: "confirmado" },
    { id: 2, hora: "09:00", paciente: "Maria Souza", medico: "Dra. Ana", especialidade: "Pediatria", status: "aguardando" },
  ]);
  
  const [medicos, setMedicos] = useState([
    { id: 1, nome: "Dr. Pedro Almeida", especialidade: "Cardiologia", horario: "09:00-17:00", imagem: "https://images.unsplash.com/photo-1537368910025-7003507965b6?w=500&auto=format&fit=crop" },
    { id: 2, nome: "Dra. Ana Souza", especialidade: "Pediatria", horario: "08:00-14:00", imagem: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop" },
  ]);

  const [especialidades, setEspecialidades] = useState([
      { id: 1, nome: "Cardiologia", medicos: 4 },
      { id: 2, nome: "Pediatria", medicos: 3 },
  ]);

  const [vacinas, setVacinas] = useState([ { id: 1, paciente: "João Silva", vacinas: 2 } ]);

  const dadosRelatorio = {
    consultasPorMes: [{ mes: 'Setembro', total: 250 }, { mes: 'Outubro', total: 210 }],
    faturamentoPorConvenio: [{ convenio: 'Unimed', valor: 'R$ 42.850' }, { convenio: 'Particular', valor: 'R$ 23.100' }],
  };
  
  const handleEdit = (id, tipo) => {
    alert(`Ação: EDITAR item ${id} da categoria ${tipo}`);
  };

  const handleDelete = (id, tipo, setter) => {
    if (window.confirm(`Tem certeza que deseja excluir o item ${id} de ${tipo}?`)) {
      setter(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <section style={styles.dashboardGrid}>
            <div style={styles.card}><h3 style={styles.cardTitle}>Agendamentos hoje</h3><div style={styles.kpi}>27</div><small>Confirmados: 22 / Cancelados: 5</small></div>
            <div style={styles.card}><h3 style={styles.cardTitle}>Pacientes</h3><div style={styles.kpi}>{pacientes.length}</div><small>Novos este mês: 3</small></div>
            <div style={styles.card}><h3 style={styles.cardTitle}>Receita (mês)</h3><div style={styles.kpi}>R$ 68.340</div><small>Convênios: 64%</small></div>
          </section>
        );

      case "Pacientes":
        return (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Pacientes</h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Nome</th><th style={styles.th}>CPF</th><th style={styles.th}>Nascimento</th><th style={styles.th}>Ações</th></tr></thead>
                <tbody>
                  {pacientes.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.nome}</td><td style={styles.td}>{item.cpf}</td><td style={styles.td}>{item.dataNasc}</td>
                      <td style={styles.td}><button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Pacientes')}>Editar</button><button style={{...styles.btnIcon, color: '#e57373'}} onClick={() => handleDelete(item.id, 'Pacientes', setPacientes)}>Excluir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        );

      case "Médicos":
        return (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Médicos</h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Médico</th><th style={styles.th}>Especialidade</th><th style={styles.th}>Ações</th></tr></thead>
                <tbody>
                  {medicos.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center' }}><img src={item.imagem} alt={item.nome} style={styles.tdImage} />{item.nome}</div></td>
                      <td style={styles.td}>{item.especialidade}</td>
                      <td style={styles.td}><button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Médicos')}>Editar</button><button style={{...styles.btnIcon, color: '#e57373'}} onClick={() => handleDelete(item.id, 'Médicos', setMedicos)}>Excluir</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        );

      case "Agendamentos":
         return (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Agendamentos</h3>
               <ul style={{padding: 0, listStyle: 'none'}}>
                {agendamentos.map((a) => (
                  <li key={a.id} style={{...styles.agendaItem, borderLeftColor: a.status === 'confirmado' ? '#4caf50' : '#ffc107'}}>
                    <div style={{fontWeight: '600', width: '80px'}}>{a.hora}</div>
                    <div style={{flexGrow: 1}}><strong>Consulta - {a.medico}</strong><div>Paciente: {a.paciente}</div></div>
                    <div><button style={styles.btnIcon} onClick={() => handleEdit(a.id, 'Agendamentos')}>Editar</button></div>
                  </li>
                ))}
              </ul>
            </div>
         );

      case "Especialidades":
        return (
             <div style={styles.card}>
                <h3 style={styles.cardTitle}>Especialidades</h3>
                <table style={styles.table}>
                    <thead><tr><th style={styles.th}>Nome</th><th style={styles.th}>Qtd. Médicos</th><th style={styles.th}>Ações</th></tr></thead>
                    <tbody>
                        {especialidades.map((item) => (
                            <tr key={item.id}>
                                <td style={styles.td}>{item.nome}</td><td style={styles.td}>{item.medicos}</td>
                                <td style={styles.td}><button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Especialidades')}>Editar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

      case "Carteirinha":
         return (
             <div style={styles.card}>
                <h3 style={styles.cardTitle}>Carteirinha de Vacinação</h3>
                <table style={styles.table}>
                    <thead><tr><th style={styles.th}>Paciente</th><th style={styles.th}>Vacinas</th><th style={styles.th}>Ações</th></tr></thead>
                    <tbody>
                        {vacinas.map((item) => (
                            <tr key={item.id}>
                                <td style={styles.td}>{item.paciente}</td><td style={styles.td}>{item.vacinas}</td>
                                <td style={styles.td}><button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Carteirinha')}>Ver</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         );

      case "Relatórios":
        return (
            <section>
              <div style={styles.card}><h3 style={styles.cardTitle}>Relatórios Gerenciais</h3></div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div style={styles.card}>
                  <h4 style={styles.cardTitle}>Consultas por Mês</h4>
                  <table style={styles.table}>
                    <thead><tr><th style={styles.th}>Mês</th><th style={styles.th}>Total</th></tr></thead>
                    <tbody>{dadosRelatorio.consultasPorMes.map((item, i) => (<tr key={i}><td style={styles.td}>{item.mes}</td><td style={styles.td}>{item.total}</td></tr>))}</tbody>
                  </table>
                </div>
                <div style={styles.card}>
                  <h4 style={styles.cardTitle}>Faturamento por Convênio</h4>
                  <table style={styles.table}>
                     <thead><tr><th style={styles.th}>Convênio</th><th style={styles.th}>Valor</th></tr></thead>
                     <tbody>{dadosRelatorio.faturamentoPorConvenio.map((item, i) => (<tr key={i}><td style={styles.td}>{item.convenio}</td><td style={styles.td}>{item.valor}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
            </section>
        );

      default: return <h1>Página não encontrada</h1>;
    }
  };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={styles.logo}>CLÍNICA</div>
          <div style={{fontSize: '13px', color: '#777'}}>Gestão Médica</div>
        </div>
        <nav>
          {["Dashboard", "Pacientes", "Agendamentos", "Médicos", "Especialidades", "Carteirinha", "Relatórios"].map(item => (
            <button key={item} style={activePage === item ? {...styles.navItem, ...styles.navItemActive} : styles.navItem} onClick={() => setActivePage(item)}>
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main style={styles.main}>
        <header style={styles.topbar}>
          <input style={styles.searchInput} placeholder="Pesquisar..." />
          <button style={styles.btnPrimary}>+ Novo Paciente</button>
        </header>
        <section style={styles.content}>{renderPage()}</section>
      </main>
    </div>
  );
}

const styles = {
  app: { display: 'flex', fontFamily: 'sans-serif', backgroundColor: '#f4f7f8', minHeight: '100vh' },
  sidebar: { width: '240px', backgroundColor: '#eaf9f9', padding: '20px 10px', borderRight: '1px solid #e0e0e0' },
  logo: { fontSize: '24px', fontWeight: '700', color: '#2b9aa3' },
  navItem: { width: '100%', padding: '12px 15px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '15px', fontWeight: '500', borderRadius: '8px', cursor: 'pointer', marginBottom: '5px' },
  navItemActive: { backgroundColor: '#2b9aa3', color: 'white' },
  main: { flexGrow: 1 },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' },
  searchInput: { width: '350px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px' },
  content: { padding: '20px' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' },
  cardTitle: { marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px', color: '#333' },
  kpi: { fontSize: '32px', fontWeight: '700', margin: '10px 0', color: '#2b9aa3' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontSize: '13px', color: '#777', textTransform: 'uppercase' },
  td: { padding: '12px 15px', borderBottom: '1px solid #e0e0e0', verticalAlign: 'middle' },
  tdImage: { width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px', objectFit: 'cover' },
  btnPrimary: { padding: '10px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#2b9aa3', color: 'white' },
  btnIcon: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', marginRight: '10px', color: '#555', fontWeight: 'bold' },
  agendaItem: { display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #e0e0e0', borderLeft: '4px solid' },
};

export default App;

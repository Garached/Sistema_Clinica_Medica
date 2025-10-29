import React, { useState ,useEffect} from 'react';
import { addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore'; 

import { 
    pacientesCollection, 
    medicosCollection, 
    agendamentosCollection,
    db
} from './firebaseConfig';



function App() {
  const [activePage, setActivePage] = useState('Dashboard');
    const [pacientes, setPacientes] = useState([]);
//   const [pacientes, setPacientes] = useState([
//     { id: 1, nome: "João Silva", cpf: "123.456.789-00", dataNasc: "12/05/1980", convenio: "Unimed" },
//     { id: 2, nome: "Maria Souza", cpf: "222.333.444-55", dataNasc: "20/11/1992", convenio: "Particular" },
//   ]);
  const [agendamentos, setAgendamentos] = useState([
    { id: 1, hora: "08:30", paciente: "João Silva", medico: "Dr. Pedro", especialidade: "Cardiologia", status: "confirmado" },
    { id: 2, hora: "09:00", paciente: "Maria Souza", medico: "Dra. Ana", especialidade: "Pediatria", status: "aguardando" },
  ]);
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([
    { id: 1, nome: "Cardiologia", medicos: 4 },
    { id: 2, nome: "Pediatria", medicos: 3 },
  ]);
  const [vacinas, setVacinas] = useState([{ id: 1, paciente: "João Silva", vacinas: 2 }]);

  const dadosRelatorio = {
    consultasPorMes: [{ mes: 'Setembro', total: 250 }, { mes: 'Outubro', total: 210 }],
    faturamentoPorConvenio: [{ convenio: 'Unimed', valor: 'R$ 42.850' }, { convenio: 'Particular', valor: 'R$ 23.100' }],
  };

  const [showModalPaciente, setShowModalPaciente] = useState(false);
  const [showModalMedico, setShowModalMedico] = useState(false);
  const [formPaciente, setFormPaciente] = useState({ nome: '', cpf: '', dataNasc: '', convenio: '' });
const [formMedico, setFormMedico] = useState({ nome: '', especialidade: '', horario: '', imagem: '' });

  const handleEdit = (id, tipo) => {
    alert(`Ação: EDITAR item ${id} da categoria ${tipo} (implementar)`);
  };

  const handleDelete = (id, tipo, setter) => {
    if (window.confirm(`Tem certeza que deseja excluir o item ${id} de ${tipo}?`)) {
      setter(prevItems => prevItems.filter(item => item.id !== id));
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormPaciente(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleInputChangeMedico = (event) => {
    const { name, value } = event.target;
    setFormMedico(prevForm => ({ ...prevForm, [name]: value }));
  };
// ... dentro da função App()

//PACIENTEEESS
  useEffect(() => {
    // Carregar Pacientes do Firestore
    const q = query(pacientesCollection, orderBy("nome", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pacientesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPacientes(pacientesData);
    }, (error) => {
      console.error("Erro ao carregar pacientes: ", error);
    });

    return () => unsubscribe();
  }, []);

  //MÉDICOSS
  useEffect(() => {
    const q = query(medicosCollection, orderBy("nome", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicosData = [];
      const contagemEspecialidades = {}; 

      snapshot.docs.forEach(doc => {
        const medico = {
          id: doc.id,
          ...doc.data()
        };
        
        medicosData.push(medico);

        const esp = medico.especialidade;
        if (esp) {
          contagemEspecialidades[esp] = (contagemEspecialidades[esp] || 0) + 1;
        }
      });
      
      setMedicos(medicosData);

      const especialidadesList = Object.keys(contagemEspecialidades).map((nome, index) => ({
        id: index, 
        nome: nome,
        medicos: contagemEspecialidades[nome],
      }));
      
      setEspecialidades(especialidadesList); 

    }, (error) => {
      console.error("Erro ao carregar médicos e especialidades: ", error);
    });

    return () => unsubscribe();
  }, []);

  
const handleSavePaciente = async () => { 
  if (!formPaciente.nome || !formPaciente.cpf || !formPaciente.dataNasc) {
    alert("Por favor, preencha Nome, CPF e Data de Nascimento.");
    return;
  }
  
  try {
    await addDoc(pacientesCollection, {
      nome: formPaciente.nome,
      cpf: formPaciente.cpf,
      dataNasc: formPaciente.dataNasc, // Salva a string 'YYYY-MM-DD'
      convenio: formPaciente.convenio || 'Particular',
      dataCadastro: new Date().toISOString(), 
    });

    alert(`Paciente "${formPaciente.nome}" salvo com sucesso!`);
    setFormPaciente({ nome: '', cpf: '', dataNasc: '', convenio: '' });
    setShowModalPaciente(false);
    
  } catch (error) {
    console.error("ERRO ao adicionar paciente (Verifique as Regras de Segurança!): ", error);
    alert("ERRO ao salvar paciente. Verifique o console (F12)!");
  }
};
const handleSaveMedico = async () => {
    if (!formMedico.nome || !formMedico.especialidade || !formMedico.horario) {
      alert("Por favor, preencha Nome, Especialidade e Horário de trabalho.");
      return;
    }
    
    try {
      // 🚨 ATENÇÃO: Use 'medicosCollection'
      await addDoc(medicosCollection, {
        nome: formMedico.nome,
        especialidade: formMedico.especialidade,
        horario: formMedico.horario,
        imagem: formMedico.imagem || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?fit=crop&w=50', // Imagem default
        dataCadastro: new Date().toISOString(), 
      });

      alert(`Médico(a) "${formMedico.nome}" salvo com sucesso!`);
      // Limpa e fecha o modal
      setFormMedico({ nome: '', especialidade: '', horario: '', imagem: '' });
      setShowModalMedico(false);
      
    } catch (error) {
      console.error("ERRO ao adicionar médico:", error);
      alert("ERRO ao salvar médico. Verifique o console (F12)!");
    }
  };

  // --- RENDERIZAÇÃO DAS PÁGINAS ---
  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <section style={styles.dashboardGrid}>
            <div style={styles.card}><h3 style={styles.cardTitle}>Agendamentos hoje</h3><div style={styles.kpi}>{agendamentos.length}</div><small>Confirmados: {agendamentos.filter(a=>a.status === 'confirmado').length} / Aguardando: {agendamentos.filter(a=>a.status === 'aguardando').length}</small></div>
            <div style={styles.card}><h3 style={styles.cardTitle}>Pacientes</h3><div style={styles.kpi}>{pacientes.length}</div><small>Total cadastrado</small></div>
            <div style={styles.card}><h3 style={styles.cardTitle}>Receita (mês)</h3><div style={styles.kpi}>R$ 68.340</div><small>Exemplo</small></div>
          </section>
        );

      case "Pacientes":
        return (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Pacientes</h3>
            <button style={styles.btnPrimary} onClick={() => setShowModalPaciente(true)}>+ Novo Paciente</button>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Nome</th><th style={styles.th}>CPF</th><th style={styles.th}>Nascimento</th><th style={styles.th}>Convênio</th><th style={styles.th}>Ações</th></tr></thead>
              <tbody>
                {pacientes.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.nome}</td>
                    <td style={styles.td}>{item.cpf}</td>
                    <td style={styles.td}>{item.dataNasc}</td>
                    <td style={styles.td}>{item.convenio || 'Particular'}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}> {/* Envolve botões para alinhamento */}
                        <button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Pacientes')}>✏️ Editar</button>
                      </div>
                    </td>
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
<button style={styles.btnPrimary} onClick={() => setShowModalMedico(true)}>+ Novo Médico</button>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Médico</th><th style={styles.th}>Especialidade</th><th style={styles.th}>Ações</th></tr></thead>
              <tbody>
                {medicos.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}><div style={styles.medicoCell}><img src={item.imagem} alt={item.nome} style={styles.tdImage} />{item.nome}</div></td> {/* Estilo medicoCell para alinhar */}
                    <td style={styles.td}>{item.especialidade}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}> {/* Envolve botões para alinhamento */}
                        <button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Médicos')}>✏️ Editar</button>
                        <button style={{...styles.btnIcon, color: '#e57373'}} onClick={() => handleDelete(item.id, 'Médicos', setMedicos)}>🗑️ Excluir</button>
                      </div>
                    </td>
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
                  <div style={styles.agendaTime}>{a.hora}</div> {/* Estilo específico para hora */}
                  <div style={styles.agendaInfo}> {/* Estilo específico para info */}
                    <strong>Consulta - {a.medico}</strong>
                    <div style={{fontSize: '0.9em', color: '#666'}}>Paciente: {a.paciente}</div> {/* Ajuste visual menor */}
                  </div>
                  <div style={styles.agendaActions}> {/* Estilo específico para ações */}
                    <button style={styles.btnIcon} onClick={() => handleEdit(a.id, 'Agendamentos')}>✏️ Editar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );

      // ... dentro da função renderPage()
      case "Especialidades":
        return (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Especialidades</h3>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Nome</th><th style={styles.th}>Qtd. Médicos</th><th style={styles.th}>Ações</th></tr></thead>
              <tbody>
                {especialidades.map((item) => ( 
                  <tr key={item.id}>
                    <td style={styles.td}>{item.nome}</td>
                    {/* AQUI ESTÁ A CONTAGEM AUTOMÁTICA! */}
                    <td style={styles.td}>{item.medicos}</td> 
                    <td style={styles.td}>
                      <div style={styles.actionsCell}> 
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
// ...

      case "Carteirinha":
        return (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Carteirinha de Vacinação</h3>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Paciente</th><th style={styles.th}>Vacinas</th><th style={styles.th}>Ações</th></tr></thead>
              <tbody>
                {vacinas.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.paciente}</td>
                    <td style={styles.td}>{item.vacinas}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}> {/* Envolve botões para alinhamento */}
                        <button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Carteirinha')}>👁️ Ver</button>
                      </div>
                    </td>
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
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}> {/* Ajuste no grid */}
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

      default: return <div style={styles.card}><h1>Página não encontrada</h1></div>;
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
        </header>
        <section style={styles.content}>{renderPage()}</section>
      </main>

      {/* --- MODAL DE NOVO PACIENTE --- */}
      {showModalPaciente && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.cardTitle}>Cadastrar Novo Paciente</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome Completo:</label>
              <input type="text" name="nome" value={formPaciente.nome} onChange={handleInputChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>CPF:</label>
              <input type="text" name="cpf" value={formPaciente.cpf} onChange={handleInputChange} style={styles.input} placeholder="123.456.789-00"/>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Nascimento:</label>
              <input type="date" name="dataNasc" value={formPaciente.dataNasc} onChange={handleInputChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Convênio (Opcional):</label>
              <input type="text" name="convenio" value={formPaciente.convenio} onChange={handleInputChange} style={styles.input} />
            </div>
            <div style={styles.modalActions}>
              <button style={styles.btnPrimary} onClick={handleSavePaciente}>Salvar Paciente</button>
              <button style={{...styles.btnSecondary}} onClick={() => setShowModalPaciente(false)}>Cancelar</button> {/* Estilo secundário */}
            </div>
          </div>
        </div>
      )}
    {/* --- MODAL DE NOVO MÉDICO --- */}
  {showModalMedico && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.cardTitle}>Cadastrar Novo Médico</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome Completo:</label>
              <input 
                type="text" 
                name="nome" 
                value={formMedico.nome} 
                onChange={handleInputChangeMedico} 
                style={styles.input} 
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Especialidade:</label>
              <input 
                type="text" 
                name="especialidade" 
                value={formMedico.especialidade} 
                onChange={handleInputChangeMedico} 
                style={styles.input} 
                placeholder="Ex: Cardiologia, Pediatria"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Horário de Trabalho:</label>
              <input 
                type="text" 
                name="horario" 
                value={formMedico.horario} 
                onChange={handleInputChangeMedico} 
                style={styles.input} 
                placeholder="Ex: 08:00-17:00"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>URL da Imagem (Opcional):</label>
              <input 
                type="text" 
                name="imagem" 
                value={formMedico.imagem} 
                onChange={handleInputChangeMedico} 
                style={styles.input} 
                placeholder="URL de uma foto do médico"
              />
            </div>
            
            <div style={styles.modalActions}>
              <button style={styles.btnPrimary} onClick={handleSaveMedico}>Salvar Médico</button>
              <button style={styles.btnSecondary} onClick={() => setShowModalMedico(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  app: { display: 'flex', fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', backgroundColor: '#f4f7f8', minHeight: '100vh' },
  sidebar: { width: '240px', backgroundColor: '#eaf9f9', padding: '20px 10px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo: { fontSize: '24px', fontWeight: '700', color: '#2b9aa3' },
  navItem: { width: '100%', padding: '12px 15px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '15px', fontWeight: '500', borderRadius: '8px', cursor: 'pointer', marginBottom: '5px', color: '#333' },
  navItemActive: { backgroundColor: '#2b9aa3', color: 'white' },
  main: { flexGrow: 1, display: 'flex', flexDirection: 'column' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', flexShrink: 0 },
  searchInput: { width: '350px', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' },
  content: { padding: '25px', flexGrow: 1, overflowY: 'auto' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '25px' },
  cardTitle: { marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px', color: '#333', fontSize: '1.2em', fontWeight: 600 },
  kpi: { fontSize: '30px', fontWeight: '700', margin: '10px 0', color: '#2b9aa3' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' },

  table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
  th: { padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontSize: '13px', color: '#777', textTransform: 'uppercase', backgroundColor: '#f9f9f9' },
  td: { padding: '14px 15px', borderBottom: '1px solid #e0e0e0', verticalAlign: 'middle', fontSize: '14px' },
  tdImage: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover' },
  medicoCell: { display: 'flex', alignItems: 'center' },
  actionsCell: { display: 'flex', alignItems: 'center', gap: '5px' },

  btnPrimary: { padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#2b9aa3', color: 'white', fontSize: '14px' },
  btnSecondary: { padding: '10px 18px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', fontWeight: '600', backgroundColor: '#f0f0f0', color: '#333', fontSize: '14px' },
  btnIcon: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', color: '#555', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' },

  agendaItem: { display: 'flex', alignItems: 'center', padding: '16px 10px', borderBottom: '1px solid #e0e0e0', borderLeftWidth: '5px', borderLeftStyle: 'solid', gap: '15px' },
  agendaTime: { fontWeight: '600', width: '70px', textAlign: 'center', flexShrink: 0 },
  agendaInfo: { flexGrow: 1 },
  agendaActions: { flexShrink: 0 },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', 
    zIndex: 1000,
    padding: '20px' 
  },
  modalContent: {
    background: 'white',
    padding: '25px 30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    maxHeight: '90vh', 
    overflowY: 'auto', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#555' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '25px',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '20px',
    flexShrink: 0 
  }
};

export default App;


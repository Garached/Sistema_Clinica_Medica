import { signOut } from "firebase/auth";
import { addDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  auth,
  db,
  funcionariosCollection,
  medicosCollection,
  pacientesCollection,
  vacinasCollection
} from './firebaseConfig';
import Login from "./index.jsx";
// Importar o restante das coleções (Pacientes, Médicos, etc.) no seu firebaseConfig.js
// é crucial para o código abaixo funcionar.

function App() {
  const sair = () => {
    signOut(auth).then(() => {
      window.location.reload(); // volta pra tela de login
    });
  };

  const [activePage, setActivePage] = useState('Dashboard');
  const [pacientes, setPacientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([
    { id: 1, hora: "08:30", paciente: "João Silva", medico: "Dr. Pedro", especialidade: "Cardiologia", status: "confirmado" },
    { id: 2, hora: "09:00", paciente: "Maria Souza", medico: "Dra. Ana", especialidade: "Pediatria", status: "aguardando" },
  ]);
  const [medicos, setMedicos] = useState([]);
  const [vacinas, setVacinas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [carteirinhaAgrupada, setCarteirinhaAgrupada] = useState([]);
  
  
  const [especialidades, setEspecialidades] = useState([]);

  const dadosRelatorio = {
    consultasPorMes: [{ mes: 'Setembro', total: 250 }, { mes: 'Outubro', total: 210 }],
    faturamentoPorConvenio: [{ convenio: 'Unimed', valor: 'R$ 42.850' }, { convenio: 'Particular', valor: 'R$ 23.100' }],
  };

  const [showModalPaciente, setShowModalPaciente] = useState(false);
  const [showModalMedico, setShowModalMedico] = useState(false);
  const [showModalVacina, setShowModalVacina] = useState(false);
  const [showModalFuncionario, setShowModalFuncionario] = useState(false);
  const [showModalDetalhesVacinas, setShowModalDetalhesVacinas] = useState(false);
  const [pacienteEmDetalhe, setPacienteEmDetalhe] = useState(null);

  const [formPaciente, setFormPaciente] = useState({ nome: '', cpf: '', dataNasc: '', convenio: '' });
  const [formMedico, setFormMedico] = useState({ nome: '', especialidade: '', horario: '', imagem: '' });
  const [formVacina, setFormVacina] = useState({ pacienteId: '', dataVacina: '', vacina: '' });
  const [formFuncionario, setFormFuncionario] = useState({ nome: '', email: '', senha: '' });

  // Funções de manipulação e exclusão... (Mantidas as suas originais e as novas de Funcionário)

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

  const handleInputChangeFuncionario = (event) => {
    const { name, value } = event.target;
    setFormFuncionario(prevForm => ({ ...prevForm, [name]: value }));
  };
  const handleInputChangeVacina = (event) => {
        const { name, value } = event.target;
        setFormVacina(prevForm => ({ ...prevForm, [name]: value }));
    };
  
  useEffect(() => {
    document.title = "Clínica Médica"; 
  }, []);


  
  // USE EFFECT PARA CARREGAR PACIENTES
  useEffect(() => {
    const q = query(pacientesCollection, orderBy("nome", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pacientesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPacientes(pacientesData);
    }, (error) => {
      console.error("Erro ao carregar pacientes: ", error);
    });
    return () => unsubscribe();
  }, []);
  
  // USE EFFECT PARA CARREGAR MÉDICOOOSS
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

  // USE EFFECT PARA CARREGAR FUNCIONÁRIOS 
   useEffect(() => {
  const q = query(funcionariosCollection, orderBy("nome", "asc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const funcionariosData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFuncionarios(funcionariosData);
  }, (error) => {
    console.error("Erro ao carregar funcionarios: ", error);
  });
  return () => unsubscribe();
}, []);

  // USE EFFECT PARA CARREGAR REGISTROS DE VACINAS
  useEffect(() => {
    const q = query(vacinasCollection, orderBy("dataVacina", "desc")); // Ordena pela data da vacina
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vacinasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVacinas(vacinasData); // Popula o estado de vacinas
    }, (error) => {
      console.error("Erro ao carregar vacinas: ", error);
    });

    return () => unsubscribe();
  }, []);

  // USE EFFECT PARA AGRUPAR VACINAS POR PACIENTE
  useEffect(() => {
    if (pacientes.length === 0 || vacinas.length === 0) {
      // Se não há pacientes ou vacinas, retorna um array vazio (ou o que for necessário)
      // O return vazio aqui garante que, se só um array foi carregado, não haverá erro.
      if (pacientes.length > 0) {
        // Garante que pacientes sem vacina apareçam com 0 vacinas
        setCarteirinhaAgrupada(pacientes.map(p => ({
          id: p.id,
          nome: p.nome,
          totalVacinas: 0,
          detalhes: [],
        })));
      } else {
        setCarteirinhaAgrupada([]);
      }
      return;
    }

    const vacinasPorPaciente = vacinas.reduce((acc, vacina) => {
      const pacienteId = vacina.pacienteId;
      if (!acc[pacienteId]) {
        acc[pacienteId] = [];
      }

      acc[pacienteId].push({
        idVac: vacina.id,
        vacina: vacina.vacina,
        data: vacina.dataVacina,
      });
      return acc;
    }, {});

    const listaAgrupada = pacientes.map(paciente => {
      const detalhesVacinas = vacinasPorPaciente[paciente.id] || [];
      return {
        id: paciente.id,
        nome: paciente.nome,
        totalVacinas: detalhesVacinas.length,
        detalhes: detalhesVacinas,
      };
    });

    setCarteirinhaAgrupada(listaAgrupada);
    
  }, [pacientes, vacinas]);

  // --- FUNÇÕES DE SALVAR DADOS ---

  const handleSavePaciente = async () => { 
    if (!formPaciente.nome || !formPaciente.cpf || !formPaciente.dataNasc) {
      alert("Por favor, preencha Nome, CPF e Data de Nascimento.");
      return;
    }
    try {
      await addDoc(pacientesCollection, {
        nome: formPaciente.nome,
        cpf: formPaciente.cpf,
        dataNasc: formPaciente.dataNasc,
        convenio: formPaciente.convenio || "Particular",
        dataCadastro: new Date().toISOString(),
      });
      alert(`Paciente "${formPaciente.nome}" salvo com sucesso!`);
      setFormPaciente({ nome: "", cpf: "", dataNasc: "", convenio: "" });
      setShowModalPaciente(false);
    } catch (error) {
      console.error(
        "ERRO ao adicionar paciente (Verifique as Regras de Segurança!): ",
        error
      );
      alert("ERRO ao salvar paciente. Verifique o console (F12)!");
    }
  };

  const handleSaveMedico = async () => {
    if (!formMedico.nome || !formMedico.especialidade || !formMedico.horario) {
      alert("Por favor, preencha Nome, Especialidade e Horário de trabalho.");
      return;
    }
    try {
      await addDoc(medicosCollection, {
        nome: formMedico.nome,
        especialidade: formMedico.especialidade,
        horario: formMedico.horario,
        imagem:
          formMedico.imagem ||
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?fit=crop&w=50",
        dataCadastro: new Date().toISOString(),
      });
      alert(`Médico(a) "${formMedico.nome}" salvo com sucesso!`);
      setFormMedico({ nome: "", especialidade: "", horario: "", imagem: "" });
      setShowModalMedico(false);
    } catch (error) {
      console.error("ERRO ao adicionar médico:", error);
      alert("ERRO ao salvar médico. Verifique o console (F12)!");
    }
  };

  // --- FUNÇÃO DE SALVAR FUNCIONÁRIOS ---

const handleSaveFuncionario = async () => {
  const { nome, email, senha } = formFuncionario;

  if (!nome || !email || !senha) {
    alert("Por favor, preencha Nome, Email e Senha.");
    return;
  }

  try {
    // 1. CRIAR A CONTA DE LOGIN NO FIREBASE AUTH
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );
    const uid = userCredential.user.uid;

    // 2. SALVAR DADOS DE PERFIL NO FIRESTORE (como você faz com Pacientes, mas usando setDoc)
    // Usamos setDoc com o UID como ID do documento, para ligar a conta Auth ao perfil.
    const funcionarioRef = doc(funcionariosCollection, uid);

    await setDoc(funcionarioRef, {
      nome: nome,
      email: email,
      cargo: "Administrativo", 
      dataCadastro: new Date().toISOString(),
    });

    alert(`Funcionário "${nome}" e conta de login criados com sucesso!`);
    
    // Limpar o formulário e fechar o modal
    setFormFuncionario({ nome: "", email: "", senha: "" });
    setShowModalFuncionario(false);

  } catch (error) {
    console.error(
      "ERRO ao cadastrar funcionário. Código: ",
      error.code,
      error.message
    );
    
    let mensagemErro = "ERRO ao salvar funcionário. Verifique o console (F12)!";
    if (error.code === 'auth/email-already-in-use') {
        mensagemErro = "O e-mail fornecido já está em uso por outra conta.";
    } else if (error.code === 'auth/weak-password') {
        mensagemErro = "A senha deve ter pelo menos 6 caracteres.";
    }

    alert(mensagemErro);
  }
};

  // FUNÇÃO PARA EXCLUIR FUNCIONÁRIO DO FIRESTORE
  const handleDeleteFuncionario = async (id, email) => {
    if (window.confirm(`Tem certeza que deseja excluir o funcionário ${email} da lista? Isso não remove a conta de login do Firebase Auth.`)) {
      try {
        await deleteDoc(doc(db, 'funcionarios', id));
        alert(`Funcionário ${email} excluído da lista.`);
      } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        alert("Erro ao excluir funcionário.");
      }
    }
  };

  // FUNÇÃO PARA VISUALIZAR CARTEIRINHA DE VACINAÇÃO
  const handleViewCarteirinha = (paciente) => {
    setPacienteEmDetalhe(paciente); // Define qual paciente ver
    setShowModalDetalhesVacinas(true); // Abre o modal
  };

  const handleSaveVacina = async () => {
    if (!formVacina.pacienteId || !formVacina.dataVacina || !formVacina.vacina) {
            alert("Por favor, selecione o Paciente, a Data e o nome da Vacina.");
            return;
        }

        // Busca o nome do paciente para salvar no registro
        const pacienteSelecionado = pacientes.find(p => p.id === formVacina.pacienteId);
        const nomePaciente = pacienteSelecionado ? pacienteSelecionado.nome : 'Paciente Desconhecido';
        
        try {
            // 🚨 ATENÇÃO: Usei 'agendamentosCollection' como PLACEHOLDER. 
            // Você deve importar e usar a coleção correta para Vacinas (Ex: 'vacinasCollection').
            await addDoc(vacinasCollection, { 
                pacienteId: formVacina.pacienteId,
                dataVacina: formVacina.dataVacina, 
                vacina: formVacina.vacina,
                dataRegistro: new Date().toISOString(), 
            });

            alert(`Vacina "${formVacina.vacina}" registrada para ${nomePaciente} com sucesso!`);
            setFormVacina({ pacienteId: '', dataVacina: '', vacina: '' });
            setShowModalVacina(false);
            
        } catch (error) {
            console.error("ERRO ao registrar vacina:", error);
            alert("ERRO ao registrar vacina. Verifique o console (F12)!");
        }
    }

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
                      <div style={styles.actionsCell}> 
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
                    <td style={styles.td}><div style={styles.medicoCell}><img src={item.imagem} alt={item.nome} style={styles.tdImage} />{item.nome}</div></td> 
                    <td style={styles.td}>{item.especialidade}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}> 
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
                  <div style={styles.agendaTime}>{a.hora}</div> 
                  <div style={styles.agendaInfo}> 
                    <strong>Consulta - {a.medico}</strong>
                    <div style={{fontSize: '0.9em', color: '#666'}}>Paciente: {a.paciente}</div> 
                  </div>
                  <div style={styles.agendaActions}> 
                    <button style={styles.btnIcon} onClick={() => handleEdit(a.id, 'Agendamentos')}>✏️ Editar</button>
                  </div>
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
                    <td style={styles.td}>{item.nome}</td>
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

      case "Carteirinha":
        return (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Carteirinha de Vacinação</h3>
            <button style={styles.btnPrimary} onClick={() => setShowModalVacina(true)}>+ Adicionar Vacina</button>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Qtd. Vacinas</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {carteirinhaAgrupada.map((item) => ( 
                  <tr key={item.id}>
                    <td style={styles.td}>{item.nome}</td>
                    <td style={styles.td}>{item.totalVacinas}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}>
                        <button style={styles.btnIcon} onClick={() => handleViewCarteirinha(item)}>👁️ Ver</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      // CASE PARA FUNCIONÁRIOS
      case "Funcionários":
        return (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Gestão de Funcionários</h3>
            <button 
                style={styles.btnPrimary} 
                onClick={() => setShowModalFuncionario(true)}
            >
                + Cadastrar Novo Funcionário
            </button>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Nome</th><th style={styles.th}>Email</th><th style={styles.th}>Data Cadastro</th><th style={styles.th}>Ações</th></tr></thead>
              <tbody>
                {funcionarios.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.nome}</td>
                    <td style={styles.td}>{item.email}</td>
                    <td style={styles.td}>{new Date(item.dataCadastro).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}>
                        <button style={styles.btnIcon} onClick={() => handleEdit(item.id, 'Funcionários')}>✏️ Editar</button>
                        <button style={{...styles.btnIcon, color: '#e57373'}} onClick={() => handleDeleteFuncionario(item.id, item.email)}>🗑️ Excluir</button>
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
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}> 
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

      case "Logout":
        return (sair());  

      default: return <div style={styles.card}><h1>Página não encontrada</h1></div>;
    }
    
  };

  // ------------------------------------------------------------------
  // RETORNO PRINCIPAL DO JSX
  // ------------------------------------------------------------------
const [user, setUser] = useState(null);
if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }
  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={styles.logo}>CLÍNICA</div>
          <div style={{fontSize: '13px', color: '#777'}}>Gestão Médica</div>
        </div>
        <nav>
          {["Dashboard", "Pacientes", "Agendamentos", "Médicos", "Funcionários", "Especialidades", "Carteirinha", "Relatórios","Logout"].map(item => ( 
            <button key={item} style={activePage === item ? {...styles.navItem, ...styles.navItemActive} : styles.navItem} onClick={() => setActivePage(item)}>
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main style={styles.main}>
        <header style={styles.topbar}>
        </header>
        <section style={styles.content}>{renderPage()}</section>
      </main>

      {/* --- MODAL DE NOVO PACIENTE --- */}
      {showModalPaciente && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.cardTitle}>Cadastrar Novo Paciente</h3>
            {/* ... Conteúdo do formulário Paciente ... */}
            <div style={styles.formGroup}><label style={styles.label}>Nome Completo:</label><input type="text" name="nome" value={formPaciente.nome} onChange={handleInputChange} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>CPF:</label><input type="text" name="cpf" value={formPaciente.cpf} onChange={handleInputChange} style={styles.input} placeholder="123.456.789-00"/></div>
            <div style={styles.formGroup}><label style={styles.label}>Data de Nascimento:</label><input type="date" name="dataNasc" value={formPaciente.dataNasc} onChange={handleInputChange} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Convênio (Opcional):</label><input type="text" name="convenio" value={formPaciente.convenio} onChange={handleInputChange} style={styles.input} /></div>
            <div style={styles.modalActions}>
              <button style={styles.btnPrimary} onClick={handleSavePaciente}>Salvar Paciente</button>
              <button style={{...styles.btnSecondary}} onClick={() => setShowModalPaciente(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      
      {/* --- MODAL DE NOVO MÉDICO --- */}
      {showModalMedico && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.cardTitle}>Cadastrar Novo Médico</h3>
            {/* ... Conteúdo do formulário Médico ... */}
            <div style={styles.formGroup}><label style={styles.label}>Nome Completo:</label><input type="text" name="nome" value={formMedico.nome} onChange={handleInputChangeMedico} style={styles.input} /></div>
            <div style={styles.formGroup}><label style={styles.label}>Especialidade:</label><input type="text" name="especialidade" value={formMedico.especialidade} onChange={handleInputChangeMedico} style={styles.input} placeholder="Ex: Cardiologia, Pediatria"/></div>
            <div style={styles.formGroup}><label style={styles.label}>Horário de Trabalho:</label><input type="text" name="horario" value={formMedico.horario} onChange={handleInputChangeMedico} style={styles.input} placeholder="Ex: 08:00-17:00"/></div>
            <div style={styles.formGroup}><label style={styles.label}>URL da Imagem (Opcional):</label><input type="text" name="imagem" value={formMedico.imagem} onChange={handleInputChangeMedico} style={styles.input} placeholder="URL de uma foto do médico"/></div>
            <div style={styles.modalActions}>
              <button style={styles.btnPrimary} onClick={handleSaveMedico}>Salvar Médico</button>
              <button style={styles.btnSecondary} onClick={() => setShowModalMedico(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL DE NOVO FUNCIONÁRIO */}
      {showModalFuncionario && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.cardTitle}>Cadastrar Novo Funcionário (Usuário de Acesso)</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome Completo:</label>
              <input 
                type="text" 
                name="nome" 
                value={formFuncionario.nome} 
                onChange={handleInputChangeFuncionario} 
                style={styles.input} 
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email (Login):</label>
              <input 
                type="email" 
                name="email" 
                value={formFuncionario.email} 
                onChange={handleInputChangeFuncionario} 
                style={styles.input} 
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Senha (mínimo 6 caracteres):</label>
              <input 
                type="password" 
                name="senha" 
                value={formFuncionario.senha} 
                onChange={handleInputChangeFuncionario} 
                style={styles.input} 
                required
                minLength="6"
              />
            </div>
            
            <div style={styles.modalActions}>
              <button style={styles.btnPrimary} onClick={handleSaveFuncionario}>Cadastrar</button>
              <button style={styles.btnSecondary} onClick={() => setShowModalFuncionario(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE NOVA VACINA --- */}
      {showModalVacina && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.cardTitle}>Adicionar Nova Vacina</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Paciente:</label>
              <select
                name="pacienteId"
                value={formVacina.pacienteId}
                onChange={handleInputChangeVacina}
                style={styles.input}
              >
                <option value="">Selecione um paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nome} — {paciente.cpf}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data de Vacinação:</label>
              <input type="date" name="dataVacina" value={formVacina.dataVacina} onChange={handleInputChangeVacina} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Vacina:</label>
              <input type="text" name="vacina" value={formVacina.vacina} onChange={handleInputChangeVacina} style={styles.input} />
            </div>
            <div style={styles.modalActions}>
              <button style={styles.btnPrimary} onClick={handleSaveVacina}>Adicionar Vacina</button>
              <button style={{...styles.btnSecondary}} onClick={() => setShowModalVacina(false)}>Cancelar</button> 
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALHES DA CARTEIRINHA DE VACINAÇÃO --- */}
      {showModalDetalhesVacinas && pacienteEmDetalhe && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, maxWidth: '600px'}}> {/* Ajuste de largura */}
            <h3 style={styles.cardTitle}>Carteirinha de: {pacienteEmDetalhe.nome}</h3>
            <p style={{marginBottom: '20px', fontSize: '0.9em', color: '#666'}}>
              Total de Vacinas Registradas: <strong>{pacienteEmDetalhe.totalVacinas}</strong>
            </p>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Vacina</th>
                  <th style={styles.th}>Data de Vacinação</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacienteEmDetalhe.detalhes.map((vacina) => (
                  <tr key={vacina.idVac}>
                    <td style={styles.td}>{vacina.vacina}</td>
                    <td style={styles.td}>{vacina.data}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsCell}>
                        {/* Funções de Editar/Excluir (implementar) */}
                        <button style={styles.btnIcon} onClick={() => alert(`Editar Vacina ${vacina.idVac}`)}>✏️ Editar</button>
                        <button style={{...styles.btnIcon, color: '#e57373'}} onClick={() => alert(`Excluir Vacina ${vacina.idVac}`)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.modalActions}>
              <button style={styles.btnSecondary} onClick={() => setShowModalDetalhesVacinas(false)}>Fechar</button>
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
  navItem: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#333',
    padding: '12px 18px',
    textAlign: 'left',
    width: '100%',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'background 0.3s',
  },  
  navItemActive: {
    backgroundColor: '#b6e7ea', 
    fontWeight: 'bold',
    border: '1px solid #b6e7ea',
    borderRadius: '12px',
  },
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

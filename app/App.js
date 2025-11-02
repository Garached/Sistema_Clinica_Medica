import { signOut, createUserWithEmailAndPassword } from "firebase/auth";
  import { addDoc, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, setDoc, collection} from 'firebase/firestore';
  import { useEffect, useState } from 'react';
  import {
    auth,
    db,
    funcionariosCollection,
    medicosCollection,
    pacientesCollection,
    vacinasCollection,
    agendamentosCollection
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
    const [agendamentos, setAgendamentos] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [vacinas, setVacinas] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [carteirinhaAgrupada, setCarteirinhaAgrupada] = useState([]);
    const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);
    const [especialidades, setEspecialidades] = useState([]);

    const [showModalPaciente, setShowModalPaciente] = useState(false);
    const [showModalAgendamento, setShowModalAgendamento] = useState(false);
    const [showModalMedico, setShowModalMedico] = useState(false);
    const [showModalVacina, setShowModalVacina] = useState(false);
    const [showModalFuncionario, setShowModalFuncionario] = useState(false);
    const [showModalDetalhesVacinas, setShowModalDetalhesVacinas] = useState(false);
    const [pacienteEmDetalhe, setPacienteEmDetalhe] = useState(null);
    const [medicoEmEdicao, setMedicoEmEdicao] = useState(null);
    const [vacinaEmEdicao, setVacinaEmEdicao] = useState(null);
    const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState(null);

    // --- estado e helpers para a tela de Relatórios ---
    const [mesAtual, setMesAtual] = useState(new Date().getMonth());
    const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

    const meses = [
      "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
      "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
    ];

    // Função para avançar/voltar mês (garante troca de ano quando necessário)
    const mudarMes = (delta) => {
      setMesAtual(prevMes => {
        let novoMes = prevMes + delta;
        let novoAno = anoAtual;
        if (novoMes < 0) { novoMes = 11; novoAno = anoAtual - 1; }
        if (novoMes > 11) { novoMes = 0; novoAno = anoAtual + 1; }
        setAnoAtual(novoAno);
        return novoMes;
      });
    };

    // Filtra agendamentos do mês atual e enriquece com medico/paciente
    const agendamentosMes = agendamentos
      .filter(a => {
        if (!a.data) return false;
        // aceita strings em ISO 'YYYY-MM-DD' ou Date-like
        const d = new Date(a.data);
        if (isNaN(d)) return false;
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      })
      .map(a => ({
        ...a,
        medico: medicos.find(m => m.id === a.medicoId) || { especialidade: "Não definido", nome: "Médico" },
        paciente: pacientes.find(p => p.id === a.pacienteId) || { convenio: "Particular", nome: "Paciente" },
      }));

    // Agrupa consultas por especialidade
    const consultasPorEspecialidade = agendamentosMes.reduce((acc, a) => {
      const esp = (a.medico && a.medico.especialidade) ? a.medico.especialidade : "Não definido";
      acc[esp] = (acc[esp] || 0) + 1;
      return acc;
    }, {});

    // Agrupa consultas por convênio (para faturamento)
    const consultasPorConvenio = agendamentosMes.reduce((acc, a) => {
      const conv = (a.paciente && a.paciente.convenio) ? a.paciente.convenio : "Particular";
      acc[conv] = (acc[conv] || 0) + 1;
      return acc;
    }, {});

    // Pacientes novos no mês: usa dataCadastro (corrigido)
    const pacientesMes = pacientes.filter(p => {
      const dataCad = p.dataCadastro || p.dataRegistro || p.createdAt || null;
      if (!dataCad) return false;
      const d = new Date(dataCad);
      if (isNaN(d)) return false;
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    // Agrupa novos pacientes por convênio
    const pacientesPorConvenio = pacientesMes.reduce((acc, p) => {
      const conv = p.convenio || "Particular";
      acc[conv] = (acc[conv] || 0) + 1;
      return acc;
    }, {});

    // Faturamento estimado
    const valorConsulta = 50;
    const faturamentoTotal = agendamentosMes.length * valorConsulta;


    const [formPaciente, setFormPaciente] = useState({ nome: '', cpf: '', dataNasc: '', convenio: '' });
    const [formAgendamento, setFormAgendamento] = useState({medicoId: '',pacienteId: '',data: '',hora: '',especialidade: '',});
    const [formMedico, setFormMedico] = useState({ nome: '', especialidade: '', horario: '', imagem: '' });
    const [formVacina, setFormVacina] = useState({ pacienteId: '', dataVacina: '', vacina: '' });
    const [formFuncionario, setFormFuncionario] = useState({ nome: '', email: '', senha: '' });

    // Funções de manipulação e exclusão... (Mantidas as suas originais e as novas de Funcionário)

    const handleEdit = (id, tipo) => {
      // alert(`Ação: EDITAR item ${id} da categoria ${tipo} (implementar)`); // Linha original

      if (tipo === 'Médicos') {
          // Encontra o objeto médico completo pelo ID
          const medicoParaEditar = medicos.find(m => m.id === id); 
          if (medicoParaEditar) {
              handleEditMedico(medicoParaEditar); // Chama a função específica de edição
          } else {
              alert("Médico não encontrado para edição.");
          }
      } else {
          // Implementar lógica para outros tipos (Pacientes, Funcionários, etc.)
          alert(`Ação: EDITAR item ${id} da categoria ${tipo} (implementar)`);
      }
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

    const handleInputChangeAgendamento = (e) => {
      const { name, value } = e.target;
      setFormAgendamento(prev => ({ ...prev, [name]: value }));
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

    useEffect(() => {
      const q = query(vacinasCollection, orderBy("dataVacina", "desc")); // Ordena pela data da vacina
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const vacinasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVacinas(vacinasData); 
      }, (error) => {
        console.error("Erro ao carregar vacinas: ", error);
      });

      return () => unsubscribe();
    }, []);

    useEffect(() => {
      const q = query(agendamentosCollection, orderBy("data", "asc"), orderBy("hora", "asc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const agendamentosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAgendamentos(agendamentosData);

      }, (error) => {
        console.error("Erro ao carregar agendamentos: ", error);
      });

      return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (pacientes.length === 0 || vacinas.length === 0) {
        if (pacientes.length > 0) {
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

    const handleEditFuncionario = (funcionario) => {
      setFuncionarioEmEdicao(funcionario);
      setFormFuncionario({
        nome: funcionario.nome || "",
        email: funcionario.email || "",
        senha: funcionario.senha || "",
      });
      setShowModalFuncionario(true);
    };

      // DELETAR MÉDICO
    const handleDeleteMedico = async (medicoId, medicoNome) => {
      if (window.confirm(`Tem certeza que deseja EXCLUIR o(a) médico(a) ${medicoNome}?`)) {
        try {
          await deleteDoc(doc(db, 'medicos', medicoId));
          alert(`Médico(a) ${medicoNome} excluído(a) com sucesso!`);
        } catch (error) {
          console.error("Erro ao excluir médico:", error);
          alert("Erro ao excluir médico. Verifique o console (F12)!");
        }
      }
    };

    // EDITAR 
    const handleEditMedico = (medico) => {
      setMedicoEmEdicao(medico); 
      setFormMedico({
        nome: medico.nome,
        especialidade: medico.especialidade,
        horario: medico.horario,
        imagem: medico.imagem || '',
      });
      setShowModalMedico(true); 
    };

    // SALVAR OU ATUALIZAR 
    const handleSaveOrUpdateMedico = async () => {
      if (!formMedico.nome || !formMedico.especialidade || !formMedico.horario) {
        alert("Por favor, preencha Nome, Especialidade e Horário de trabalho.");
        return;
      }

      const dadosMedico = {
        nome: formMedico.nome,
        especialidade: formMedico.especialidade,
        horario: formMedico.horario,
        imagem: formMedico.imagem || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?fit=crop&w=50",
      };

      try {
        if (medicoEmEdicao) {
          const medicoRef = doc(db, 'medicos', medicoEmEdicao.id);
          await updateDoc(medicoRef, {
            ...dadosMedico,
            dataAtualizacao: new Date().toISOString(),
          });
          alert(`Médico(a) "${formMedico.nome}" atualizado(a) com sucesso!`);
        } else {
          await addDoc(medicosCollection, {
            ...dadosMedico,
            dataCadastro: new Date().toISOString(),
          });
          alert(`Médico(a) "${formMedico.nome}" salvo com sucesso!`);
        }

        setFormMedico({ nome: "", especialidade: "", horario: "", imagem: "" });
        setMedicoEmEdicao(null);
        setShowModalMedico(false);

      } catch (error) {
        console.error("ERRO ao salvar/atualizar médico:", error);
        alert("ERRO ao salvar/atualizar médico. Verifique o console (F12)!");
      }
    };

    // SALVAR DADOS
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

  // SALVAR AGENDAMENTOS
  const handleSaveAgendamento = async () => {
    const { medicoId, pacienteId, data, hora } = formAgendamento;

    if (!medicoId || !pacienteId || !data || !hora) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const medico = medicos.find(m => m.id === medicoId);
    if (!medico) {
      alert("Médico inválido.");
      return;
    }

    const [horaInicio, horaFim] = medico.horario.split(" - ").map(h => {
      const [hStr, mStr] = h.split(":");
      return { h: Number(hStr), m: Number(mStr) };
    });
    const [horaInt, minutoInt] = hora.split(":").map(Number);
    const horaTotal = horaInt * 60 + minutoInt;
    const inicioTotal = horaInicio.h * 60 + horaInicio.m;
    const fimTotal = horaFim.h * 60 + horaFim.m;
    if (horaTotal < inicioTotal || horaTotal > fimTotal) {
      alert(`O horário deve estar dentro do expediente do médico: ${medico.horario}`);
      return;
    }

    try {
      if (agendamentoEmEdicao) {
        await updateDoc(doc(db, 'agendamentos', agendamentoEmEdicao.id), {
          medicoId,
          pacienteId,
          data,
          hora,
          status: "aguardando"
        });
        alert("Agendamento atualizado com sucesso!");
        setAgendamentos(prev =>
          prev.map(a => a.id === agendamentoEmEdicao.id ? { ...a, medicoId, pacienteId, data, hora } : a)
        );
        setAgendamentoEmEdicao(null); 
      } else {
        const docRef = await addDoc(agendamentosCollection, {
          medicoId,
          pacienteId,
          data,
          hora,
          dataRegistro: new Date().toISOString(),
          status: "aguardando"
        });
        alert("Consulta agendada com sucesso!");
        setAgendamentos(prev => [...prev, { id: docRef.id, medicoId, pacienteId, data, hora }]);
      }

      setFormAgendamento({
        medicoId: "",
        pacienteId: "",
        data: "",
        hora: "",
        especialidade: ""
      });
      setShowModalAgendamento(false);

    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Erro ao salvar agendamento. Verifique o console (F12).");
    }
  };


  // EDITAR PAGAMENTO
  const handleEditAgendamento = (agendamento) => {
    setAgendamentoEmEdicao(agendamento); 
    setFormAgendamento({
      medicoId: agendamento.medicoId,
      pacienteId: agendamento.pacienteId,
      data: agendamento.data,
      hora: agendamento.hora,
      especialidade: agendamento.medico?.especialidade || ""
    });
    setShowModalAgendamento(true); 
  };

  // DELETAR 
  const handleDeleteAgendamento = async (agendamentoId, pacienteNome) => {
    if (window.confirm(`Tem certeza que deseja excluir a consulta de "${pacienteNome}"?`)) {
      try {
        await deleteDoc(doc(db, 'agendamentos', agendamentoId));
        alert("Agendamento excluído com sucesso!");
        setAgendamentos(prev => prev.filter(a => a.id !== agendamentoId));
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        alert("Erro ao excluir agendamento. Verifique o console (F12).");
      }
    }
  };

  // SALVAR FUNCIONÁRIOS
  const handleSaveFuncionario = async () => {
    try {
      if (!formFuncionario.nome || !formFuncionario.email || !formFuncionario.senha) {
        alert("Preencha todos os campos!");
        return;
      }

      if (formFuncionario.senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      if (!/\S+@\S+\.\S+/.test(formFuncionario.email)) {
        alert("Por favor, insira um email válido.");
        return;
      }
      
      const dadosFuncionario = {
          nome: formFuncionario.nome,
          email: formFuncionario.email,
          senha: formFuncionario.senha, 
      };


      if (funcionarioEmEdicao) {
        const ref = doc(db, "funcionarios", funcionarioEmEdicao.id);
        await updateDoc(ref, {
          ...dadosFuncionario,
          dataAtualizacao: new Date().toISOString(), 
        });
        alert(`Funcionário "${formFuncionario.nome}" atualizado!`);
      } else {
        await addDoc(funcionariosCollection, { 
            ...dadosFuncionario,
            dataCadastro: new Date().toISOString(), 
        });
        alert(`Funcionário "${formFuncionario.nome}" cadastrado!`);
      }

      setShowModalFuncionario(false);
      setFuncionarioEmEdicao(null);
      setFormFuncionario({ nome: "", email: "", senha: "" });
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      alert("Erro ao salvar funcionário. Veja o console.");
    }
  };

    // EXCLUIR FUNCIONARIO
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

    // VISUALIZA CARTEIRINHA DE VACINAÇÃO
    const handleViewCarteirinha = (paciente) => {
      setPacienteEmDetalhe(paciente); 
      setShowModalDetalhesVacinas(true); 
    };

    const handleSaveVacina = async () => {
      if (!formVacina.pacienteId || !formVacina.dataVacina || !formVacina.vacina) {
        alert("Por favor, selecione o Paciente, a Data e o nome da Vacina.");
        return;
      }

      try {
        if (vacinaEmEdicao) {
          const vacinaRef = doc(db, 'vacinas', vacinaEmEdicao.id);
          await updateDoc(vacinaRef, {
            pacienteId: formVacina.pacienteId,
            dataVacina: formVacina.dataVacina,
            vacina: formVacina.vacina,
            dataAtualizacao: new Date().toISOString(),
          });
          alert(`Vacina "${formVacina.vacina}" atualizada com sucesso!`);
        } else {
          await addDoc(vacinasCollection, {
            pacienteId: formVacina.pacienteId,
            dataVacina: formVacina.dataVacina,
            vacina: formVacina.vacina,
            dataRegistro: new Date().toISOString(),
          });
          alert(`Vacina "${formVacina.vacina}" registrada com sucesso!`);
        }

        setFormVacina({ pacienteId: '', dataVacina: '', vacina: '' });
        setVacinaEmEdicao(null);
        setShowModalVacina(false);

      } catch (error) {
        console.error("ERRO ao salvar/atualizar vacina:", error);
        alert("Erro ao salvar ou atualizar vacina. Veja o console (F12).");
      }
    };

    const handleEditVacina = (vacina) => {
      setVacinaEmEdicao(vacina); 
      setFormVacina({
        pacienteId: vacina.pacienteId,
        dataVacina: vacina.dataVacina,
        vacina: vacina.vacina
      });
      setShowModalVacina(true); 
    };

    const handleDeleteVacina = async (vacinaId, vacinaNome) => {
      if (window.confirm(`Tem certeza que deseja excluir a vacina "${vacinaNome}"?`)) {
        try {
          await deleteDoc(doc(db, 'vacinas', vacinaId));
          alert(`Vacina "${vacinaNome}" excluída com sucesso!`);
          setVacinas((prev) => prev.filter(v => v.id !== vacinaId));
        } catch (error) {
          console.error("Erro ao excluir vacina:", error);
          alert("Erro ao excluir vacina. Verifique o console (F12).");
        }
      }
    };

    // PAGINAS
    const renderPage = () => {
      const hojeStr = new Date().toISOString().slice(0, 10);

      const agendamentosCompletos = agendamentos.map(a => ({
        ...a,
        medico: medicos.find(m => m.id === a.medicoId) || { nome: "Médico", especialidade: "Especialidade" },
        paciente: pacientes.find(p => p.id === a.pacienteId) || { nome: "Paciente" },
      }));

      const agendamentosHoje = agendamentosCompletos.filter(a => a.data === hojeStr);
      const agendamentosFuturos = agendamentosCompletos.filter(a => a.data > hojeStr);

      switch (activePage) {
        case "Dashboard":
          return (
            <section style={styles.dashboardGrid}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Agendamentos Hoje</h3>
                <div style={styles.kpi}>{agendamentosHoje.length}</div>
                <small>Consultas futuras: {agendamentosFuturos.length}</small>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Pacientes</h3>
                <div style={styles.kpi}>{pacientes.length}</div>
                <small>Total cadastrado</small>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Receita (mês)</h3>
                <div style={styles.kpi}>R$ 68.340</div>
                <small>Exemplo</small>
              </div>
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
              <button 
                  style={styles.btnPrimary} 
                  onClick={() => {
                      setMedicoEmEdicao(null); 
                      setFormMedico({ nome: "", especialidade: "", horario: "", imagem: "" });
                      setShowModalMedico(true);
                  }}
              >
                  + Novo Médico
              </button>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Médico</th><th style={styles.th}>Especialidade</th><th style={styles.th}>Ações</th></tr></thead>
                <tbody>
                  {medicos.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}><div style={styles.medicoCell}><img src={item.imagem} alt={item.nome} style={styles.tdImage} />{item.nome}</div></td> 
                      <td style={styles.td}>{item.especialidade}</td>
                      <td style={styles.td}>
                        <div style={styles.actionsCell}> 
                          {/* CHAMA handleEdit (que chama handleEditMedico se for 'Médicos') */}
                          <button 
                              style={styles.btnIcon} 
                              onClick={() => handleEdit(item.id, 'Médicos')}
                          >
                              ✏️ Editar
                          </button>
                          
                          {/* CHAMA handleDeleteMedico (a função do Firestore) */}
                          <button 
                              style={{...styles.btnIcon, color: '#e57373'}} 
                              onClick={() => handleDeleteMedico(item.id, item.nome)}
                          >
                              🗑️ Excluir
                          </button>
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

              <button style={styles.btnPrimary} onClick={() => setShowModalAgendamento(true)}>
                + Agendar Consulta
              </button>

              {/* --- CONSULTAS DE HOJE --- */}
              <h4 style={{ marginTop: 20 }}>Consultas de Hoje</h4>
              {agendamentosHoje.length === 0 ? (
                <p>Nenhuma consulta agendada para hoje.</p>
              ) : (
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {agendamentosHoje.map((a) => (
                    <li key={a.id} style={styles.agendaItem}>
                      <div style={styles.agendaTime}>{a.hora}</div>
                      <div style={styles.agendaInfo}>
                        <strong>
                          Consulta - {a.medico.nome} ({a.medico.especialidade})
                        </strong>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          Paciente: {a.paciente.nome}
                        </div>
                      </div>
                      <div style={styles.agendaActions}>
                        <button style={styles.btnIcon} onClick={() => handleEditAgendamento(a)}>✏️ Editar</button>
                        <button style={{ ...styles.btnIcon, color: '#e57373' }} onClick={() => handleDeleteAgendamento(a.id, a.paciente.nome)}>🗑️ Excluir</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* --- CONSULTAS FUTURAS --- */}
              <h4 style={{ marginTop: 20 }}>Consultas Futuras</h4>
              {agendamentosFuturos.length === 0 ? (
                <p>Nenhuma consulta futura.</p>
              ) : (
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {agendamentosFuturos.map((a) => (
                    <li key={a.id} style={styles.agendaItem}>
                      <div style={styles.agendaTime}>{a.hora}</div>
                      <div style={styles.agendaInfo}>
                        <strong>
                          Consulta - {a.medico.nome} ({a.medico.especialidade})
                        </strong>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                          Paciente: {a.paciente.nome}
                        </div>
                      </div>
                      <div style={styles.agendaActions}>
                        <div style={{ fontSize: '0.8em', color: '#888' }}>{a.data}</div>
                        <button style={styles.btnIcon} onClick={() => handleEditAgendamento(a)}>✏️ Editar</button>
                        <button style={{ ...styles.btnIcon, color: '#e57373' }} onClick={() => handleDeleteAgendamento(a.id, a.paciente.nome)}>🗑️ Excluir</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
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
                          <button style={styles.btnIcon} onClick={() => handleEditFuncionario(item)}>✏️ Editar</button>
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
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Relatórios Gerenciais</h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <button style={styles.btnIcon} onClick={() => mudarMes(-1)}>⬅️</button>
          <h4 style={{ margin: 0 }}>{meses[mesAtual]} / {anoAtual}</h4>
          <button style={styles.btnIcon} onClick={() => mudarMes(1)}>➡️</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: 16 }}>

        {/* CARD 1 - CONSULTAS */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Consultas no mês</h4>
          <div style={styles.kpi}>{agendamentosMes.length}</div>
          <small>Por especialidade:</small>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
            {Object.keys(consultasPorEspecialidade).length === 0 ? (
              <li>Nenhuma consulta</li>
            ) : (
              Object.entries(consultasPorEspecialidade).map(([esp, qtd]) => (
                <li key={esp}>{esp}: {qtd}</li>
              ))
            )}
          </ul>
        </div>

        {/* CARD 2 - FATURAMENTO */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Rendimento Mensal Estimado</h4>
          <div style={styles.kpi}>R$ {faturamentoTotal.toLocaleString()}</div>
          <div style={{ marginTop: 8 }}>
            <small>Por convênio:</small>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 6 }}>
              {Object.keys(consultasPorConvenio).length === 0 ? (
                <li>—</li>
              ) : (
                Object.entries(consultasPorConvenio).map(([conv, qtd]) => (
                  <li key={conv}>{conv}: R$ {(qtd * valorConsulta).toLocaleString()}</li>
                ))
              )}
            </ul>
          </div>
          <small style={{fontSize: 13, fontStyle: "italic"}}>Obs.: isso é apenas uma estimativa caso cada consulta rendesse R$50,00</small>
        </div>

        {/* CARD 3 - NOVOS PACIENTES */}
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>Novos Pacientes</h4>
          <div style={styles.kpi}>{pacientesMes.length}</div>
          <small>Por convênio:</small>
          <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
            {Object.keys(pacientesPorConvenio).length === 0 ? (
              <li>Nenhum novo paciente</li>
            ) : (
              Object.entries(pacientesPorConvenio).map(([conv, qtd]) => (
                <li key={conv}>{conv}: {qtd}</li>
              ))
            )}
          </ul>
        </div>

      </div>
    </section>
  );


        case "Logout":
          return (sair());  

        default: return <div style={styles.card}><h1>Página não encontrada</h1></div>;
      }
      
    };

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
                    {/* O Título agora é dinâmico, baseado se medicoEmEdicao existe */}
                    <h3 style={styles.cardTitle}>{medicoEmEdicao ? 'Editar Médico' : 'Cadastrar Novo Médico'}</h3> 
                    
                    {/* ... Conteúdo do formulário Médico (mantido) ... */}
                    <div style={styles.formGroup}><label style={styles.label}>Nome Completo:</label><input type="text" name="nome" value={formMedico.nome} onChange={handleInputChangeMedico} style={styles.input} /></div>
                    <div style={styles.formGroup}><label style={styles.label}>Especialidade:</label><input type="text" name="especialidade" value={formMedico.especialidade} onChange={handleInputChangeMedico} style={styles.input} placeholder="Ex: Cardiologia, Pediatria"/></div>
                    <div style={styles.formGroup}><label style={styles.label}>Horário de Trabalho:</label><input type="text" name="horario" value={formMedico.horario} onChange={handleInputChangeMedico} style={styles.input} placeholder="Ex: 08:00-17:00"/></div>
                    <div style={styles.formGroup}><label style={styles.label}>URL da Imagem (Opcional):</label><input type="text" name="imagem" value={formMedico.imagem} onChange={handleInputChangeMedico} style={styles.input} placeholder="URL de uma foto do médico"/></div>
                    
                    <div style={styles.modalActions}>
                        {/* O onClick agora chama a função que SALVA OU ATUALIZA */}
                        <button style={styles.btnPrimary} onClick={handleSaveOrUpdateMedico}>
                            {/* O texto do botão também é dinâmico */}
                            {medicoEmEdicao ? 'Atualizar Médico' : 'Salvar Médico'}
                        </button>
                        
                        {/* Função de Cancelar/Fechar: Limpa o formulário e o estado de edição */}
                        <button 
                            style={styles.btnSecondary} 
                            onClick={() => {
                                setShowModalMedico(false);
                                setMedicoEmEdicao(null); 
                                setFormMedico({ nome: "", especialidade: "", horario: "", imagem: "" }); 
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL DE NOVO FUNCIONÁRIO */}
        {showModalFuncionario && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.cardTitle}>
              {funcionarioEmEdicao ? "Editar Funcionário" : "Cadastrar Novo Funcionário"}
            </h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nome:</label>
              <input
                type="text"
                name="nome"
                value={formFuncionario.nome}
                onChange={handleInputChangeFuncionario}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                name="email"
                value={formFuncionario.email}
                onChange={handleInputChangeFuncionario}
                style={styles.input}
                placeholder="email@clinica.com"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Senha:</label>
              <input
                type="password"
                name="senha"
                value={formFuncionario.senha}
                onChange={handleInputChangeFuncionario}
                style={styles.input}
                placeholder={funcionarioEmEdicao ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
              />
            </div>


            <div style={styles.modalActions}>
              <button style={styles.btnPrimary} onClick={handleSaveFuncionario}>
                  {funcionarioEmEdicao ? "Atualizar Funcionário" : "Salvar Funcionário"}
              </button>
              <button 
                  style={styles.btnSecondary} 
                  onClick={() => {
                      setShowModalFuncionario(false);
                      setFuncionarioEmEdicao(null);
                      setFormFuncionario({ nome: "", email: "", senha: "" });
                  }}
              >
                  Cancelar
              </button>
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
                <button style={styles.btnPrimary} onClick={handleSaveVacina}>Confirmar Vacina</button>
                <button style={{...styles.btnSecondary}} onClick={() => setShowModalVacina(false)}>Cancelar</button> 
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL CARTEIRINHA DE VACINAÇÃO --- */}
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
                          <button
                            style={styles.btnIcon}
                            onClick={() => {
                              const vacinaObj = vacinas.find(item => item.id === vacina.idVac);
                              if (vacinaObj) {
                                handleEditVacina(vacinaObj);
                                setShowModalDetalhesVacinas(false); // fecha a carteirinha ao abrir a edição
                              } else {
                                alert("Não foi possível carregar os dados completos da vacina.");
                              }
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                          style={{ ...styles.btnIcon, color: '#e57373' }}
                          onClick={() => handleDeleteVacina(vacina.idVac, vacina.vacina)}
                        >
                          🗑️ Excluir
                        </button>

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

        {/* --- MODAL DE AGENDAR CONSULTA --- */}
        {showModalAgendamento && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h3 style={styles.cardTitle}>Agendar Consulta</h3>

              {/* Selecionar Médico */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Médico:</label>
                <select
                  name="medicoId"
                  value={formAgendamento.medicoId}
                  onChange={handleInputChangeAgendamento}
                  style={styles.input}
                >
                  <option value="">Selecione um médico</option>
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} — {m.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selecionar Paciente */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Paciente:</label>
                <select
                  name="pacienteId"
                  value={formAgendamento.pacienteId}
                  onChange={handleInputChangeAgendamento}
                  style={styles.input}
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — {p.cpf}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data e Hora */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Data:</label>
                <input
                  type="date"
                  name="data"
                  min={new Date().toISOString().split("T")[0]} // bloqueia datas passadas
                  value={formAgendamento.data}
                  onChange={handleInputChangeAgendamento}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Hora:</label>
                <input
                  type="time"
                  name="hora"
                  step="1800"
                  value={formAgendamento.hora}
                  onChange={handleInputChangeAgendamento}
                  style={styles.input}
                />
                <small style={{ fontSize: 12, color: '#666' }}>
                  Horário disponível: {formAgendamento.medicoId 
                    ? medicos.find(m => m.id === formAgendamento.medicoId)?.horario 
                    : "?"}
                </small>
              </div>


              {/* Ações */}
              <div style={styles.modalActions}>
                <button style={styles.btnPrimary} onClick={handleSaveAgendamento}>
                  Confirmar Agendamento
                </button>
                <button style={styles.btnSecondary} onClick={() => setShowModalAgendamento(false)}>
                  Cancelar
                </button>
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

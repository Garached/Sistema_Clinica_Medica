# 🏥 Sistema de Clínica Médica

Este projeto é um **Sistema Interno de Gerenciamento de Clínica Médica**, desenvolvido como parte da disciplina de **Engenharia de Software**.  
O sistema foi projetado para uso exclusivo dos funcionários administrativos da clínica (como recepcionistas e equipe de gestão), permitindo gerenciar pacientes, consultas, médicos e especialidades.  

Os médicos e pacientes são considerados usuários secundários, pois não acessam o sistema diretamente — seus dados são gerenciados internamente pelos funcionários.

---

## 👥 Integrantes (Grupo 1)

- Gabriela Abi Rached Dantas  
- João Guilherme Faber  
- Leonardo Bezzi Elias  
- Murilo Brenneken Duarte Passarelli  
- Murilo Gonçalves Nascimento  
- Yasmin Marques Barros  

---

## 🎯 Visão do Produto

O software tem como objetivo centralizar e automatizar as operações internas da clínica, tornando o processo de agendamento, cadastro e controle de informações médicas mais ágil, confiável e eficiente.  

Com ele, a equipe pode:
- Cadastrar e editar pacientes e funcionários.  
- Agendar e gerenciar consultas médicas.  
- Visualizar relatórios mensais e estatísticas gerenciais.  
- Organizar especialidades e carteirinhas de vacinação de forma digital.  

---

## 💻 Stack Utilizada

- **Front-end:** React (JavaScript)  
- **Back-end / Banco de Dados:** Firebase  
  - Firestore (banco de dados em nuvem)  
  - Firebase Authentication (controle de acesso por e-mail/senha)  

---

## 🚀 Como Executar Localmente

Antes de tudo, **certifique-se de ter o [Node.js](https://nodejs.org/) instalado** em seu computador.

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Garached/Sistema_Clinica_Medica.git
   cd Sistema_Clinica_Medica
   ```

2. **Instalar as dependências do projeto:**
   ```bash
   npm install
   ```

3. **Iniciar o projeto:**
   ```bash
   npm start
   ```
   O sistema estará disponível em **http://localhost:3000**

---

## 📦 MVP — Entrega da Sprint 1

A **Sprint 1** teve como objetivo implementar o núcleo funcional do sistema, garantindo o fluxo completo de cadastro de pacientes, funcionários, médicos, consultas e especialidades, além de uma interface de relatórios e carteirinha digital.  

### 🔹 **RF01 – Gerenciar Pacientes**
- Cadastro, edição e exclusão de pacientes.  
- Validação de campos obrigatórios (nome completo, CPF, data de nascimento, convênio etc.).  
- Listagem de todos os pacientes com suas informações principais.  
- Ligação com o módulo de agendamento (para relacionar consultas ao paciente).  

### 🔹 **RF02 – Gerenciar Consultas**
- Agendamento de novas consultas, com seleção de médico e paciente.  
- Edição e cancelamento de consultas já criadas.  
- Divisão visual entre **consultas do dia** e **consultas futuras**.  
- Notificações automáticas internas (atualização dinâmica em tempo real no painel).  

### 🔹 **RF05 – Gerenciar Especialidades Médicas**
- Listagem de especialidades cadastradas (ex: Cardiologia, Ortopedia).  
- Associação automática de médicos a cada especialidade.  
- Interface simples e acessível para consulta das áreas médicas disponíveis.  

### 🔹 **RF06 – Gerenciar Funcionários**
- Cadastro e edição de funcionários administrativos (com nome, e-mail e data de cadastro).  
- Controle de permissões de acesso via **Firebase Authentication**.  
- Remoção de funcionários inativos.

### 🔹 **RF21 – Dashboard e Relatórios Gerenciais**
- Painel principal com indicadores do dia:  
  - Total de consultas agendadas para hoje.  
  - Número de pacientes cadastrados.  
  - Receita mensal estimada.  
- Tela de relatórios por **mês/ano**, com:
  - Consultas realizadas (por especialidade).  
  - Rendimento mensal estimado.  
  - Novos pacientes cadastrados no mês.  

### 🔹 **Carteirinha de Vacinação Digital (Funcionalidade Inovadora)**
- Agrupamento das vacinas por paciente em uma única tela.  
- Cadastro de novas vacinas associadas ao paciente.  
- Visualização rápida da quantidade de vacinas por pessoa.  
- Objetivo: digitalizar e unificar carteirinhas físicas em um sistema único.  

---

## 🧭 Estrutura do Sistema

O sistema é dividido nas seguintes páginas principais:

| Página | Descrição |
|--------|------------|
| **Dashboard** | Visão geral da clínica, com KPIs de consultas, pacientes e receita. |
| **Pacientes** | Gerenciamento completo de cadastros de pacientes. |
| **Médicos** | Controle de médicos e suas especialidades. |
| **Agendamentos** | Criação, edição e cancelamento de consultas. |
| **Especialidades** | Lista das especialidades e quantidade de médicos em cada uma. |
| **Carteirinha** | Controle de vacinas dos pacientes. |
| **Funcionários** | Administração dos usuários internos do sistema. |
| **Relatórios** | Painel gerencial com estatísticas mensais e comparativos. |

---

## 🧩 Observações Finais

O sistema foi desenvolvido com foco em usabilidade e simplicidade, mantendo a interface intuitiva para uso cotidiano da equipe da clínica.  
Com o avanço das próximas sprints, serão incluídas novas funcionalidades como:
- Exportação de relatórios em PDF.  
- Envio de lembretes automáticos de consulta por e-mail ou WhatsApp.  
- Dashboards comparativos entre meses.

---

📅 **Versão:** Sprint 1  
📍 **Status:** MVP funcional entregue  
🧠 **Disciplina:** Engenharia de Software — 2025


# Projeto: Sistema de Clínica Médica

Este projeto é um Sistema de Gerenciamento de Clínica Médica, desenvolvido como parte da disciplina de Engenharia de Software. O objetivo é centralizar as operações da clínica, como agendamentos e atendimento, tornando o processo mais ágil, eficiente e seguro .

## 👥 Integrantes (Grupo 1) 

* Gabriela Abi Rached Dantas 
* João Guilherme Faber 
* Leonardo Bezzi Elias 
* Murilo Brenneken Duarte Passarelli 
* Murilo Gonçalves Nascimento 
* Yasmin Marques Barros 

## 🎯 Visão do Produto

O software visa acolher a necessidade tanto dos doutores quanto dos pacientes de ter um meio fácil, simples e confiável para realizar suas necessidades, envolvendo nosso objetivo principal: o agendamento e o atendimento em uma clínica médica .

## 💻 Stack Definida

* **Front-end:** React (com JavaScript)
* **Back-end / Banco de Dados:** Firebase (utilizando Firestore e Firebase Authentication)

## 🚀 Como Executar Localmente

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local:

1.  **Clonar o repositório:**
    ```bash
    git clone [URL-DO-SEU-REPOSITORIO-AQUI]
    cd [NOME-DA-PASTA-DO-PROJETO]
    ```

2.  **Instalar dependências (Front-end):**
    ```bash
    npm install
    ```

3.  **Configurar Variáveis de Ambiente (.env):**
    * Crie um arquivo `.env` na raiz do projeto.
    * Adicione as chaves de configuração do seu projeto Firebase. Você pode encontrá-las no console do Firebase em "Configurações do projeto".

    ```
    REACT_APP_FIREBASE_API_KEY="SUA_API_KEY"
    REACT_APP_FIREBASE_AUTH_DOMAIN="SEU_AUTH_DOMAIN"
    REACT_APP_FIREBASE_PROJECT_ID="SEU_PROJECT_ID"
    REACT_APP_FIREBASE_STORAGE_BUCKET="SEU_STORAGE_BUCKET"
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID="SEU_SENDER_ID"
    REACT_APP_FIREBASE_APP_ID="SEU_APP_ID"
    ```

4.  **Configuração do Firebase (Banco de Dados):**
    * Certifique-se de que o **Firestore** e o **Firebase Authentication** (com provedor de E-mail/Senha) estão ativados no console do Firebase.
    * Para que o fluxo de agendamento funcione, pode ser necessário adicionar manualmente algumas "especialidades" e "funcionários" (médicos) no seu banco Firestore, conforme os requisitos RF05 e RF06.

5.  **Iniciar o projeto:**
    ```bash
    npm start
    ```
    O aplicativo estará disponível em `http://localhost:3000`.

## 📦 MVP Mínimo Visível (Entrega Sprint 1)

Para esta entrega inicial, focamos no fluxo de **Cadastro de Pacientes (RF01)** , que é uma entidade central do sistema e atende à história de usuário de alta prioridade da recepcionista ("Como recepcionista, quero cadastrar pacientes...") .

**Funcionalidade Implementada:**
* Uma tela de formulário permite o cadastro de um novo paciente.
* Os dados são salvos na coleção `pacientes` no banco de dados Firestore.
* Foram implementadas validações de campos obrigatórios, como Nome completo , CPF (único) , Data de nascimento e Telefone de contato .

### 📸 Prints da Tela


<p align="center">

![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps)
![Status](https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge)

</p>

# 🚖 EliteDrive — Sistema de Gestão e Agendamento de Corridas

Aplicação web desenvolvida durante o programa **Ford < Enter >**, realizado em parceria entre a **Ford Motor Company** e o **SENAI CIMATEC**, com o objetivo de aplicar conceitos modernos de desenvolvimento Front-End utilizando Angular.

O sistema simula uma plataforma de mobilidade urbana, permitindo que **motoristas** e **passageiros** realizem cadastro, autenticação, gerenciamento de perfil, agendamento de corridas e acompanhamento de rotas em tempo real através da integração com o **Google Maps API** e do **Firebase**.

> **Projeto desenvolvido para fins educacionais**, aplicando conceitos e boas práticas utilizadas no desenvolvimento de aplicações modernas com Angular.

---

# ✨ Principais Funcionalidades

- ✅ Cadastro de Passageiros
- ✅ Cadastro de Motoristas
- ✅ Login utilizando Firebase Authentication
- ✅ Persistência de sessão do usuário
- ✅ Proteção de rotas com Auth Guards
- ✅ Controle de acesso baseado no perfil do usuário
- ✅ Upload de imagens de perfil e veículos
- ✅ Compressão automática de imagens utilizando Canvas API
- ✅ Cadastro de veículos
- ✅ Agendamento de corridas
- ✅ Visualização de rotas em tempo real
- ✅ Integração com Google Maps API
- ✅ Interface totalmente responsiva
- ✅ Aceite obrigatório dos Termos de Uso e LGPD
- ✅ Interface moderna utilizando Glassmorphism e Neon UI

---

# 🏗 Arquitetura do Projeto

O projeto foi desenvolvido utilizando a arquitetura moderna do **Angular Standalone Components**, promovendo maior organização, reutilização de código e facilidade de manutenção.

A estrutura foi dividida em camadas bem definidas:

- Components
- Pages
- Services
- Guards
- Interfaces
- Models
- Shared
- Firebase
- Google Maps

Toda a lógica de negócio foi centralizada em **Services**, mantendo os componentes responsáveis apenas pela interface e interação com o usuário.

---

# 🛠 Tecnologias Utilizadas

- Angular 18+
- TypeScript
- HTML5
- CSS3
- Bootstrap 5
- Firebase Authentication
- Firebase Firestore
- Google Maps API
- Angular Router
- Reactive Forms
- Canvas API

---

# 📚 Conceitos Aplicados

## 🔐 Autenticação

- Login seguro
- Persistência de sessão
- Firebase Authentication

## 🛡 Segurança

- Auth Guards
- Proteção de rotas
- Controle de acesso por perfil

## 📝 Formulários

- Reactive Forms
- Validações síncronas
- Validações assíncronas
- Upload de imagens

## ⚡ Performance

- Compressão de imagens antes do envio
- Otimização do armazenamento no Firestore

## 🌎 Integração com APIs

- Google Maps API
- Geolocalização
- Cálculo de rotas
- Distância entre origem e destino

## 📱 Responsividade

- Mobile First
- Glassmorphism
- Layout adaptável
- Interface responsiva para Desktop, Tablet e Mobile

---

# 📁 Estrutura do Projeto

```text
src
│
├── app
│   ├── components
│   ├── guards
│   ├── interfaces
│   ├── models
│   ├── pages
│   ├── services
│   └── shared
│
├── assets
├── environments
└── styles
```

---

# 🚀 Como Executar o Projeto

## 1️⃣ Clone o repositório

```bash
git clone https://github.com/WilMarques05/Agendamento-corridas.git
```

Entre na pasta do projeto

```bash
cd Agendamento-corridas
```

---

## 2️⃣ Instale as dependências

```bash
npm install
```

Caso ocorra algum conflito de versões:

```bash
npm install --legacy-peer-deps
```

---

## 3️⃣ Execute a aplicação

```bash
ng serve
```

---

## 4️⃣ Acesse no navegador

```text
http://localhost:4200
```

---

# 📸 Demonstração

## Login

<p align="center">
<img src="assets/readme/login.png" width="900">
</p>

---

## Dashboard

<p align="center">
<img src="assets/readme/dashboard.png" width="900">
</p>

---

## Google Maps

<p align="center">
<img src="assets/readme/mapa.png" width="900">
</p>

> **Substitua as imagens pelos prints reais da aplicação.**

---

# 🎯 Objetivos de Aprendizagem

Durante o desenvolvimento deste projeto foram consolidados conhecimentos em:

- Arquitetura Angular
- Componentização
- Comunicação entre Componentes
- Injeção de Dependências
- Reactive Forms
- Angular Router
- Guards
- Firebase Authentication
- Firebase Firestore
- Google Maps API
- Gerenciamento de Estado
- UX/UI
- Responsividade
- Integração com APIs
- Boas práticas de organização de projetos Front-End

---

# 💡 Destaques Técnicos

✔ Arquitetura utilizando Standalone Components

✔ Separação da lógica de negócio em Services

✔ Navegação protegida por Auth Guards

✔ Persistência de autenticação

✔ Compressão de imagens utilizando Canvas API

✔ Upload otimizado para Firebase

✔ Interface moderna utilizando Glassmorphism

✔ Integração completa com Google Maps API

✔ Responsividade Mobile First

---

# 🚀 Próximas Melhorias

- Implementação de notificações em tempo real
- Histórico completo de corridas
- Avaliação entre passageiros e motoristas
- Integração com pagamentos
- Painel administrativo
- Dashboard com indicadores

---

# 👨‍💻 Desenvolvedor

## Willis Silva Marques

Desenvolvedor Front-End focado na criação de aplicações modernas, responsivas e escaláveis utilizando Angular.

### LinkedIn
https://www.linkedin.com/in/willis-silva-marques-53a306aa/

Adicione aqui o link do seu LinkedIn.

---

# ⭐ Caso este projeto tenha sido útil, deixe uma estrela no repositório!

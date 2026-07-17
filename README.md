# Ford < Enter > - Sprint Final: Desenvolvimento Completo de Sistema de Gestão de Corridas

Este repositório consolida o projeto desenvolvido na reta final do curso de Front-End do programa Ford < Enter >, uma iniciativa realizada em parceria entre a Ford e o SENAI/CIMATEC.

## 🎯 Objetivo do Projeto

O objetivo deste projeto foi o desenvolvimento de um sistema completo de gestão e agendamento de corridas (**EliteDrive**), aplicando na prática todo o conhecimento adquirido sobre o framework Angular. A aplicação foi construída para suportar perfis distintos (Passageiro e Motorista), garantindo uma jornada de usuário fluida, segura e funcional. O foco central desta etapa foi a implementação de autenticação persistente, proteção de rotas, manipulação de estados complexos de formulários, integração com o **Google Maps API** para navegação e a integração total com o **Firebase** para armazenamento de dados em tempo real.

*Nota: O projeto contido neste repositório foi criado exclusivamente para fins didáticos, não representando um projeto de software final ou de produção.*

## 🛠️ Tecnologias e Ferramentas Exploradas

* **Angular 18+ (Standalone Components):** Arquitetura moderna utilizando componentes independentes e gerenciamento de estados.
* **Google Maps API:** Integração de mapas dinâmicos, renderização de rotas em tempo real e geolocalização para motoristas e passageiros.
* **Firebase Auth & Firestore:** Implementação de autenticação, persistência de dados em tempo real e regras de segurança NoSQL.
* **Reactive Forms:** Formulários complexos com validações assíncronas e compressão de imagens via `Canvas API`.
* **Angular Router & Guards:** Navegação protegida (`CanActivate`) para controle de acesso baseado em perfis.
* **Design System (Dark/Neon):** Identidade visual premium utilizando *Glassmorphism* e paletas de cores neon.

## 📝 O que foi praticado

Durante esta jornada, foram exercitados conceitos avançados de engenharia de software front-end:

* **Integração com Mapas e Rotas:** Implementação da API do Google Maps para exibir rotas em tempo real, calcular distâncias entre pontos de coleta/destino e otimizar o deslocamento dos motoristas parceiros.
* **Arquitetura de Perfis:** Fluxos de cadastro e login segregados, onde o sistema identifica o tipo de usuário e redireciona para a interface correspondente.
* **Segurança e Proteção de Rotas:** Aplicação de `AuthGuards` que bloqueiam o acesso não autorizado a rotas sensíveis, validando o papel do usuário no banco de dados.
* **Manipulação de Imagens e Performance:** Rotinas para upload de fotos de perfil e veículos com compressão em Base64 para otimização de banda e armazenamento no Firestore.
* **UX/UI e Adaptabilidade:** Refinamento da responsividade total (Mobile-First), garantindo que o design com filtros de vidro (*blur*) funcione perfeitamente em qualquer resolução.
* **Gestão de Estados:** Controle rigoroso da experiência do usuário, incluindo o aceite obrigatório de **Termos de Uso e LGPD** antes da finalização do cadastro.
* **Comunicação entre Componentes e Serviços:** Refatoração da lógica de negócios para camadas de serviços, mantendo os componentes focados na interação com o usuário.

---
*Projeto desenvolvido por Willis Silva Marques.*

# Sistema Matrícula (Back-end)

Aplicação full‑stack com frontend em **Angular** e backend em **Node.js** (MySQL) para gerenciar de ponta a ponta o processo de matrículas acadêmicas. Permite criar e publicar editais, inscrever candidatos com upload seguro de documentos (PDF/XLSX), controlar usuários e permissões (admin, avaliador, aluno) e conduzir o fluxo de avaliação das inscrições.  

A interface, construída com **Angular Material**, oferece uma experiência responsiva e consistente; o backend expõe APIs REST em **Node.js** e persiste dados no **MySQL**. O **Firebase** é usado exclusivamente como provedor de armazenamento de arquivos (uploads de documentos), enquanto autenticação e persistência de dados ficam sob responsabilidade do backend. A arquitetura modular prioriza testabilidade, manutenção e implantação contínua.

## ✨ Funcionalidades Principais

- 🔐 Autenticação
- 📝 Cadastro de usuários
- 📂 Gerenciamento de Editais com upload de planilhas 
- 🧾 Fluxo de matrícula do aluno com upload de documentos PDF 
- ✅ Avaliação das matrículas por avaliadores

## 🛠️ Tecnologias Utilizadas

- Angular — SPA frontend em TypeScript, responsável pela UI, rotas, formulários e comunicação com a API (HttpClient).
- Angular Material — conjunto de componentes e estilos para construir interfaces responsivas e consistentes.
- Node.js — runtime do backend que expõe APIs REST para autenticação, gestão de usuários, editais e matrículas.
- MySQL — banco de dados relacional para persistência das entidades do sistema (usuários, editais, matrículas, avaliações).
- Firebase (Storage) — usado exclusivamente como provedor de armazenamento em nuvem para arquivos enviados.

## Link do projeto front-end

- https://github.com/gaabrielalex/servidor-sistema-matricula-public-repo

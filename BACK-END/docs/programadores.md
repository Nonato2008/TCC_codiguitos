# 🏗️ Arquitetura do Sistema
Este documento descreve a arquitetura utilizada no sistema, seus componentes e responsabilidades.

## 📌 Descrição
O sistema segue uma arquitetura em camadas, separando responsabilidades entre frontend, backend e banco de dados.

# 🧩 Camadas da Arquitetura

## 🌐 Frontend

### 📌 Responsabilidade
- Interface com o usuário
- Consumo da API
- Armazenamento de dados utilizando useState
- Renderização dinamica de dados recebidos da API

### 🛠️ Tecnologias
- React
- Bootstrap
- Axios
- HTML / CSS / JavaScript

## ⚙️ Backend

### 📌 Responsabilidade
- Regras de negócio
- Processamento de dados
- Exposição de API REST

### 🛠️ Tecnologias
- Node.js
- Axios
- Cors
- Dotenv
- Multer
- Mysql12 
- Express

## 🗄️ Banco de Dados

### 📌 Responsabilidade
- Persistência dos dados

### 🛠️ Tecnologias
- SQLServer
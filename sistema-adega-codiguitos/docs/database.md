# 🗄️ Modelo de Dados

Este documento apresenta o modelo de dados do sistema, com foco nas entidades e seus relacionamentos.

## 📦 Entidade: Produto

### 📌 Descrição
Representa os produtos em estoque.

### 📄 Atributos
- id (PK)
- idFornecedor (FK)   
- nome
- preco
- qtd(quantidade)
- status
- imagemProduto
- dataVenci
- dataCad

---

## 📦 Entidade: Fornecedor

### 📌 Descrição
Representa os fornecedores cadastrados no sistema.

### 📄 Atributos
- id (PK)
- nome
- imagemFornecedor  
- dataCad

##  🪢 Relacionamento: Fornecedor x Produto

### 📌 Descrição
Um fornecedor pode fornecer vários produtos.

### Cardinalidade
Fornecedor (1) ------ (N) Produto

---

## 🧾 Entidade: Venda

### 📌 Descrição
Representa uma transação de venda realizada no sistema.

### 📄 Atributos
- id (PK)
- valorTotal
- dataCad

## 🪢 Relacionamento: Venda x ItemVenda

### 📌 Descrição
Uma venda pode conter vários itens.

### Cardinalidade
Venda (1) ------ (N) ItemVenda

---

## 📦 Entidade: ItemVenda

### 📌 Descrição
Representa os itens associados a uma venda.

### 🧾 Estrutura (Itens_Venda)
- id (PK)
- idProduto(FK)
- idVenda (FK)
- qtd (quantidade)
- valor

## 🪢 Relacionamento: Produto x ItemVenda

### Descrição
Um produto pode aparecer em vários itens de venda

### Cardinalidade
Produto (1) ------ (N) ItemVenda
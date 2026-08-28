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
- imagem 
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
- idPropritario (FK)
- idVendedor (FK)
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

### 🧾 Estrutura (ItemVenda)
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

---

## Entidade: Proprietario

### Descrição
Representa os donos cadastros no sistema

### Atributos
- id (PK)
- nome
- senha 
- dataCad

## Relacionamento: Proprietario x Vendas

### Descrição
Um proprietário pode ter várias vendas

### Cardinalidade
Proprietário (1) ------ (N) Venda

---

## Entidade: Vendedores

### Descrição
Representa os vendedores de uma adega

### Atributos 
- id (PK)
- idProprietario (FK)
- Nome
- dataCad

## Relacionamento: Vendedores x Proprietario

### Descrição
Vários vendores posssuem um proprietario

### Cardinalidade
Vendedores (N) ------ (1) Proprietario
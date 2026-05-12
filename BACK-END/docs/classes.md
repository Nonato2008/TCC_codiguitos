# Diagrama de Classes
Este documento apresenta as principais classes do sistema da adega, incluindo seus atributos, métodos e relacionamentos.

## Classe: Proprietário

### Descrição
Representa o proprietário da adega que está utilizando o sistema.

### Atributos
- id: int
- nome: string
- email: string
- senha: string
- dataCad: datetime

### Métodos
- criarProprietario()
- atualizarProprietario()

---
        
## Classe: Fornecedor

### Descrição
Representa os fornecedores cadastrados no sistema.

### Atributos
- id: int
-  nome: string
- imagemFornecedor: string
- dataCad: datetime

### Métodos
- criarFornecedor()
- atualizarFornecedor()

---

## Classe: Produto

### Descrição
Representa os produtos em estoque disponíveis para venda.

### Atributos
- id: int
- idFornecedor: int
- nome: string
- descricao: string
- preco: decimal
- qtd: int
- status: boolean
- imagemProduto: string
- dataVenci: datetime
- dataCad: datetime

### Métodos
- atualizarEstoque()
- aplicarDesconto()

## Relacionamento: Produto x Fornecedor

### Descrição
Um fornecedor pode fornecer vários produtos.

### Tipo
Um para muitos 

### Cardinalidade
Fornecedor (1) ------ (N) Produto

---

## Classe: Venda

### Descrição
Representa as vendas realizadas no sistema.

### Atributos
- id: int
- idProprietario: int
- valorTotal: decimal
- dataCad: datetime

### Métodos
- criarVenda()
- cancelarVenda()

---

## Classe: ItemVenda

### Descrição
Representa cada item presente em uma venda.

### Atributos
- id: int
- idProduto: int
- idVenda: int
- qtd: int
- valorItem: decimal

### Métodos
- criarItemVenda()
- cancelarItemVenda() 

## Relacionamento: ItemVenda x Produto

### Descrição:
Um produto pode aparecer em vários itens de venda

### Cardinalidade
Produto (1) ------ (N) ItemVenda

### Tipo
Um para muitos (1:N)

## Relacionamento: Venda x ItemVenda

### Descrição
Uma venda pode conter vários itens.

### Tipo
Um para muitos (1:N)

### Cardinalidade
Venda (1) ------ (N) ItemVenda
# Modelo de dados

Os nomes abaixo correspondem aos identificadores das tabelas e colunas MySQL.
O código JavaScript usa `camelCase` para os dados da aplicação e mantém o
mapeamento para esses identificadores nos repositórios.

## Tabelas

### `Proprietarios`

- `Id` (PK)
- `Nome`
- `Senha`
- `DataCad`

### `Fornecedores`

- `Id` (PK)
- `Nome`
- `Imagem`
- `DataCad`

### `Vendedores`

- `Id` (PK)
- `IdProprietario` (FK → `Proprietarios.Id`)
- `Nome`
- `DataCad`
- `Senha`

### `Produtos`

- `Id` (PK)
- `IdFornecedor` (FK → `Fornecedores.Id`)
- `Nome`
- `Preco`
- `Custo`
- `Quantidade`
- `Status` (`Em Estoque`, `Vencido` ou `Esgotado`)
- `Imagem`
- `DataCad`
- `DataVenc`

### `Vendas`

- `Id` (PK)
- `IdProprietario` (FK → `Proprietarios.Id`)
- `IdVendedor` (FK → `Vendedores.Id`)
- `ValorTotal`
- `DataCad`
- `formaPagamento`

### `Itens_vendas`

- `Id` (PK)
- `IdVenda` (FK → `Vendas.Id`)
- `IdProduto` (FK → `Produtos.Id`)
- `Qtd`
- `Valor`
- `CustoUnitario` (custo unitário registrado no momento da venda; nulo em itens antigos sem histórico)

Para registrar e consultar o lucro realizado, aplique a migration
`migrations/20261101_add_custo_unitario_itens_vendas.sql` antes de iniciar o backend.
Vendas existentes sem custo histórico permanecem sem esse dado e não entram no
cálculo do lucro realizado.

## Relacionamentos

- Um fornecedor pode fornecer vários produtos.
- Um proprietário pode ter vários vendedores e várias vendas.
- Um vendedor pode realizar várias vendas.
- Uma venda pode conter vários itens.
- Um produto pode aparecer em vários itens de venda.
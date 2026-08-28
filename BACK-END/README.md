## Api reference 

### Produtos 

#### GET/produtos
- **Descriçao**: obtem uma lista de produtos
- **Responde**: Array de produtos

#### GET/produtos/:id
- **Descriçao**: obtem uma lista de produtos
- **Responde**: Array de produtoID

#### POST /produtos
- **Descrição**: Cria um novo produto
- **Body**:
```
{
    "idFornecedor": "1",
    "nome": "Latinha Agora"
    "preco": 30.00
    "quantidade": 10
    "dataVenc": 2026-08-03
    "imagem": "imagem.jpg"
}
```
-**Response**:
```
{
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 11,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
    }
}
```

#### PUT /produtos
- **Descrição**: Atualizar um  produto existente
- **Body**: 
```
{
    "idFornecedor": "1",
    "nome": "Latinha Agora"
    "preco": 25.00
    "quantidade": 10
    "status": "Em estoque"
    "imagem": "imagem.jpg"
    "dataVenc": 2026-12-31
}
```
-**Response**:
```
{
    "message": "Produto alterado com sucesso",
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "Rows matched: 1  Changed: 1  Warnings: 0",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
    }
}
```

#### DELL/produtos/:id
- **Descriçao**: Deleta um produto
- **Responde**: Produto deletado com sucesso

---

### Fornecedores

#### GET/fornecedores
- **Descriçao**: obtem uma lista de fornecedores
- **Responde**: Array de fornecedor

#### GET/fornecedores/:id
- **Descriçao**: obtem uma lista de fornecedor
- **Responde**: Array de fornecedorID

#### POST /fornecedores
- **Descrição**: Cria um novo fornecedor
- **Body**:
```
{
    "nome": "Coca cola2"
    "imagem": "imagem.jpg"
}
```
-**Response**:
```
{
    "message": "Fornecedor criado com sucesso",
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 7,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
    }
}
```

#### PUT /fornecedores
- **Descrição**: Atualizar um  fornecedor  existente
- **Body**:
```
{
    "nome": "Coca Cola664"
    "imagem": "imagem.jpg"
}
```
-**Response**:
```
{
    "message": "Fornecedor alterado com sucesso",
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "Rows matched: 1  Changed: 1  Warnings: 0",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
    }
}
```

#### DELL/fornecedores/:id
- **Descriçao**: Deleta um fornecedor
- **Responde**: Fornecedor deletado com sucesso

---
### Vendas 

#### GET/vendas
- **Descriçao**: obtem uma lista de vendas
- **Responde**: Array de venda

#### GET/vendas/:id
- **Descriçao**: obtem uma lista de vendas
- **Responde**: Array de vendasID

#### POST /vendas
- **Descrição**: Cria um nova venda
- **Body**:
```
{
    "idProprietario":1,
    "idVendedor":1,
    "itens"[
        {
            "idProduto":4,
            "qtd":10
        }
    ]
}
```
-**Response**:
```
{
    "id": 4,
    "valorTotal": 300
}
```

#### PUT /vendas
- **Descrição**: Atualizar uma venda existente
- **Body**: 
```
{
    "idProprietario":1,
    "idVendedor":1,
    "itens"[
        {
            "idProduto":4,
            "qtd":5
        }
    ]
}
```
-**Response**:
```
{
    "message": "Venda atualizada com sucesso.",
    "data": {
        "id": 4,
        "valorTotal": 150
    }
}
```

#### DELL/vendas/:id
- **Descriçao**: Deleta uma venda
- **Responde**: Venda deletada com sucesso

---

### Proprietarios

#### GET/proprietarios
- **Descriçao**: obtem uma lista de proprietarios
- **Responde**: Array de proprietarios

#### GET/proprietarios/:id
- **Descriçao**: obtem uma lista de proprietarios
- **Responde**: Array de proprietariosID

#### POST /proprietarios
- **Descrição**: Cria um novo proprietario
- **Body**:
```
{
    "nome": "Coca cola2"
    "imagem": "imagem.jpg"
}
```
-**Response**:
```
{
    "message": "Proprietário criado com sucesso",
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 3,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
    }
}
```

#### PUT /proprietarios
- **Descrição**: Atualizar um proprietarios existente
- **Body**:
```
{
    "nome": "Coca Cola664"
    "imagem": "imagem.jpg"
}
```
-**Response**:
```
 {
    "message": "Proprietário alterado com sucesso",
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "Rows matched: 1  Changed: 1  Warnings: 0",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
    }
}     

```

#### DELL/proprietarios/:id
- **Descriçao**: Deleta um proprietario
- **Responde**: Proprietario deletado com sucesso

---

### Vendedores 

#### GET/vendas
- **Descriçao**: obtem uma lista de vendedores
- **Responde**: Array de vendedores

#### GET/vendas/:id
- **Descriçao**: obtem uma lista de vendedores
- **Responde**: Array de vendedoresID

#### POST /vendas
- **Descrição**: Cria um novo vendedor
- **Body**:
```
{
    "idFornecedor": "1",
    "nome": "Latinha Agora"
    "preco": 30.00
    "quantidade": 10
    "dataVenc": 2026-08-03
    "imagem": "imagem.jpg"
}
```
-**Response**:
```
{
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 11,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
    }
}
```

#### PUT /vendas
- **Descrição**: Atualizar um vendedor existente
- **Body**: 
```
{
    "idFornecedor": "1",
    "nome": "Latinha Agora"
    "preco": 25.00
    "quantidade": 10
    "status": "Em estoque"
    "imagem": "imagem.jpg"
    "dataVenc": 2026-12-31
}
```
-**Response**:
```
{
    "message": "Produto alterado com sucesso",
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "Rows matched: 1  Changed: 1  Warnings: 0",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
    }
}
```

#### DELL/vendas/:id
- **Descriçao**: Deleta um vendedor
- **Responde**: Vendedor deletado com sucesso

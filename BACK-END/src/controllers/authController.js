import { connection } from "../config/Database.js";

const authController = {

    login: async (req, res) => {
        try {
            const { nome, senha } = req.body;

            if (!nome || !senha) {
                return res.status(400).json({
                    message: "Nome e senha são obrigatórios."
                });
            }

            const [proprietarios] = await connection.execute(
                `
                SELECT Id, Nome, Senha
                FROM Proprietarios
                WHERE Nome = ?
                `,
                [nome]
            );

            if (proprietarios.length > 0) {

                const proprietario = proprietarios[0];

                if (senha !== proprietario.Senha) {
                    return res.status(401).json({
                        message: "Nome ou senha incorretos."
                    });
                }

                return res.status(200).json({
                    message: "Login realizado com sucesso.",
                    usuario: {
                        id: proprietario.Id,
                        nome: proprietario.Nome,
                        tipo: "PROPRIETARIO"
                    }
                });
            }

            const [vendedores] = await connection.execute(
                `
                SELECT Id, Nome, Senha
                FROM Vendedores
                WHERE Nome = ?
                `,
                [nome]
            );

            if (vendedores.length > 0) {

                const vendedor = vendedores[0];

                if (senha !== vendedor.Senha) {
                    return res.status(401).json({
                        message: "Nome ou senha incorretos."
                    });
                }

                return res.status(200).json({
                    message: "Login realizado com sucesso.",
                    usuario: {
                        id: vendedor.Id,
                        nome: vendedor.Nome,
                        tipo: "VENDEDOR"
                    }
                });
            }

            return res.status(401).json({
                message: "Nome ou senha incorretos."
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message: "Nome ou senha incorretos",
                error: error.message
            });
        }
    },

    cadastro: async (req, res) => {

        try {

            const {
                nome,
                senha,
                tipo
            } = req.body;

            if (!nome || !senha || !tipo) {
                return res.status(400).json({
                    message: "Nome, senha e tipo são obrigatórios."
                });
            }

            if (senha.length < 6) {
                return res.status(400).json({
                    message: "A senha deve possuir pelo menos 6 caracteres."
                });
            }

            if (
                tipo !== "PROPRIETARIO" &&
                tipo !== "VENDEDOR"
            ) {
                return res.status(400).json({
                    message: "Tipo de usuário inválido."
                });
            }

            if (tipo === "PROPRIETARIO") {

                const [existente] = await connection.execute(
                    `
                    SELECT Id
                    FROM Proprietarios
                    WHERE Nome = ?
                    `,
                    [nome]
                );

                if (existente.length > 0) {
                    return res.status(409).json({
                        message: "Este nome já está cadastrado."
                    });
                }

                const [result] = await connection.execute(
                    `
                    INSERT INTO Proprietarios
                    (Nome, Senha)
                    VALUES (?, ?)
                    `,
                    [nome, senha]
                );

                return res.status(201).json({
                    message: "Proprietário cadastrado com sucesso.",
                    usuario: {
                        id: result.insertId,
                        nome,
                        tipo
                    }
                });
            }

            const [existente] = await connection.execute(
                `
                SELECT Id
                FROM Vendedores
                WHERE Nome = ?
                `,
                [nome]
            );

            if (existente.length > 0) {
                return res.status(409).json({
                    message: "Este nome já está cadastrado."
                });
            }

            const [proprietarios] = await connection.execute(
                `
                SELECT Id
                FROM Proprietarios
                ORDER BY Id
                LIMIT 1
                `
            );

            if (proprietarios.length === 0) {
                return res.status(400).json({
                    message: "É necessário cadastrar um proprietário antes de cadastrar um vendedor."
                });
            }

            const idProprietario = proprietarios[0].Id;

            const [result] = await connection.execute(
                `
                INSERT INTO Vendedores
                (IdProprietario, Nome, Senha)
                VALUES (?, ?, ?)
                `,
                [
                    idProprietario,
                    nome,
                    senha
                ]
            );

            return res.status(201).json({
                message: "Vendedor cadastrado com sucesso.",
                usuario: {
                    id: result.insertId,
                    nome,
                    tipo
                }
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message: "Erro ao realizar cadastro.",
                error: error.message
            });
        }
    }

};

export default authController;
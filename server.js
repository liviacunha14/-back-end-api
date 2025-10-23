// ######
// Local onde os pacotes de dependências serão importados
// ######
import express from "express"; // Requisição do pacote do express
import pkg from "pg"; // Requisição do pacote do pg (PostgreSQL)
import dotenv from "dotenv"; // Importa o pacote dotenv para carregar variáveis de ambiente

// ######
// Local onde as configurações do servidor serão feitas
// ######
const app = express(); // Inicializa o servidor Express
const port = 3000; // Define a porta onde o servidor irá escutar
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// Middleware para interpretar requisições com corpo em JSON
app.use(express.json());

const { Pool } = pkg; // Obtém o construtor Pool do pacote pg para gerenciar conexões com o banco de dados PostgreSQL
let pool = null; // Variável para armazenar o pool de conexões com o banco de dados

// Função para obter uma conexão com o banco de dados
function conectarBD() {
  if (!pool) {
    // Se o pool ainda não foi criado, cria uma nova instância
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  // Retorna o pool de conexões existente
  return pool;
}

// ######
// Local onde as rotas (endpoints) serão definidas
// ######

app.get("/", async (req, res) => {
  // Rota raiz do servidor
  console.log("Rota GET / solicitada"); // Log no terminal para indicar que a rota foi acessada

  const db = conectarBD(); // Obtém uma conexão do pool

  let dbStatus = "ok";

  // Tenta executar uma consulta simples para verificar a conexão com o banco de dados
  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = e.message;
  }

  // Responde com um JSON contendo uma mensagem, o nome do autor e o status da conexão com o banco de dados
  res.json({
    message: "API para entregar a atividade", // Conteúdo da sua API
    author: "Lívia Oliveira Cunha", // Seu nome completo
    dbStatus: dbStatus,
  });
});

// ###################################
// ##### ROTAS PARA "QUESTOES" #####
// ###################################

// Rota para retornar todas as questões cadastradas
app.get("/questoes", async (req, res) => {
  console.log("Rota GET /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  const db = conectarBD(); // Obtém uma conexão do pool

  try {
    const resultado = await db.query("SELECT * FROM questoes"); // Executa uma consulta SQL para selecionar todas as questões
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta
    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

// Rota para buscar uma questão pelo ID
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    const consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    const resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    const dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    res.json(dados); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao buscar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// Rota para excluir uma questão pelo ID
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let dados = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    consulta = "DELETE FROM questoes WHERE id = $1"; // Consulta SQL para deletar a questão pelo ID
    resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    res.status(200).json({ mensagem: "Questão excluida com sucesso!!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao excluir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// Rota para inserir uma questão
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const data = req.body; // Obtém os dados do corpo da requisição
    // Validação dos dados recebidos
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem:
          "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD(); // Conecta ao banco de dados

    const consulta =
      "INSERT INTO questoes (enunciado,disciplina,tema,nivel) VALUES ($1,$2,$3,$4) "; // Consulta SQL para inserir a questão
    const questao = [data.enunciado, data.disciplina, data.tema, data.nivel]; // Array com os valores a serem inseridos
    const resultado = await db.query(consulta, questao); // Executa a consulta SQL com os valores fornecidos
    res.status(201).json({ mensagem: "Questão criada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao inserir questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// Rota para atualizar uma questão pelo ID
app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada

  try {
    const id = req.params.id; // Obtém o ID da questão a partir dos parâmetros da URL
    const db = conectarBD(); // Conecta ao banco de dados
    let consulta = "SELECT * FROM questoes WHERE id = $1"; // Consulta SQL para selecionar a questão pelo ID
    let resultado = await db.query(consulta, [id]); // Executa a consulta SQL com o ID fornecido
    let questao = resultado.rows; // Obtém as linhas retornadas pela consulta

    // Verifica se a questão foi encontrada
    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" }); // Retorna erro 404 se a questão não for encontrada
    }

    const data = req.body; // Obtém os dados do corpo da requisição

    // Usa o valor enviado ou mantém o valor atual do banco
    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    // Atualiza a questão
    consulta =
      "UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    // Executa a consulta SQL com os valores fornecidos
    resultado = await db.query(consulta, [
      data.enunciado,
      data.disciplina,
      data.tema,
      data.nivel,
      id,
    ]);

    res.status(200).json({ message: "Questão atualizada com sucesso!" }); // Retorna o resultado da consulta como JSON
  } catch (e) {
    console.error("Erro ao atualizar questão:", e); // Log do erro no servidor
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// ###################################
// ##### ROTAS PARA "USUARIOS" #####
// ###################################

// 1. [GET] /usuarios (Listar todos)
app.get("/usuarios", async (req, res) => {
  console.log("Rota GET /usuarios solicitada");
  const db = conectarBD();
  try {
    const resultado = await db.query("SELECT * FROM usuarios"); // MUDOU AQUI
    const dados = resultado.rows;
    res.json(dados);
  } catch (e) {
    console.error("Erro ao buscar usuários:", e); // MUDOU AQUI
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// 2. [GET] /usuarios/:id (Buscar um)
app.get("/usuarios/:id", async (req, res) => {
  console.log("Rota GET /usuarios/:id solicitada");
  try {
    const id = req.params.id;
    const db = conectarBD();
    const consulta = "SELECT * FROM usuarios WHERE id = $1"; // MUDOU AQUI
    const resultado = await db.query(consulta, [id]);
    const dados = resultado.rows;
    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" }); // MUDOU AQUI
    }
    res.json(dados);
  } catch (e) {
    console.error("Erro ao buscar usuário:", e); // MUDOU AQUI
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// 3. [POST] /usuarios (Criar um)
app.post("/usuarios", async (req, res) => {
  console.log("Rota POST /usuarios solicitada");
  try {
    const data = req.body;
    // Validação dos dados (MUDOU AQUI)
    if (!data.nome || !data.email || !data.senha) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem: "Campos (nome, email, senha) são obrigatórios.",
      });
    }

    const db = conectarBD();
    // Consulta SQL (MUDOU AQUI)
    const consulta =
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)";
    const usuario = [data.nome, data.email, data.senha]; // MUDOU AQUI

    await db.query(consulta, usuario);
    res.status(201).json({ mensagem: "Usuário criado com sucesso!" }); // MUDOU AQUI
  } catch (e) {
    console.error("Erro ao inserir usuário:", e); // MUDOU AQUI
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// 4. [PUT] /usuarios/:id (Atualizar um)
app.put("/usuarios/:id", async (req, res) => {
  console.log("Rota PUT /usuarios/:id solicitada");
  try {
    const id = req.params.id;
    const db = conectarBD();
    let consulta = "SELECT * FROM usuarios WHERE id = $1"; // MUDOU AQUI
    let resultado = await db.query(consulta, [id]);
    let usuario = resultado.rows; // MUDOU AQUI

    if (usuario.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" }); // MUDOU AQUI
    }

    const data = req.body;
    // MUDOU A LÓGICA DE ATUALIZAÇÃO
    data.nome = data.nome || usuario[0].nome;
    data.email = data.email || usuario[0].email;
    data.senha = data.senha || usuario[0].senha;

    consulta =
      "UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4"; // MUDOU AQUI
    resultado = await db.query(consulta, [
      data.nome,
      data.email,
      data.senha,
      id,
    ]);

    res.status(200).json({ message: "Usuário atualizado com sucesso!" }); // MUDOU AQUI
  } catch (e) {
    console.error("Erro ao atualizar usuário:", e); // MUDOU AQUI
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// 5. [DELETE] /usuarios/:id (Deletar um)
app.delete("/usuarios/:id", async (req, res) => {
  console.log("Rota DELETE /usuarios/:id solicitada");
  try {
    const id = req.params.id;
    const db = conectarBD();
    let consulta = "SELECT * FROM usuarios WHERE id = $1"; // MUDOU AQUI
    let resultado = await db.query(consulta, [id]);
    let dados = resultado.rows;

    if (dados.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" }); // MUDOU AQUI
    }

    consulta = "DELETE FROM usuarios WHERE id = $1"; // MUDOU AQUI
    await db.query(consulta, [id]);
    res.status(200).json({ mensagem: "Usuário excluido com sucesso!!" }); // MUDOU AQUI
  } catch (e) {
    console.error("Erro ao excluir usuário:", e); // MUDOU AQUI
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});


// ######
// Local onde o servidor irá escutar as requisições
// ######
app.listen(port, () => {
  // Inicia o servidor na porta definida
  console.log(`Serviço rodando na porta:  ${port}`);
});


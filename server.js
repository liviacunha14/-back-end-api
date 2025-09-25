// ######
// Importando dependências
// ######
import express from "express";      // Pacote Express para criar o servidor
import pkg from "pg";               // Pacote do PostgreSQL
import dotenv from "dotenv";        // Pacote para lidar com variáveis de ambiente

// Obtém o construtor Pool do pacote pg para gerenciar conexões
const { Pool } = pkg;

// ######
// Configurações iniciais
// ######
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta do servidor
dotenv.config();                    // Carrega as variáveis do arquivo .env

// Variável para armazenar o pool de conexões com o banco de dados
let pool = null;

// ######
// Funções de Conexão com o Banco de Dados
// ######

// Função para obter uma conexão com o banco de dados (padrão Singleton)
// Ela garante que apenas um pool de conexões seja criado.
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD,
    });
  }
  return pool;
}

// ######
// Definição das rotas
// ######
app.get("/", async (req, res) => {  // Torna a função assíncrona para usar await
  console.log("Rota GET / solicitada");

  // Obtém a conexão do pool
  const db = conectarBD();

  let dbStatus = "ok";

  // Testar a conexão
  try {
    await db.query("SELECT 1");     // Testa se o banco responde
  } catch (e) {
    dbStatus = e.message;           // Se der erro, guarda a mensagem
  }

  // Resposta JSON
  res.json({
    descricao: "API para entregar a atividade",   // Pode personalizar
    autor: "Lívia Oliveira Cunha",                // Seu nome completo
    statusBD: dbStatus                          // Status do banco
  });
});

// Nova rota para buscar todas as questões
app.get("/questoes", async (req, res) => {
	console.log("Rota GET /questoes solicitada"); // Log no terminal para indicar que a rota foi acessada
	
    // Obtém a conexão do pool
    const db = conectarBD();

    try {
        const resultado = await db.query("SELECT * FROM questoes"); // Executa a consulta SQL
        const dados = resultado.rows; // Obtém as linhas retornadas
        res.json(dados); // Retorna o resultado como JSON
      } catch (e) {
        console.error("Erro ao buscar questões:", e); // Log do erro no servidor
        res.status(500).json({
          erro: "Erro interno do servidor",
          mensagem: "Não foi possível buscar as questões",
        });
      }    
});


// ######
// Servidor escutando
// ######
app.listen(port, () => {
  console.log(`Serviço rodando na porta: ${port}`);
});


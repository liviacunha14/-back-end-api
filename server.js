// ######
// Importando dependências
// ######
import express from "express";      // Pacote Express para criar o servidor
import pkg from "pg";               // Pacote do PostgreSQL
import dotenv from "dotenv";        // Pacote para lidar com variáveis de ambiente

// ######
// Configurações iniciais
// ######
const app = express();              // Instancia o Express
const port = 3000;                  // Define a porta do servidor
dotenv.config();                    // Carrega as variáveis do arquivo .env
const { Pool } = pkg;               // Classe Pool para conectar ao Postgres

// ######
// Definição das rotas
// ######
app.get("/", async (req, res) => {  // Torna a função assíncrona para usar await
  console.log("Rota GET / solicitada");

  // Criar nova conexão com o banco
  const db = new Pool({
    connectionString: process.env.URL_BD, // Usa a Connection String do .env
  });

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
	
    // Cria uma nova instância do Pool para gerenciar conexões com o banco de dados
    const db = new Pool({
        connectionString: process.env.URL_BD, // Usa a variável de ambiente do arquivo .env DATABASE_URL para a string de conexão
    });

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


// ######
// Servidor escutando
// ######
app.listen(port, () => {
  console.log(`Serviço rodando na porta: ${port}`);
});

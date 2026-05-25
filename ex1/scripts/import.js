const mongoose = require("mongoose");
const path = require("path");
const Jogo = require("../models/jogo");

const mongoUrl =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/jogostabuleiro";

async function connectWithRetry(retries = 20, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(mongoUrl);
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      console.log(`Mongo indisponível, nova tentativa (${attempt}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function run() {
  const dataPath = path.join(__dirname, "..", "data", "jogos.processados.json");
  const jogos = require(dataPath);

  await connectWithRetry();
  await Jogo.deleteMany({});
  await Jogo.insertMany(jogos);

  console.log(`Importados ${jogos.length} jogos em ${mongoUrl}.`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Erro ao importar jogos:", error);
  process.exit(1);
});

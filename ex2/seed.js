const mongoose = require("mongoose");
const path = require("path");
const Livro = require("./models/livro");

const mongoUrl =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/readinglist";

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
  const dataPath = path.join(__dirname, "data", "livros.json");
  const livros = require(dataPath);

  await connectWithRetry();
  await Livro.deleteMany({});
  await Livro.insertMany(livros);

  console.log(`Importados ${livros.length} livros em ${mongoUrl}.`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error("Erro ao importar livros:", error);
  process.exit(1);
});

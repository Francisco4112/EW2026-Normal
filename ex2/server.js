const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Livro = require("./models/livro");

const app = express();
const port = process.env.PORT || 19020;
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/readinglist";

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

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  const readyState = mongoose.connection.readyState;
  res.json({
    status: readyState === 1 ? "ok" : "degraded",
    mongoReadyState: readyState
  });
});

app.get("/api/livros", async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { titulo: { $regex: search, $options: "i" } },
        { autor: { $regex: search, $options: "i" } }
      ];
    }

    const livros = await Livro.find(filter).sort({ titulo: 1 }).lean();
    return res.json(livros);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao obter livros." });
  }
});

app.post("/api/livros", async (req, res) => {
  try {
    const livro = await Livro.create(req.body);
    return res.status(201).json(livro.toObject({ versionKey: false }));
  } catch (_error) {
    return res.status(400).json({ error: "Dados inválidos para criar livro." });
  }
});

app.put("/api/livros/:id", async (req, res) => {
  try {
    const livro = await Livro.findByIdAndUpdate(
      req.params.id,
      { lido: req.body.lido },
      { new: true, runValidators: true }
    ).lean();

    if (!livro) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    return res.json(livro);
  } catch (_error) {
    return res.status(400).json({ error: "Pedido inválido para atualizar livro." });
  }
});

app.delete("/api/livros/:id", async (req, res) => {
  try {
    const livro = await Livro.findByIdAndDelete(req.params.id).lean();

    if (!livro) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    return res.json(livro);
  } catch (_error) {
    return res.status(400).json({ error: "Pedido inválido para remover livro." });
  }
});

connectWithRetry()
  .then(() => {
    app.listen(port, () => {
      console.log(`API ex2 a responder na porta ${port}.`);
    });
  })
  .catch((error) => {
    console.error("Falha na ligação ao MongoDB:", error);
    process.exit(1);
  });

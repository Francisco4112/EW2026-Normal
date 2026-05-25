const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const Jogo = require("./models/jogo");
const swaggerDocument = require("./swagger.json");

const app = express();
const port = process.env.PORT || 17000;
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

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function sanitizeJogo(jogo) {
  if (!jogo) {
    return jogo;
  }

  const plain = typeof jogo.toObject === "function" ? jogo.toObject() : { ...jogo };
  delete plain._id;
  return plain;
}

app.get("/health", async (_req, res) => {
  const readyState = mongoose.connection.readyState;
  res.json({
    status: readyState === 1 ? "ok" : "degraded",
    mongoReadyState: readyState
  });
});

app.get("/jogos", async (req, res) => {
  try {
    const { editora } = req.query;

    if (editora) {
      const jogos = await Jogo.find(
        { "editoras.name": editora },
        { _id: 0, id: 1, name: 1, year: 1 }
      )
        .sort({ name: 1 })
        .lean();

      return res.json(jogos);
    }

    const jogos = await Jogo.find(
      {},
      { _id: 0, id: 1, name: 1, year: 1, category: 1, minPlayers: 1 }
    )
      .sort({ name: 1 })
      .lean();

    return res.json(jogos);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao obter jogos." });
  }
});

app.get("/jogos/:id", async (req, res) => {
  try {
    const jogo = await Jogo.findOne({ id: req.params.id }, { _id: 0 }).lean();

    if (!jogo) {
      return res.status(404).json({ error: "Jogo não encontrado." });
    }

    return res.json(jogo);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao obter jogo." });
  }
});

app.get("/autores", async (_req, res) => {
  try {
    const autores = await Jogo.aggregate([
      { $unwind: "$autores" },
      {
        $group: {
          _id: "$autores.id",
          nome: { $first: "$autores.name" },
          jogos: {
            $push: {
              id: "$id",
              nome: "$name"
            }
          }
        }
      },
      { $sort: { nome: 1 } },
      {
        $project: {
          _id: 0,
          nome: 1,
          jogos: 1
        }
      }
    ]);

    return res.json(autores);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao obter autores." });
  }
});

app.get("/categorias", async (_req, res) => {
  try {
    const categorias = await Jogo.aggregate([
      {
        $group: {
          _id: "$category",
          categoria: { $first: "$category" },
          jogos: {
            $push: {
              id: "$id",
              nome: "$name"
            }
          }
        }
      },
      { $sort: { categoria: 1 } },
      {
        $project: {
          _id: 0,
          categoria: 1,
          jogos: 1
        }
      }
    ]);

    return res.json(categorias);
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao obter categorias." });
  }
});

app.post("/jogos", async (req, res) => {
  try {
    const jogo = await Jogo.create(req.body);
    return res.status(201).json(sanitizeJogo(jogo));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Já existe um jogo com esse id." });
    }

    return res.status(400).json({ error: "Dados inválidos para criar jogo." });
  }
});

app.put("/jogos/:id", async (req, res) => {
  try {
    if (req.body.id && req.body.id !== req.params.id) {
      return res
        .status(400)
        .json({ error: "O id no corpo não coincide com o id da rota." });
    }

    const jogo = await Jogo.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, id: req.params.id },
      {
        new: true,
        runValidators: true,
        overwrite: true
      }
    ).lean();

    if (!jogo) {
      return res.status(404).json({ error: "Jogo não encontrado." });
    }

    return res.json(sanitizeJogo(jogo));
  } catch (_error) {
    return res.status(400).json({ error: "Dados inválidos para atualizar jogo." });
  }
});

app.delete("/jogos/:id", async (req, res) => {
  try {
    const jogo = await Jogo.findOneAndDelete({ id: req.params.id }).lean();

    if (!jogo) {
      return res.status(404).json({ error: "Jogo não encontrado." });
    }

    return res.json(sanitizeJogo(jogo));
  } catch (_error) {
    return res.status(500).json({ error: "Erro ao eliminar jogo." });
  }
});

connectWithRetry()
  .then(() => {
    app.listen(port, () => {
      console.log(`API ex1 a responder na porta ${port}.`);
    });
  })
  .catch((error) => {
    console.error("Falha na ligação ao MongoDB:", error);
    process.exit(1);
  });

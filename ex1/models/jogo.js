const mongoose = require("mongoose");

const autorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
);

const editoraSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false }
);

const mecanicaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
);

const premioSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    year: { type: Number, required: true }
  },
  { _id: false }
);

const jogoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    minPlayers: { type: Number, required: true },
    maxPlayers: { type: Number, required: true },
    playingTimeMinutes: { type: Number, required: true },
    descriptionEN: { type: String, required: true },
    autores: { type: [autorSchema], default: [] },
    editoras: { type: [editoraSchema], default: [] },
    mecanicas: { type: [mecanicaSchema], default: [] },
    premios: { type: [premioSchema], default: [] }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model("Jogo", jogoSchema, "jogos");

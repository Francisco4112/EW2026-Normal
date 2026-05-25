const mongoose = require("mongoose");

const livroSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    autor: { type: String, required: true, trim: true },
    paginas: { type: Number, required: true, min: 1 },
    genero: { type: String, required: true, trim: true },
    lido: { type: Boolean, default: false }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

module.exports = mongoose.model("Livro", livroSchema, "livros");

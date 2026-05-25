# EW2026-Normal

Resolução do enunciado em duas pastas:

- `ex1`: API de dados de jogos de tabuleiro em `Express/Mongoose`, Swagger em `/api-docs`, importação para MongoDB e `docker-compose`.
- `ex2`: API de dados para a interface "A Minha Lista de Leituras", dataset inicial, frontend servido por Nginx e `docker-compose`.

## Persistência de dados

- `ex1` usa a base de dados `jogostabuleiro` e a coleção `jogos`.
- `ex2` usa a base de dados `readinglist` e a coleção `livros`.
- Em ambos os exercícios, os Dockerfiles da API fazem `seed` automático no arranque do contentor para simplificar avaliação.

## Executar o exercício 1

```bash
cd ex1
npm install
npm run seed
npm start
```

Variáveis opcionais:

- `PORT` por omissão `17000`
- `MONGO_URL` por omissão `mongodb://127.0.0.1:27017/jogostabuleiro`

Com Docker:

```bash
cd ex1
docker compose up --build -d
```

Serviços:

- API: `http://localhost:17000`
- Swagger: `http://localhost:17000/api-docs`

## Executar o exercício 2

```bash
cd ex2
npm install
npm run seed
npm start
```

Variáveis opcionais:

- `PORT` por omissão `19020`
- `MONGO_URL` por omissão `mongodb://127.0.0.1:27017/readinglist`

Com Docker:

```bash
cd ex2
docker compose up --build -d
```

Serviços:

- API: `http://localhost:19020/api/livros`
- Frontend: `http://localhost:19021`

## Notas

- O ficheiro de queries pedido no enunciado está em `ex1/queries.txt`.
- O dataset processado usado no `ex1` está em `ex1/data/jogos.processados.json`.
- A interface fornecida foi copiada para `ex2/index.html` para ser servida por Nginx no `docker-compose`.

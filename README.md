# E-Commerce FAQ Solution

This project provides a **Retrieval-Augmented Generation (RAG)** solution focused on answering customer questions for an e-commerce website. It combines vector-based search with AI-generated responses to deliver relevant and accurate answers. The project uses:

- **pgvectorscale** with PostgreSQL as the vector database.
- **LangChain** for embedding text to vectors and managing the retrieval process.
- **OpenAI** for creating embeddings and generating responses using the **GPT-4** model.

## Features

1. **Vector Search**: Find similar questions and answers using vector embeddings stored in PostgreSQL.
2. **Data Addition**: Dynamically add new FAQ data.
3. **AI-Generated Responses**: Get structured outputs from GPT-4 for customer queries.

---

## Prerequisites

- Node.js installed with your preferred package manager (e.g., `npm` or `yarn`).
- PostgreSQL installed and running, **with the `pgvectorscale` extension enabled**.

### Using Docker for PostgreSQL
If you prefer, you can set up PostgreSQL using Docker:

```bash
docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -d -p 5432:5432 postgres

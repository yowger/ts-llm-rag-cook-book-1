# Basic RAG Recipe Finder

A recipe question-answering application that combines **semantic vector search** and **structured database search**. An intent classifier determines which retrieval method is appropriate for each question before the retrieved information is passed to the response LLM.

- pinecone used as vector db with text-embedding-3-small, dimensions 1536 and cosine metric.
- Openai used as llm, using gpt-5-mini (to save $)
- around 13k row of recipes, keep in mind the recipes and ingredients are basic. Only id,title,ingredients, instructions.
- Thanks to this github repo for providing the recipes. https://github.com/josephrmartinez/recipe-dataset

## how to run the program
- you must fill the environment fields, you can use other llms, don`t have to be openai but then u gotta modify the code. 
- install libs (npm i)
- upload recipes to sql db and vector db (I am using pinecone for this). sql db schema (id,title,ingredients, instructions). For vector db just run **npm run ingest** after creating your vector db
- then **npm run dev** to run program.

## Demo
<video controls src="20260929-1902-58.1401177.mp4" title="Title"></video>

## Flow

```text
                         ┌──────────────────┐
                         │      User        │
                         │     Question     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Input Validation │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Intent Classifier│
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
       │Vector Search│     │  Database   │     │ Out of Scope │
       │             │     │   Search    │     │              │
       └──────┬──────┘     └──────┬──────┘     └──────────────┘
              │                   │
              ▼                   ▼
        ┌───────────┐       ┌─────────────┐
        │ Pinecone  │       │ Text-to-SQL │
        └─────┬─────┘       └──────┬──────┘
              │                    │
              │                    ▼
              │              ┌─────────────┐
              │              │ SQL Validate│
              │              └──────┬──────┘
              │                    │
              │                    ▼
              │              ┌─────────────┐
              │              │ PostgreSQL  │
              │              └──────┬──────┘
              │                    │
              └──────────┬─────────┘
                         ▼
                  ┌──────────────┐
                  │    Context   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Response LLM │
                  │  GPT-5-mini  │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Next.js UI  │
                  └──────────────┘
```

### 1. Input Validation

The user submits a recipe-related question.

The input is trimmed and limited to **1,000 characters** to prevent excessively large requests and reduce unnecessary processing.

### 2. Intent Classification

The question is passed to an intent classifier, which determines the appropriate retrieval path:

* `vector_search`
* `database_search`
* `out_of_scope`

#### Vector Search

Used when the user is looking for recipes based on **meaning, preferences, ingredients, descriptions, or similarity**.

For example:

> "I want a creamy chicken recipe."

The question is converted into an embedding and searched against the recipe embeddings stored in Pinecone.

**Flow:**

```text
Question
   ↓
Embedding
   ↓
Pinecone
   ↓
Relevant Recipe Chunks
```

#### Database Search

Used when the user needs **structured information**, such as counts, filters, or specific database records.

For example:

> "How many chicken recipes do you have?"

The question is converted into SQL using a smaller Text-to-SQL LLM (`gpt-5-nano`). The generated SQL is then validated before being executed against PostgreSQL.

**Flow:**

```text
Question
   ↓
Text-to-SQL
   ↓
SQL Validation
   ↓
PostgreSQL
   ↓
Structured Results
```

The generated SQL is restricted to read-only operations and the `recipes` table.

#### Out of Scope

If the question is unrelated to the recipe application or cannot be answered using the available recipe data, the application returns a friendly response and stops the current retrieval flow.

### 3. Context Retrieval

The selected retrieval path produces the information needed to answer the user's question.

Depending on the intent, this context comes from either:

* **Pinecone** — relevant recipe chunks from semantic search
* **PostgreSQL** — structured results from a SQL query

### 4. Response Generation

The retrieved context and the user's question are passed to the response LLM (`gpt-5-mini`).

The model uses the provided context to generate the final answer rather than retrieving information on its own.

### 5. Response

The generated response is streamed back to the Next.js application and displayed in the chat UI.

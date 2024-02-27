# Custom AI Assistant

Ask questions from your personal knowledgebase

## Getting Started

### Prerequisites

1. OpenAI API Key
2. AstraDB credentials
   - Access Token
   - DataBase Endpoint

### Clone the repo

Run the following command to clone the repo

```sh
git clone https://github.com/harshil1712/langchain-astradb.git
```

### Install dependencies

Navigate into the project directory and run the following command to install the required dependencies

```sh
npm run install
```

### Configure credentials

Rename the `.env.example` file to `.env.local`. Add your credentials in the `.env.local` file.

### Start Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Create Collection

Create a [Severless Vector Database](https://docs.datastax.com/en/astra/astra-db-vector/databases/create-database.html#create-vector-database) if you don't already have one. Next, navigate to the `/api/createCollection`. This will create a new collection called `demo` in your database.

### Ingest Data

To create embeds and ingest the vectors, navigate to the `/api/ingestData` endpoint.

This endpoint will use the content from `./data/blog` folder.

### Try out!

Navigate to the [homepage](https://localhost:3000). You can now ask questions to your assistant!

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [AstraDB](https://docs.datastax.com/en/astra-serverless/docs/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs/getting-started)
- [LangChain](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

import { StreamingTextResponse, Message as VercelChatMessage } from 'ai';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import {
	AstraDBVectorStore,
	AstraLibArgs,
} from '@langchain/community/vectorstores/astradb';
import { BytesOutputParser } from 'langchain/schema/output_parser';
import { PromptTemplate } from 'langchain/prompts';

const { OPENAI_API_KEY, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_URL } =
	process.env;

const openai = new ChatOpenAI({
	temperature: 0.9,
	modelName: 'gpt-3.5-turbo',
	openAIApiKey: OPENAI_API_KEY,
	streaming: true,
});

const embeddings = new OpenAIEmbeddings({
	openAIApiKey: OPENAI_API_KEY,
	modelName: 'text-embedding-3-small',
});

const astraConfig: AstraLibArgs = {
	token: ASTRA_DB_APPLICATION_TOKEN as string,
	endpoint: ASTRA_DB_URL as string,
	collection: 'demo',
};

const formatMessage = (message: VercelChatMessage) => {
	return `${message.role}: ${message.content}`;
};

const systemPrompt = `You are my personal assistant. You help me with the questions that I have. For any question I ask, you always use the following contenxt. If you don't find the relevant information there, ask me if I want to search the internet for the answer.

  Context:
  {context}

  Current conversation:
  {chat_history}

  User: {input}

  AI:
  `;

export async function POST(req: Request) {
	const { messages: userMessage } = await req.json();
	const formattedPreviousMessages = userMessage.slice(0, -1).map(formatMessage);
	const currentMessageContent = userMessage[userMessage.length - 1].content;

	const vectorStore = new AstraDBVectorStore(embeddings, astraConfig);
	await vectorStore.initialize();
	const resultFromVectorStore = await vectorStore.similaritySearch(
		currentMessageContent,
		10
	);

	let context: string[] = [];
	resultFromVectorStore.map((result) => {
		context.push(result.pageContent);
	});

	const prompt = PromptTemplate.fromTemplate(systemPrompt);

	const outputParser = new BytesOutputParser();

	const chain = prompt.pipe(openai).pipe(outputParser);

	const stream = await chain.stream({
		context: context.join(','),
		chat_history: formattedPreviousMessages.join('\n'),
		input: currentMessageContent,
	});
	// Respond with the stream
	return new StreamingTextResponse(stream);
}

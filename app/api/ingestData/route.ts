import fs from 'fs';
import path from 'path';
import grayMatter from 'gray-matter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { AstraDB } from '@datastax/astra-db-ts';

const { OPENAI_API_KEY, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_URL } =
	process.env;

// Fetch content
const POSTS_FOLDERS_PATH: string = path.join(process.cwd(), './data/blog');

const POSTS_FOLDERS = fs
	.readdirSync(POSTS_FOLDERS_PATH)
	.filter((file) => !/\.tsx/.test(file));

const mdxData = POSTS_FOLDERS.map((file) => {
	const mdxFile = fs
		.readdirSync(path.join(POSTS_FOLDERS_PATH, file))
		.filter((mdx) => /\.md?$/.test(mdx))[0];
	const mdxFilePath = path.join(POSTS_FOLDERS_PATH, file, mdxFile);
	const content = fs.readFileSync(mdxFilePath, 'utf8');
	const matter = grayMatter(content);
	return matter.content;
});

// Splitting Text
const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
	separators: [','],
});

export async function GET() {
	const docOutput = await splitter.createDocuments(mdxData);

	let textArr: string[] = [];
	docOutput.forEach((Document) => {
		textArr.push(Document.pageContent);
	});

	// Embedding
	const embeddings = new OpenAIEmbeddings({
		openAIApiKey: OPENAI_API_KEY,
		modelName: 'text-embedding-3-small',
	});

	const vectors = await embeddings.embedDocuments(textArr);

	let insertObj: { text: string; $vector: number[] }[] = [];
	if (
		textArr.length !== vectors.length ||
		textArr.length === 0 ||
		vectors.length === 0
	) {
		return null;
	}
	textArr.map((k, i) =>
		insertObj.push({
			text: k,
			$vector: vectors[i],
		})
	);

	// Load embeddings in AstraDB
	const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_URL);

	const collection = await astraDb.collection('demo');
	try {
		const len = insertObj.length;
		for (let i = 0; i <= len; i = i + 20) {
			let insertionData = insertObj.slice(i, i + 20);
			const insertData = await collection.insertMany(insertionData);
			console.log(i, insertData);
		}
	} catch (e) {
		console.error(e);
	}

	return Response.json({ msg: 'Data loaded successfully!' });
}

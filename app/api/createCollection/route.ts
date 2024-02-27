import { AstraDB } from '@datastax/astra-db-ts';

export async function GET() {
	const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_URL } = process.env;
	const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_URL);

	try {
		const { status } = await astraDb.createCollection('demo', {
			vector: {
				dimension: 1536,
				metric: 'cosine',
			},
		});
		if (status && status.ok === 1) {
			return Response.json({ message: 'Collection Created' });
		}
		return Response.json({ message: 'An error occured' });
	} catch (e) {
		console.error(e);
	}
}

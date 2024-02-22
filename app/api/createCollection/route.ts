import { AstraDB } from '@datastax/astra-db-ts';

export async function GET() {
	const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_URL } = process.env;
	const astraDb = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_URL);

	// const isCollectionPresent = (await astraDb.collection('blog')) ? true : false;

	// if (isCollectionPresent) {
	// 	return Response.json({ message: 'Collection is already present' });
	// }

	try {
		const { status } = await astraDb.createCollection('blog', {
			vector: {
				dimension: 1536,
				metric: 'cosine',
			},
		});
		if (status.ok === 1) {
			return Response.json({ message: 'Collection Created' });
		}
		return Response.json({ message: 'Collection already created' });
	} catch (e) {
		throw Error(e);
	}
}

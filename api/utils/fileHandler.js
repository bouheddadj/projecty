import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../data/gameData.json');

export async function readData() {
	try {
		const content = await readFile(filePath, 'utf-8');
		return JSON.parse(content);
	} catch (err) {
		console.error('Erreur lecture JSON :', err);
		return null;
	}
}

export async function writeData(data) {
	try {
		await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
	} catch (err) {
		console.error('Erreur écriture JSON :', err);
	}
}


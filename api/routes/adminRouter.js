import express from 'express';
import { readData, writeData } from '../utils/fileHandler.js';

const adminRouter = express.Router();

adminRouter.post('/setZRR', async (req, res) => {
	const { point1, point2 } = req.body;
	if (!point1 || !point2 || point1.length !== 2 || point2.length !== 2) {
		return res.status(400).send('Invalid ZRR points');
	}

	const data = await readData();
	data.zrr = {
		no: point1,
		se: point2
	};

	await writeData(data);
	res.send('ZRR set successfully');
});

adminRouter.post('/setTTL', async (req, res) => {
	const { ttl } = req.body;
	if (!ttl || typeof ttl !== 'number' || ttl <= 0) {
		return res.status(400).send('Invalid TTL value');
	}

	const data = await readData();
	data.ttl = ttl;
	await writeData(data);

	res.send(`TTL set to ${ttl} minute(s)`);
});

adminRouter.post('/setSpecies', async (req, res) => {
	const { playerId, species } = req.body;
	if (!playerId || (species !== 'voleur' && species !== 'policier')) {
		return res.status(400).send('Invalid species or playerId');
	}

	const data = await readData();
	data.players = data.players || [];

	const index = data.players.findIndex((p) => p.id === playerId);

	if (index !== -1) {
		data.players[index].species = species;
	} else {
		data.players.push({ id: playerId, species });
	}

	await writeData(data);
	res.send(`Player ${playerId} set to species ${species}`);
});

adminRouter.post('/triggerShowcase', async (req, res) => {
	const { position } = req.body;
	if (!position || !Array.isArray(position) || position.length !== 2) {
		return res.status(400).send('Invalid position');
	}

	const data = await readData();
	data.vitrines = data.vitrines || [];

	const newId = `vitrine-${Date.now()}`;
	const ttl = data.ttl || 60; // Par défaut 60 si non défini

	const newVitrine = {
		id: newId,
		position,
		TTL: ttl,
		ouverte: true
	};

	data.vitrines.push(newVitrine);
	await writeData(data);

	res.send(`Showcase ${newId} created at position ${position}`);
});

export default adminRouter;


import express from 'express';
import { readData, writeData } from '../utils/fileHandler.js';

const gameRouter = express.Router();

gameRouter.post('/position', async (req, res) => {
	const { playerId, position } = req.body;
	if (!playerId || !Array.isArray(position) || position.length !== 2) {
		return res.status(400).json({ error: 'Invalid data' });
	}

	const data = await readData();
	const playerIndex = data.players.findIndex((p) => p.id === playerId);

	if (playerIndex !== -1) {
		data.players[playerIndex].position = position;
	} else {
		data.players.push({ id: playerId, position });
	}

	await writeData(data);
	res.json({ message: 'Position updated' });
});

gameRouter.get('/resources', async (req, res) => {
	const data = await readData();

	const visible = [
		...data.players.filter((p) => p.position),
		...data.vitrines.filter((v) => v.TTL > 0)
	];

	res.json(visible);
});

gameRouter.post('/vitrine/:id/process', async (req, res) => {
	const { position } = req.body;
	const { id } = req.params;

	if (!position || !Array.isArray(position)) {
		return res.status(400).json({ error: 'Invalid request' });
	}

	const data = await readData();
	const vitrine = data.vitrines.find((v) => v.id === id);
	if (!vitrine) return res.status(404).json({ error: 'Vitrine not found' });

	const distance = Math.sqrt(
		Math.pow(vitrine.position[0] - position[0], 2) +
		Math.pow(vitrine.position[1] - position[1], 2)
	);

	if (distance > 0.005) {
		return res.status(400).json({ error: 'Too far from vitrine' });
	}

	vitrine.TTL = Math.max(0, vitrine.TTL - 1);
	if (vitrine.TTL === 0) {
		data.vitrines = data.vitrines.filter((v) => v.id !== id);
	}

	await writeData(data);
	res.json({ message: 'Vitrine processed', TTL: vitrine.TTL });
});

gameRouter.post('/capture', async (req, res) => {
	const { fromId, targetId } = req.body;

	if (!fromId || !targetId) {
		return res.status(400).json({ error: 'Missing player IDs' });
	}

	const data = await readData();
	const from = data.players.find((p) => p.id === fromId);
	const target = data.players.find((p) => p.id === targetId);
	if (!from || !target) return res.status(404).json({ error: 'Players not found' });

	const distance = Math.sqrt(
		Math.pow(from.position[0] - target.position[0], 2) +
		Math.pow(from.position[1] - target.position[1], 2)
	);

	if (distance > 0.005) {
		return res.status(400).json({ error: 'Too far to capture' });
	}

	// Tu peux ajouter ici une maj de score, statut, etc.
	res.json({ message: 'Capture succeeded' });
});

gameRouter.get('/zrr', async (req, res) => {
	const data = await readData();
	if (!data.zrr) return res.status(404).json({ error: 'ZRR not defined' });
	res.json(data.zrr);
});

export default gameRouter;


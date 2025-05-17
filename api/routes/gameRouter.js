import express from 'express';
import { readData, writeData } from '../utils/fileHandler.js';

const gameRouter = express.Router();

gameRouter.get('/resources', async (req, res) => {
	const data = await readData();
	const userSpecies = req.user.species;

	const players = (data.players || []).filter(
		p => p.position && p.species === userSpecies
	);
	const vitrines = (data.vitrines || []).filter(v => v.TTL > 0);

	res.json([...players, ...vitrines]);
});

gameRouter.put('/resources/:id/position', async (req, res) => {
	const { position } = req.body;

	if (!Array.isArray(position) || position.length !== 2) {
		return res.status(400).json({ error: 'Invalid position format' });
	}

	const data = await readData();
	data.players = data.players || [];

	const playerId = req.user.id;
	const species = req.user.species;

	let player = data.players.find(p => p.id === playerId);

	if (!player) {
		player = { id: playerId, species, position };
		data.players.push(player);
	} else {
		player.position = position;
	}

	await writeData(data);
	res.status(204).send(); // conforme à Swagger
});

gameRouter.post('/resources/:resourceId', async (req, res) => {
	const { resourceId } = req.params;
	const { operationType } = req.body;

	const userId = req.user.id;
	const userSpecies = req.user.species;

	const data = await readData();

	// Récupération des deux entités concernées
	const source = data.players.find(p => p.id === userId);
	const target = data.players.find(p => p.id === resourceId) ||
	               data.vitrines?.find(v => v.id === resourceId);

	if (!source || !source.position || !target || !target.position) {
		return res.status(404).json({ error: 'Resource or player not found' });
	}

	// Calcul distance
	const distance = Math.sqrt(
		Math.pow(source.position[0] - target.position[0], 2) +
		Math.pow(source.position[1] - target.position[1], 2)
	);

	if (distance > 0.005) {
		return res.status(403).json({ error: 'Too far from target' });
	}

	switch (operationType) {
		case 'capture thief':
			if (userSpecies !== 'POLICIER' || target.species !== 'VOLEUR') {
				return res.status(400).json({ error: 'Invalid capture attempt' });
			}
			target.captured = true;
			source.terminated = (source.terminated || 0) + 1;
			break;

		case 'steal showcase content':
			if (userSpecies !== 'VOLEUR' || !target.TTL) {
				return res.status(400).json({ error: 'Invalid steal attempt' });
			}
			target.TTL = Math.max(0, target.TTL - 1);
			source.showcases = (source.showcases || 0) + 1;
			break;

		case 'close showcase':
			if (userSpecies !== 'POLICIER' || !target.TTL) {
				return res.status(400).json({ error: 'Invalid close attempt' });
			}
			target.TTL = 0;
			source.showcases = (source.showcases || 0) + 1;
			break;

		default:
			return res.status(400).json({ error: 'Invalid operationType' });
	}

	await writeData(data);
	res.status(204).send(); 
});

gameRouter.get('/zrr', async (req, res) => {
	const data = await readData();
	if (!data.zrr) return res.status(404).json({ error: 'ZRR not defined' });
	res.json([data.zrr.point1, data.zrr.point2]);
});

export default gameRouter;


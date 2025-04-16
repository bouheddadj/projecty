import express from 'express';
import fs from 'fs';
import path from 'path';

const gameRouter = express.Router();

// data game
const dataFilePath = path.resolve('data.json');

const readData = () => {
	try {
		const data = fs.readFileSync(dataFilePath, 'utf-8');
		return JSON.parse(data);
	} catch {
		return {};
	}
};

const writeData = (data) => {
	fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

gameRouter.get('/ressource', (req, res) => {
	res.json({ message: 'Resource fetched successfully' });
});

gameRouter.get('/ressource/:id', (req, res) => {
	res.json({ message: `Resource ${req.params.id} fetched successfully` });
});

gameRouter.get('/ressource/:id/position', (req, res) => {
	res.json({
		message: `Resource ${req.params.id} position fetched successfully`,
	});
});

gameRouter.get('/resources', (req, res) => {
	const data = readData();
	const resources = data.players.concat(data.vitrines || []);
	res.json(resources);
});

gameRouter.post('/resources/:resourceId', (req, res) => {
	res.json({ message: 'Resource created successfully' });
});

gameRouter.put(
	'/resources/:resourceId/position',

	(req, res) => {
		return res.status(501).json({
			error: 'Not implemented yet',
		});
	}
);

// Update player position
gameRouter.post('/player/position', (req, res) => {
	const { position } = req.body;
	if (!position || position.length !== 2) {
		return res.status(400).json({ error: 'Invalid position data' });
	}

	const data = readData();
	data.players = data.players || [];
	const playerIndex = data.players.findIndex((p) => p.id === req.body.playerId);

	if (playerIndex !== -1) {
		data.players[playerIndex].position = position;
	} else {
		data.players.push({ id: req.body.playerId, position });
	}

	writeData(data);
	res.json({ message: 'Position updated successfully' });
});

// Process a showcase (vitrine)
gameRouter.post('/vitrine/:id/process', (req, res) => {
	if (!req.params.id || !req.body.position) {
		return res.status(400).json({ error: 'Invalid request data' });
	}
	const { id } = req.params;
	const { position } = req.body;

	const data = readData();
	const vitrine = (data.vitrines || []).find((v) => v.id === id);

	if (!vitrine) {
		return res.status(404).json({ error: 'Vitrine not found' });
	}

	const distance = Math.sqrt(
		Math.pow(vitrine.position[0] - position[0], 2) +
			Math.pow(vitrine.position[1] - position[1], 2)
	);

	if (distance > 0.005) {
		return res.status(400).json({ error: 'Too far from the vitrine' });
	}

	vitrine.TTL = Math.max(0, vitrine.TTL - 1);
	if (vitrine.TTL === 0) {
		data.vitrines = data.vitrines.filter((v) => v.id !== id);
	}

	writeData(data);
	res.json({ message: 'Vitrine processed successfully', TTL: vitrine.TTL });
});

// Get ZRR limits
gameRouter.get('/zrr', (req, res) => {
	const data = readData();
	if (!data.zrr) {
		return res.status(404).json({ error: 'ZRR not defined' });
	}
	res.json(data.zrr);
});

export default gameRouter;

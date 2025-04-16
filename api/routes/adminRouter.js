import express from 'express';
import fs from 'fs';
import path from 'path';

const adminRouter = express.Router();
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

adminRouter.post('/admin/setZRR', (req, res) => {
	const { point1, point2 } = req.body;
	if (!point1 || !point2 || point1.length !== 2 || point2.length !== 2) {
		return res.status(400).send('Invalid ZRR points');
	}

	const data = readData();
	data.zrr = { point1, point2 };
	writeData(data);

	res.send('ZRR set successfully');
});

adminRouter.post('/admin/setTTL', (req, res) => {
	const { ttl } = req.body;
	if (!ttl || typeof ttl !== 'number' || ttl <= 0) {
		return res.status(400).send('Invalid TTL value');
	}

	const data = readData();
	data.ttl = ttl;
	writeData(data);

	res.send(`TTL set to ${ttl} minute(s)`);
});

// Route to specify the species of a player
adminRouter.post('/admin/setSpecies', (req, res) => {
	const { playerId, species } = req.body;
	if (species !== 'voleur' && species !== 'policier') {
		return res.status(400).send('Invalid species');
	}
	res.send(`Player ${playerId} set to species ${species}`);
});

// Route to trigger the appearance of a showcase
adminRouter.post('/admin/triggerShowcase', (req, res) => {
	// Logic to trigger the appearance of a showcase
	res.send('Showcase triggered successfully');
});

export default adminRouter;

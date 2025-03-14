import express from 'express';

const apiRouter = express.Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const origin = req.headers['origin'];
	console;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({
			error: 'Token manquant ou invalide',
		});
	}
};

apiRouter.get('/ressource', (req, res) => {
	// Logic to get all resources
	res.json({ message: 'Hello, World!' });
});

apiRouter.get('/ressource/:id', (req, res) => {
	isAuthenticated(req, res);
	const id = req.params.id;
	res.json({ message: `Ressource ${id}` });
});

apiRouter.get('/ressource/:id/position', (req, res) => {
	isAuthenticated(req, res);
	// Logic to get resource position
	res.json({ message: `Position of Ressource ${req.params.id}` });
});

apiRouter.get('/resources', (req, res) => {
	isAuthenticated(req, res);
	// Logic to get all resources
	res.status(200).json([]);
});

apiRouter.post('/resources/:resourceId', (req, res) => {
	isAuthenticated(req, res);
	const { resourceId } = req.params;
	const { operationType } = req.body;
	res.status(204).send();
});

apiRouter.put('/resources/:resourceId/position', (req, res) => {
	isAuthenticated(req, res);
	const { resourceId } = req.params;
	const { position } = req.body;
	// Logic to update resource's position
	res.status(204).send();
});

apiRouter.get('/zrr', (req, res) => {
	// Logic to get ZRR limits
	res.status(200).json([]);
});

export default apiRouter;

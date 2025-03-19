import express from 'express';

const gameRouter = express.Router();

let URL_USERS_API = '';
let URL_EXPRESS = '';

(async function fetchConfig() {
	try {
		const configResponse = await fetch('config.json');
		const config = await configResponse.json();
		URL_USERS_API = config.URL_USERS_API;
		URL_EXPRESS = config.URL_EXPRESS;
	} catch (error) {
		return error;
	}
})();

// Middleware qui verifie si l'utilisateur est authentifié
// On envoie une requete avec le token dans le header vers l'api user sur le endpoints /authenticate
// Non tester
const isAuthenticated = async (req, res, next) => {
	try {
		const authHeader = req.headers['authorization'];
		const origin = req.headers['origin'];

		if (!authHeader || !authHeader.startsWith('Bearer ') || !origin) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const response = await fetch(`${URL_USERS_API}/authenticate`, {
			headers: { Authorization: authHeader, Origin: origin },
		});

		if (response.status === 204) {
			return next();
		} else {
			return res.status(401).json({ error: 'Unauthorized' });
		}
	} catch (error) {
		return res.status(500).json({ error: 'Internal Server Error' });
	}
};

gameRouter.get('/ressource', isAuthenticated, (req, res) => {
	// Logic to get resource
	res.json({ message: 'Resource fetched successfully' });
});

gameRouter.get('/ressource/:id', isAuthenticated, (req, res) => {
	// Logic to get resource by id
	res.json({ message: `Resource ${req.params.id} fetched successfully` });
});

gameRouter.get('/ressource/:id/position', isAuthenticated, (req, res) => {
	// Logic to get resource's position
	// User have to be authenticated
});

gameRouter.get('/resources', isAuthenticated, (req, res) => {
	// Logic to get all resources
	// User have to be authenticated
});

gameRouter.post('/resources/:resourceId', isAuthenticated, (req, res) => {
	// Logic to create a resource
	// User have to be authenticated
});

gameRouter.put(
	'/resources/:resourceId/position',
	isAuthenticated,
	(req, res) => {
		// Logic to update resource's position
		// User have to be authenticated
	}
);

gameRouter.get('/zrr', isAuthenticated, (req, res) => {
	// Logic to get ZRR
	// User have to be authenticated
});

export default gameRouter;

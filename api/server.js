import express from 'express';
import dotenv from 'dotenv';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import gameRouter from './routes/gameRouter.js';
import adminRouter from './routes/adminRouter.js';

const envFile =
	process.env.NODE_ENV === 'production'
		? '.env.production'
		: '.env.development';
dotenv.config({ path: envFile });

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const BASE_URL_USERS = process.env.BASE_URL_USERS;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
	res.sendFile('public/index.html', { root: __dirname });
});

app.get('/static', (req, res) => {
	res.sendFile('public/index.html', { root: __dirname });
});

// Middleware pour verifier si l'utilisateur est admin
const isAdmin = async (req, res, next) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.split(' ')[1];

	try {
		const response = await fetch(`${BASE_URL_USERS}/users/authenticate`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const payload = await response.json();

		if (payload.species !== 'admin') {
			return res.status(403).json({ error: 'Forbidden' });
		}

		next();
	} catch (e) {
		return res
			.status(500)
			.json({ error: 'Internal Server Error', details: e.message });
	}
};

// Middleware pour verifier si l'utilisateur est authentifier

const isAuthenticated = async (req, res, next) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.split(' ')[1];

	try {
		const response = await fetch(`${BASE_URL_USERS}/users/authenticate`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		next();
	} catch (e) {
		return res
			.status(500)
			.json({ error: 'Internal Server Error', details: e.message });
	}
};

app.use('/api/admin', isAdmin, adminRouter);

app.use('/api/game', isAuthenticated, gameRouter);

// Catch-all route for undefined paths
app.use((req, res) => {
	res.status(404).send("Sorry, can't find that!");
});

// Démarrer le serveur
app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
	process.env.NODE_ENV === 'production'
		? console.log('Environnement de production')
		: console.log('Environnement de développement');
	console.log(`Base URL Users: ${BASE_URL_USERS}`);
});

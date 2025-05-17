import express from 'express';
import dotenv from 'dotenv';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import gameRouter from './routes/gameRouter.js';
import adminRouter from './routes/adminRouter.js';

const envFile = process.env.NODE_ENV === 'production'
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

const isAuthenticated = async (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const origin = req.headers['origin'] || 'http://localhost';

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.split(' ')[1];

	try {
		const url = `${BASE_URL_USERS}/authenticate?jwt=${token}&origin=${encodeURIComponent(origin)}`;
                console.log("🧪 Vérification URL AUTH :", url);
		const response = await fetch(url, { method: 'GET' });

		if (!response.ok) {
			return res.status(401).json({ error: 'Unauthorized: token rejected' });
		}

		// Décodage local du JWT (en base64)
		const payload = parseJwt(token);
		req.user = {
			id: payload.sub,
			species: payload.species,
		};

		next();
	} catch (err) {
		res.status(500).json({ error: 'Internal Server Error', details: err.message });
	}
};

function parseJwt(token) {
	const base64 = token.split('.')[1];
	return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
}
const isAdmin = async (req, res, next) => {
	await isAuthenticated(req, res, () => {
		if (req.user?.species !== 'ADMIN') {
			return res.status(403).json({ error: 'Forbidden: Admin only' });
		}
		next();
	});
};

// Routes sécurisées
app.use('/api/game', isAuthenticated, gameRouter);
app.use('/api/admin', isAdmin, adminRouter);

// 404
app.use((req, res) => {
	res.status(404).send("Sorry, can't find that!");
});

// Lancement serveur
app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
	console.log(
		process.env.NODE_ENV === 'production'
			? 'Environnement de production'
			: 'Environnement de développement'
	);
	console.log(`🔗 BASE_URL_USERS = ${BASE_URL_USERS}`);
});


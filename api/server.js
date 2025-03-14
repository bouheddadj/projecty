import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { gameRouter } from './routes/gameRouter.js';

const app = express();
app.use(express.json());

const PORT = 3000;
// Middleware pour désactiver les restrictions CORS
app.use((req, res, next) => {
	res.status(404).send("Sorry can't find that!");
	next();
});

// app.use((req, res, next) => {
// 	res.setHeader('Access-Control-Allow-Origin', '*');

// 	res.setHeader('Access-Control-Allow-Headers', '*');

// 	res.setHeader('Access-Control-Allow-Methods', '*');

// 	if (req.method === 'OPTIONS') {
// 		return res.sendStatus(200);
// 	}
// 	next();
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
	res.sendFile('public/index.html', { root: __dirname });
});

app.get('/static', (req, res) => {
	res.sendFile('public/index.html', { root: __dirname });
});

app.use('/api/game', gameRouter);

app.use('/api/admin', adminRouter);


// Démarrer le serveur
app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

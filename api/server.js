import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import gameRouter from './routes/gameRouter.js';
import adminRouter from './routes/adminRouter.js';

const app = express();
app.use(express.json());

const PORT = 3000;

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

// Catch-all route for undefined paths
app.use((req, res) => {
	res.status(404).send("Sorry, can't find that!");
});

// Démarrer le serveur
app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

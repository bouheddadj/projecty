import express from 'express';
import { jwtDecode } from 'jwt-decode';

const app = express();

const PORT = 3000;
// Middleware pour désactiver les restrictions CORS
app.use((req, res, next) => {
	// Autoriser toutes les origines
	res.setHeader('Access-Control-Allow-Origin', '*');

	// Autoriser tous les en-têtes
	res.setHeader('Access-Control-Allow-Headers', '*');

	// Autoriser toutes les méthodes HTTP
	res.setHeader('Access-Control-Allow-Methods', '*');

	// Répondre immédiatement aux requêtes préliminaires OPTIONS
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}

	next();
});

app.get('/', (req, res) => {
	const authHeader = req.headers.authorization;
	const origin = req.headers.origin;
	console.log(`Authorization: ${authHeader}`);

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Token manquant ou invalide' });
	}
	console.log(`Authorization: ${authHeader}`);
	console.log(`Origin: ${origin}`);

	const token = authHeader.split(' ')[1];

	try {
		const decodedToken = jwtDecode(token);

		if (!decodedToken) {
			return res.status(403).json({ error: 'Token invalide' });
		}

		if (decodedToken.origin && decodedToken.origin !== origin) {
			return res.status(403).json({ error: 'Origine non autorisée' });
		}

		// Utiliser sub comme user_id si user_id n'existe pas
		const userId =
			decodedToken.user_id ||
			decodedToken.sub ||
			decodedToken.name ||
			'Utilisateur';

		// Envoyer une seule réponse
		return res.status(200).send(`Bonjour ${userId}`);
	} catch (error) {
		console.error('Erreur de décodage du token:', error);
		res.status(403).json({ error: 'Erreur lors de la validation du token' });
	}
});

// Démarrer le serveur
app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

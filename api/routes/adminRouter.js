import express from 'express';

const adminRouter = express.Router();

// Middleware to check if the user is authenticated and has admin role
const isAuthenticatedAdmin = (req, res, next) => {
	if (req.isAuthenticated() && req.user.role === 'admin') {
		return next();
	}
	res.status(403).send('Forbidden');
};

adminRouter.post('/admin/setZRR', isAuthenticatedAdmin, (req, res) => {
	const { point1, point2 } = req.body;
	res.send('ZRR set successfully');
});

// Route to set the initial TTL
adminRouter.post('/admin/setTTL', isAuthenticatedAdmin, (req, res) => {
	const { ttl } = req.body;
	// Logic to set the TTL
	res.send(`TTL set to ${ttl || 1} minute(s)`);
});

// Route to specify the species of a player
adminRouter.post('/admin/setSpecies', isAuthenticatedAdmin, (req, res) => {
	const { playerId, species } = req.body;
	if (species !== 'voleur' && species !== 'policier') {
		return res.status(400).send('Invalid species');
	}
	res.send(`Player ${playerId} set to species ${species}`);
});

// Route to trigger the appearance of a showcase
adminRouter.post('/admin/triggerShowcase', isAuthenticatedAdmin, (req, res) => {
	// Logic to trigger the appearance of a showcase
	res.send('Showcase triggered successfully');
});

export default adminRouter;

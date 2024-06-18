// mongoBackend.js

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json()); // Pour pouvoir lire les corps des requêtes JSON

// Connexion MongoDB
const mongoUrl = "mongodb+srv://admin:adminces'eat@ceseat.rkfov9n.mongodb.net/";
const dbName = "CES'EAT";
let mongoClient;
let notificationsCollection: any;

MongoClient.connect(mongoUrl)
    .then(client => {
        console.log('Connecté à la base de données MongoDB');
        mongoClient = client;
        const db = mongoClient.db(dbName);
        notificationsCollection = db.collection('Notifications');
    })
    .catch(err => {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    });

app.post('/notifications', async (req, res) => {
    const { message, created_at } = req.body;

    try {
        await notificationsCollection.insertOne({
            message,
            created_at: new Date(created_at)
        });
        res.status(200).send('Notification added to MongoDB');
    } catch (err) {
        console.error('Erreur lors de l\'insertion de la notification dans MongoDB:', err);
        res.status(500).send('Error inserting notification');
    }
});

const PORT = 5040;
app.listen(PORT, () => {
    console.log(`MongoDB Server is running on port ${PORT}`);
});

export default app;

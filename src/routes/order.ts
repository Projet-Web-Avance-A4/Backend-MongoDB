import { Router } from 'express';
import { MongoClient } from 'mongodb';
import databaseConnection from '../databaseconnection';

const orderRouter = Router();

orderRouter.get('/getOrders', async (req: any, res: any) => {
    const uri = "mongodb+srv://admin:adminces'eat@ceseat.rkfov9n.mongodb.net/CES'EAT";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const database = client.db();
        const commandesCollection = database.collection("Commandes");

        const orders = await commandesCollection.find().toArray();
        res.json(orders);

    } catch (e) {
        console.error('Error fetching commandes:', e);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await client.close();
    }
})

export default orderRouter;

import { Router } from 'express';
import { MongoClient } from 'mongodb';

const orderRouter = Router();

orderRouter.get('/getOrders', async (req: any, res: any) => {
    const uri = "mongodb+srv://admin:adminces'eat@ceseat.rkfov9n.mongodb.net/CES'EAT";
    const client = new MongoClient(uri);
    try {
        await client.connect();

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

orderRouter.post('/assignDeliveryman', async (req: any, res: any) => {
    const uri = "mongodb+srv://admin:adminces'eat@ceseat.rkfov9n.mongodb.net/CES'EAT";
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db();
        const commandesCollection = database.collection("Commandes");

        const { idOrder, idDriver, nameDriver, phoneDriver } = req.body;

        await commandesCollection.updateOne(
            { order_id: idOrder },
            {
                $set: {
                    "driver.driver_id": idDriver,
                    "driver.name": nameDriver,
                    "driver.phone": phoneDriver,
                }
            }
        )
        res.status(200).json({ message: 'Assignation du livreur réussite' });
    } catch (e) {
        console.error('Error fetching commandes:', e);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await client.close();
    }
})

orderRouter.post('/updateOrderStatus', async (req: any, res: any) => {
    const uri = "mongodb+srv://admin:adminces'eat@ceseat.rkfov9n.mongodb.net/CES'EAT";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db();
        const commandesCollection = database.collection("Commandes");
        const { idOrder, newStatus } = req.body;

        await commandesCollection.updateOne(
            { order_id: idOrder },
            {
                $set: {
                    "order_status": newStatus,
                }
            }
        )
        res.status(200).json({ message: 'Mise à jour du status de la commande réussite' });
    } catch (e) {
        console.error('Error Update Error Status:', e);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await client.close();
    }
})

export default orderRouter;

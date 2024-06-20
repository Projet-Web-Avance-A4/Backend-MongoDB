import { Router } from 'express';
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb';

dotenv.config();

const orderRouter = Router();

const uri = process.env.URI_MONGODB!;

export interface Menu {
    id_menu: number;

    price_menu: number;

    name_menu: string;

    id_dish: number;

    category: number;

    id_restorer: number;
}

export interface Article {
    id_article: number;

    name_article: string;

    id_restorer: number;

    category_article: string;

    price_article: number;
}

export type CartProduct = Article | Menu;

orderRouter.post('/list', async (req: any, res: any) => {
    const customer_id = req.body.id;
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db("CES'EAT");
        const commandesCollection = database.collection("Commandes");

        const commandesListe = await commandesCollection.find({ "customer.customer_id": customer_id }).toArray();
        res.json(commandesListe);
    } catch (e) {
        console.error('Error fetching commandes:', e);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await client.close();
    }
})

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

orderRouter.post('/inprogress', async (req: any, res: any) => {
    const customer_id = req.body.id;
    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db("CES'EAT");
        const commandesCollection = database.collection("Commandes");

        try {
            const order = await commandesCollection.findOne({
                "customer.customer_id": customer_id,
                "order_status": "in_progress"
            });

            if (order) {
                res.json(order);
            } else {
                const orderInDelivery = await commandesCollection.findOne({
                    "customer.customer_id": customer_id,
                    "order_status": "in_delivery"
                });

                if (orderInDelivery) {
                    res.json(orderInDelivery);
                } else {
                    res.status(404).json({ message: 'No orders found in progress or in delivery' });
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error connecting to database:', error);
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

orderRouter.post('/creation', async (req: any, res: any) => {
    const userData = req.body.userData;
    const cart: CartProduct[] = req.body.cart;
    const userId = req.body.cart[0].id_restorer;
    let totalPrice: number = 0;
    let currentDate: Date = new Date();

    for (let i = 0; i < cart.length; i++) {
        const product = cart[i];
        if ('price_article' in product) {
            totalPrice += product.price_article;
        } else if ('price_menu' in product) {
            totalPrice += product.price_menu;
        }
    }

    const response = await fetch('http://localhost:4000/client/getClient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: cart[0].id_restorer })
    })
    const restorer = await response.json();

    const client = new MongoClient(uri);

    try {
        await client.connect();

        const database = client.db("CES'EAT");
        const commandesCollection = database.collection("Commandes");

        const count = await commandesCollection.countDocuments();

        const order = {
            order_id: count,
            customer: {
                customer_id: userData.id_user,
                name: userData.name + ' ' + userData.surname,
                phone: userData.phone,
                email: userData.mail,
                address: {
                    street: userData.street,
                    city: userData.city,
                    postal_code: userData.postal_code
                }
            },
            restaurant: {
                restaurant_id: restorer!.id_user,
                name: restorer!.name + ' ' + restorer!.surname,
                phone: restorer!.phone,
                address: {
                    street: restorer!.street,
                    city: restorer!.city,
                    postal_code: restorer!.postal_code
                }
            },
            items: cart,
            total_price: totalPrice,
            order_status: 'checked',
            verification_code: userData.phone.slice(-4),
            payment: {
                method: 'creditcard',
                transaction_id: count,
                amount: totalPrice + 5,
                currency: 'EUR',
                payment_time: currentDate
            },
            driver: {}
        }

        await commandesCollection.insertOne(order);
        res.status(200).json({});
    } catch (e) {
        console.error('Error fetching command in delivery:', e);
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
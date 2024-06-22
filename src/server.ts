import express from 'express';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import orderRouter from './routes/order';
import dotenv from 'dotenv'
import notifRouter from './routes/notif'

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());

app.use(cors({
    origin: 'http://localhost:4000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

let port: number = parseInt(process.env.BACKEND_MONGODB_PORT || '5001', 10);

function createServer() {
    const server = http.createServer(app);

    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    server.on('error', (error: any) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use. Trying next port...`);
            port++;
            createServer();
        } else {
            throw error;
        }
    });
}

    app.use('/order', orderRouter);
    app.use('/notifications', notifRouter);

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err.stack);
        res.status(500).send('Erreur côté serveur');
    });

    app.use((req: express.Request, res: express.Response) => {
        res.status(404).send('Impossible de trouver');
    });

    createServer();

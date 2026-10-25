import express, { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from './middlewares/errorMiddleware';

import api from './api/index';

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173", "https://gate.nodenomad.in", "http://192.168.29.184:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server is running!');
});

app.use('/api/v1', api);


app.use(notFound);
app.use(errorHandler);

export default app;
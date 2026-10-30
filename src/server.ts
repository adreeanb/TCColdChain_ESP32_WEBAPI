import express from 'express';
//import { errorHandler } from './middlewares/errorHandler.js'
import cors from 'cors';

import { routes } from './routes/index.js';
import { iniciarMQTTSubscriber } from './services/mqtt/mqttSubscriber.js';
import { iniciarPurgeExpiredTelemetryJob } from './jobs/purgeExpiredTelemetry.js';

const app = express();

// Origens separadas por vírgula em CORS_ORIGINS
const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [
  'http://localhost:5173',
  'http://192.168.1.77:5173',
];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json());
app.use(routes);

//app.use(errorHandler);

const PORT = process.env.PORT || 3334;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

iniciarMQTTSubscriber();
iniciarPurgeExpiredTelemetryJob();

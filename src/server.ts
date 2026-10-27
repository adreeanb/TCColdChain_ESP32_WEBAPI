import express from 'express';
//import { errorHandler } from './middlewares/errorHandler.js'
import cors from 'cors';

import { routes } from './routes/index.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.77:5173'], // Adicione o protocolo http:// e as portas corretas
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(express.json());
app.use(routes);

//app.use(errorHandler);

const PORT = process.env.PORT || 3334;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

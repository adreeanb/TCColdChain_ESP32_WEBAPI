import type { Request, Response } from 'express';
import { CreateTemperatureReadingService } from '../../services/telemetry/CreateTemperatureReadingService.js';

class CreateTemperatureReadingController {
  async handle(req: Request, res: Response) {
    // O hardware (ESP32 via broker MQTT/HTTP) enviará estes dados no JSON
    const { coldUnitId, temperature, sourceType, timestamp } = req.body;

    const createTemperatureReadingService = new CreateTemperatureReadingService();

    try {
      const reading = await createTemperatureReadingService.execute({
        coldUnitId,
        temperature,
        sourceType,
        timestamp
      });

      // Retorna 201 Created rápido para liberar o hardware/broker
      return res.status(201).json(reading);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { CreateTemperatureReadingController };
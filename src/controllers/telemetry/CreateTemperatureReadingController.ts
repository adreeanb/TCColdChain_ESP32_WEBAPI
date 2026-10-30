import type { Request, Response } from 'express';
import { IngestTelemetryService } from '../../services/telemetry/IngestTelemetryService.js';

class CreateTemperatureReadingController {
  async handle(req: Request, res: Response) {
    // O hardware (ESP32 via broker MQTT/HTTP) enviará estes dados no JSON
    const { macAddress, temperature, sourceType, timestamp } = req.body;

    const ingestTelemetryService = new IngestTelemetryService();

    try {
      const result = await ingestTelemetryService.execute({
        macAddress,
        temperature,
        sourceType,
        timestamp
      });

      if (result.status === 'DISCARDED') {
        return res.status(404).json({ error: "Placa não cadastrada ou desativada." });
      }

      if (result.status === 'QUARANTINED') {
        // 202 Accepted: o dado foi retido até o vínculo da placa com uma unidade
        return res.status(202).json(result.unboundTelemetry);
      }

      // Retorna 201 Created rápido para liberar o hardware/broker
      return res.status(201).json(result.reading);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { CreateTemperatureReadingController };

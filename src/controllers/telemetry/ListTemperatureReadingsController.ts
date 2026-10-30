import type { Request, Response } from 'express';
import { ListTemperatureReadingsService } from '../../services/telemetry/ListTemperatureReadingsService.js';

class ListTemperatureReadingsController {
  async handle(req: Request, res: Response) {
    const { coldUnitId } = req.params;

    if (typeof coldUnitId !== 'string') {
      return res.status(400).json({ error: 'ID da unidade fria inválido.' });
    }
    const enterpriseId = req.user.enterpriseId; 

    // 2. Filtros para o Gráfico do React (Big Data)
    const { startDate, endDate, limit, deviceId } = req.query;

    const listTemperatureReadingsService = new ListTemperatureReadingsService();

    try {
      const temperatureReadings = await listTemperatureReadingsService.execute({
        coldUnitId,
        enterpriseId,
        deviceId: deviceId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? Number(limit) : 100 // Fallback seguro
      });

      return res.json(temperatureReadings);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ListTemperatureReadingsController };
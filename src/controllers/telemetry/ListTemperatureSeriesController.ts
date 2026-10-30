import type { Request, Response } from 'express';
import { ListTemperatureSeriesService } from '../../services/telemetry/ListTemperatureSeriesService.js';

class ListTemperatureSeriesController {
  async handle(req: Request, res: Response) {
    const { coldUnitId } = req.params;

    if (typeof coldUnitId !== 'string') {
      return res.status(400).json({ error: 'ID da unidade fria inválido.' });
    }

    const { startDate, endDate, bucketMinutes } = req.query;

    const listTemperatureSeriesService = new ListTemperatureSeriesService();

    try {
      const series = await listTemperatureSeriesService.execute({
        coldUnitId,
        enterpriseId: req.user.enterpriseId,
        startDate: startDate as string,
        endDate: endDate as string,
        bucketMinutes: Number(bucketMinutes)
      });

      return res.json(series);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ListTemperatureSeriesController };

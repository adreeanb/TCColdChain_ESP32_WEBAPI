import type { Request, Response } from 'express';
import { GetColdUnitService } from '../../services/coldUnit/GetColdUnitService.js';

class GetColdUnitController {
  async handle(req: Request, res: Response) {
    // O ID vem da URL (ex: /coldUnits/uuid-da-unidade)
    const id = req.params.id;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid cold unit ID' });
    }

    const getColdUnitService = new GetColdUnitService();

    try {
      const coldUnit = await getColdUnitService.execute(id);
      return res.json(coldUnit);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export { GetColdUnitController };
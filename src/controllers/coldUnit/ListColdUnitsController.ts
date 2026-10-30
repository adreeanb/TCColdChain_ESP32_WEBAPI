import type { Request, Response } from 'express';
import { ListColdUnitsService } from '../../services/coldUnit/ListColdUnitsService.js';

class ListColdUnitsController {
  async handle(req: Request, res: Response) {
    const listColdUnitsService = new ListColdUnitsService();

    try {
      const coldUnits = await listColdUnitsService.execute(req.user.enterpriseId);
      return res.json(coldUnits);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno ao listar unidades de frio." });
    }
  }
}

export { ListColdUnitsController };
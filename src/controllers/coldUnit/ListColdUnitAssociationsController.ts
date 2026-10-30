import type { Request, Response } from 'express';
import { ListColdUnitAssociationsService } from '../../services/coldUnit/ListColdUnitAssociationsService.js';

class ListColdUnitAssociationsController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID da unidade fria inválido.' });
    }

    const listColdUnitAssociationsService = new ListColdUnitAssociationsService();

    try {
      const associations = await listColdUnitAssociationsService.execute({ id, enterpriseId: req.user.enterpriseId });
      return res.json(associations);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export { ListColdUnitAssociationsController };

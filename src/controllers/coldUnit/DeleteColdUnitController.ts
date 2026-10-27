import type { Request, Response } from 'express';
import { DeleteColdUnitService } from '../../services/coldUnit/DeleteColdUnitService.js';

class DeleteColdUnitController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const deleteColdUnitService = new DeleteColdUnitService();
    
     if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid cold unit ID' });
    }

    try {
      await deleteColdUnitService.execute(id);
      return res.json({ message: "Unidade de frio deletada com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { DeleteColdUnitController };
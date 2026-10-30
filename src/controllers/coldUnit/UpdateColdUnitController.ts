import type { Request, Response } from 'express';
import { UpdateColdUnitService } from '../../services/coldUnit/UpdateColdUnitService.js';

class UpdateColdUnitController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { name, type, minTemperature, maxTemperature, licensePlate, isFixedLocation, location } = req.body;

    const updateColdUnitService = new UpdateColdUnitService();

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid cold unit ID' });
    }
    
    try {
      const updatedColdUnit = await updateColdUnitService.execute({ id, enterpriseId: req.user.enterpriseId, name, type, minTemperature, maxTemperature, licensePlate, isFixedLocation, location });
      return res.json(updatedColdUnit);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { UpdateColdUnitController };
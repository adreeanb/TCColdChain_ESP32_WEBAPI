import type { Request, Response } from 'express';
import { CreateColdUnitService } from '../../services/coldUnit/CreateColdUnitService.js';

class CreateColdUnitController {
  async handle(req: Request, res: Response) {
    const { name, type, minTemperature, maxTemperature, licensePlate, isFixedLocation, location } = req.body;

    // O middleware isAuthenticated deve injetar o enterpriseId no req.user
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const enterpriseId = req.user.enterpriseId;

    const createColdUnitService = new CreateColdUnitService();

    try {
      const coldUnit = await createColdUnitService.execute({
        name,
        type,
        minTemperature,
        maxTemperature,
        licensePlate,
        isFixedLocation,
        location,
        enterpriseId
      });

      return res.status(201).json(coldUnit);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { CreateColdUnitController };
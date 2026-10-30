import type { Request, Response } from 'express';
import { CreateDeviceService } from '../../services/device/CreateDeviceService.js';

class CreateDeviceController {
  async handle(req: Request, res: Response) {
    const { macAddress, enterpriseId } = req.body;

    const createDeviceService = new CreateDeviceService();

    try {
      const device = await createDeviceService.execute({ macAddress, enterpriseId });
      return res.status(201).json(device);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { CreateDeviceController };

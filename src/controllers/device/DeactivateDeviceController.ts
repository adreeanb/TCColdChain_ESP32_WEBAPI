import type { Request, Response } from 'express';
import { DeactivateDeviceService } from '../../services/device/DeactivateDeviceService.js';

class DeactivateDeviceController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID da placa inválido.' });
    }

    const deactivateDeviceService = new DeactivateDeviceService();

    try {
      const device = await deactivateDeviceService.execute(id);
      return res.json(device);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { DeactivateDeviceController };

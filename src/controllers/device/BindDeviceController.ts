import type { Request, Response } from 'express';
import { BindDeviceService } from '../../services/device/BindDeviceService.js';

class BindDeviceController {
  async handle(req: Request, res: Response) {
    // O macAddress vem do QR Code impresso na placa
    const { macAddress, coldUnitId } = req.body;
    const enterpriseId = req.user.enterpriseId;

    const bindDeviceService = new BindDeviceService();

    try {
      const result = await bindDeviceService.execute({ macAddress, coldUnitId, enterpriseId });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { BindDeviceController };

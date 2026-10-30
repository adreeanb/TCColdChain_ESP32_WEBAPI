import type { Request, Response } from 'express';
import { ListUnboundDevicesService } from '../../services/device/ListUnboundDevicesService.js';

class ListUnboundDevicesController {
  async handle(req: Request, res: Response) {
    const listUnboundDevicesService = new ListUnboundDevicesService();

    try {
      const devices = await listUnboundDevicesService.execute(req.user.enterpriseId);
      return res.json(devices);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ListUnboundDevicesController };

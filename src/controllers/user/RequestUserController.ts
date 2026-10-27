import type { Request, Response } from 'express';
import { RequestUserService } from '../../services/user/RequestUserService.js';

class RequestUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;

      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const requestUserService = new RequestUserService();
      const user = await requestUserService.execute({ id, enterpriseId });

      return res.json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
export { RequestUserController };
import type { Request, Response } from 'express';
import { ListPendingUsersService } from '../../services/admin/ListPendingUsersService.js';

class ListPendingUsersController {
  async handle(req: Request, res: Response) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const service = new ListPendingUsersService();
      const users = await service.execute(enterpriseId);
      return res.json(users);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
export { ListPendingUsersController };
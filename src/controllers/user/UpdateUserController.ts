import type { Request, Response } from 'express';
import { UpdateUserService } from '../../services/user/UpdateUserService.js';

class UpdateUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      const enterpriseId = req.user.enterpriseId;

      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({ id, enterpriseId, name, email, role });

      return res.json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
export { UpdateUserController };
import type { Request, Response } from 'express';
import { DeleteUserService } from '../../services/user/DeleteUserService.js';

class DeleteUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
    
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const deleteUserService = new DeleteUserService();
      const result = await deleteUserService.execute({ id, enterpriseId });

      
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
export { DeleteUserController };
import type { Request, Response } from 'express';
import { ChangeUserStatusService } from '../../services/admin/ChangeUserStatusService.js';

class RejectUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
        
      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const service = new ChangeUserStatusService();
      const user = await service.execute({ id, enterpriseId, status: 'REJECTED' });

      return res.json({ message: "Usuário rejeitado.", user });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
export { RejectUserController };
import type { Request, Response } from 'express';
import { DeleteUserService } from '../../services/user/DeleteUserService.js';
import { resolveEnterpriseId } from '../../lib/tenant.js';

class DeleteUserController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const enterpriseId = resolveEnterpriseId(req.user, req.query.enterpriseId);

      if (typeof id !== 'string') {
        return res.status(400).json({ error: 'ID do usuário inválido.' });
      }

      const deleteUserService = new DeleteUserService();
      const result = await deleteUserService.execute({
        id,
        enterpriseId,
        actorId: req.user.id,
        actorRole: req.user.role
      });

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
export { DeleteUserController };

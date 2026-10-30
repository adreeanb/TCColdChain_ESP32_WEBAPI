import type { Request, Response } from 'express';
import { ListUsersService } from '../../services/user/ListUsersService.js';
import { resolveEnterpriseId } from '../../lib/tenant.js';

class ListUsersController {
  async handle(req: Request, res: Response) {
    const listUsersService = new ListUsersService();

    try {
      const users = await listUsersService.execute(resolveEnterpriseId(req.user, req.query.enterpriseId));
      return res.json(users);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ListUsersController };

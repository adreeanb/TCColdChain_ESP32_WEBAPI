import type { Request, Response } from 'express';
import { CurrentUserService } from '../../services/user/CurrentUserService.js';

class CurrentUserController {
  async handle(req: Request, res: Response) {
    const currentUserService = new CurrentUserService();

    try {
      const user = await currentUserService.execute(req.user.id);
      return res.json(user);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export { CurrentUserController };

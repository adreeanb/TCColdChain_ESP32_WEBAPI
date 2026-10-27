import type { Request, Response } from 'express';
import { AuthUserService } from '../../services/user/AuthUserService.js';

class AuthUserController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    const authUserService = new AuthUserService();

    try {
      const auth = await authUserService.execute({ email, password });
      return res.json(auth);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}

export { AuthUserController };
import type { Request, Response } from 'express';
import { UpdateProfileService } from '../../services/user/UpdateProfileService.js';

class UpdateProfileController {
  async handle(req: Request, res: Response) {
    const { name, email } = req.body;

    const updateProfileService = new UpdateProfileService();

    try {
      const user = await updateProfileService.execute({ id: req.user.id, name, email });
      return res.json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { UpdateProfileController };

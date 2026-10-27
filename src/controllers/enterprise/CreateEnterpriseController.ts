import type { Request, Response } from 'express';
import { CreateEnterpriseService } from '../../services/enterprise/CreateEnterpriseService.js';

class CreateEnterpriseController {
  async handle(req: Request, res: Response) {
    const { name, cnpj } = req.body;

    const createEnterpriseService = new CreateEnterpriseService();

    try {
      const enterprise = await createEnterpriseService.execute({ name, cnpj });
      return res.status(201).json(enterprise);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { CreateEnterpriseController };
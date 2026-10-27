import type { Request, Response } from 'express';
import { UpdateEnterpriseService } from '../../services/enterprise/UpdateEnterpriseService.js';

class UpdateEnterpriseController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { name, cnpj } = req.body;

    const updateEnterpriseService = new UpdateEnterpriseService();

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid enterprise ID' });
    }
    
    try {
      const updatedEnterprise = await updateEnterpriseService.execute({ id, name, cnpj });
      return res.json(updatedEnterprise);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { UpdateEnterpriseController };
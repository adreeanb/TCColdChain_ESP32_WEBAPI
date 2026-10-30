import type { Request, Response } from 'express';
import { GetEnterpriseService } from '../../services/enterprise/GetEnterpriseService.js';

class GetEnterpriseController {
  async handle(req: Request, res: Response) {
    // O ID vem da URL (ex: /enterprises/uuid-da-empresa)
    const id = req.params.id;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID da empresa inválido.' });
    }

    // Só o MASTER consulta outras empresas. O 404 não revela se a empresa existe.
    if (req.user.role !== 'MASTER' && id !== req.user.enterpriseId) {
      return res.status(404).json({ error: "Empresa não encontrada ou inativa." });
    }

    const getEnterpriseService = new GetEnterpriseService();

    try {
      const enterprise = await getEnterpriseService.execute(id);
      return res.json(enterprise);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }
}

export { GetEnterpriseController };
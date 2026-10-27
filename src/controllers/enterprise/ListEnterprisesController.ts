import type { Request, Response } from 'express';
import { ListEnterprisesService } from '../../services/enterprise/ListEnterprisesService.js';

class ListEnterprisesController {
  async handle(req: Request, res: Response) {
    const listEnterprisesService = new ListEnterprisesService();

    try {
      const enterprises = await listEnterprisesService.execute();
      return res.json(enterprises);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro interno ao listar empresas." });
    }
  }
}

export { ListEnterprisesController };
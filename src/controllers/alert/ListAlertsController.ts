import type { Request, Response } from 'express';
import { ListAlertsService } from '../../services/alert/ListAlertsService.js';

class ListAlertsController {
  async handle(req: Request, res: Response) {
    try {
      // 1. Segurança: Isola a busca para a empresa do usuário logado
      const enterpriseId = req.user.enterpriseId; 
      
      // Opcional: Pegar filtros da query (ex: listar apenas alertas não resolvidos)
      const { status } = req.query; 

      const listAlertsService = new ListAlertsService();
      
      // 2. Passamos o enterpriseId para o service filtrar corretamente no banco
      const alerts = await listAlertsService.execute({
        enterpriseId,
        status: status as string
      });
      
      return res.json(alerts);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ListAlertsController };
import type { Request, Response } from 'express';
import { ResolveAlertService } from '../../services/alert/ResolveAlertService.js';

class ResolveAlertController {
  async handle(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Parâmetros de rota no Express sempre vêm como string, 
      // mas se estiver vazio, barramos a requisição.
      if (!id) {
        return res.status(400).json({ error: 'ID do alerta é obrigatório.' });
      }

      if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do alerta inválido.' });
    }

      // 1. Segurança: Precisamos garantir que o usuário só resolva alertas da própria empresa
      const enterpriseId = req.user.enterpriseId;

      const resolveAlertService = new ResolveAlertService();

      // 2. Passamos o ID do alerta E o ID da empresa para o service validar a posse
      const alert = await resolveAlertService.execute({
        alertId: id,
        enterpriseId
      });

      return res.json(alert);
    } catch (error: any) {
      // Se o alerta não existir ou não pertencer à empresa, o service joga um erro e cai aqui
      return res.status(400).json({ error: error.message });
    }
  }
}

export { ResolveAlertController };
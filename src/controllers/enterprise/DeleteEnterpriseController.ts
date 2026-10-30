import type { Request, Response } from 'express';
import { DeleteEnterpriseService } from '../../services/enterprise/DeleteEnterpriseService.js';

class DeleteEnterpriseController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;

    const deleteEnterpriseService = new DeleteEnterpriseService();
    
     if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID da empresa inválido.' });
    }

    // Excluir a própria empresa removeria também o usuário logado
    if (id === req.user.enterpriseId) {
      return res.status(400).json({ error: "Você não pode excluir a sua própria empresa." });
    }

    try {
      await deleteEnterpriseService.execute(id);
      return res.json({ message: "Empresa deletada com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export { DeleteEnterpriseController };
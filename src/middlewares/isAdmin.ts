import type { Request, Response, NextFunction } from 'express';

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Deve rodar depois do isAuthenticated. O MASTER também tem acesso de administrador.
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MASTER') {
    return res.status(403).json({
      error: "Acesso Negado: Apenas administradores podem realizar esta ação."
    }).end();
  }

  return next();
}

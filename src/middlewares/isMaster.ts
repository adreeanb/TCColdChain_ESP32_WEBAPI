import type { Request, Response, NextFunction } from 'express';

export function isMaster(req: Request, res: Response, next: NextFunction) {
  // Verifica se a role injetada pelo isAuthenticated é MASTER
  if (req.user.role !== 'MASTER') {
    return res.status(403).json({ 
      error: "Acesso Negado: Apenas administradores globais (MASTER) podem realizar esta ação." 
    }).end();
  }

  // Se for MASTER, permite continuar
  return next();
}
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define o formato do objeto que guardamos dentro do token no AuthUserService
interface Payload {
  sub: string; // O sub (subject) guarda o ID do usuário por padrão
  name: string;
  email: string;
  role: string;
  enterpriseId: string;
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // 1. Recebe o token do cabeçalho
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Token não fornecido." }).end();
  }

  // 2. O token vem no formato "Bearer 987213987123...". Separamos pelo espaço.
  const [, token] = authToken.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Token inválido ou expirado." }).end();
  }

  try {
    // 3. Valida e descriptografa usando a chave secreta do .env
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET não configurado.");
    }

    const { sub, name, email, role, enterpriseId } = jwt.verify(
      token,
      jwtSecret
    ) as unknown as Payload;

    // 4. Pendura as informações do usuário logado na requisição (req)
    req.user = {
      id: sub,
      name,
      email,
      role,
      enterpriseId
    };

    // 5. Tudo certo! Permite que a requisição continue para o Controller
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado." }).end();
  }
}
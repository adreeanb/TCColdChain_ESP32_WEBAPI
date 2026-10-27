import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma.js'; 

interface AuthRequest {
  email: string;
  password: string;
}

class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    // 1. Verifica se o usuário existe e não está deletado
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        isDeleted: false
      }
    });

    if (!user) {
      throw new Error("Usuário ou senha incorretos.");
    }

    // 2. Compara a senha criptografada (assumindo que usou bcrypt no CreateUser)
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Usuário ou senha incorretos.");
    }

    // 3. Gera o Token JWT injetando o ID do usuário, a Empresa e o Role
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        role: user.role,
        enterpriseId: user.enterpriseId
      },
      process.env.JWT_SECRET as string,
      {
        subject: user.id,
        expiresIn: '1d' // 1 dia
      }
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    };
  }
}

export { AuthUserService };
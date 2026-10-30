import { prisma } from '../../lib/prisma.js';
import { hash } from 'bcryptjs';
import { UserRole } from '@prisma/client'; // Importa o enum do Prisma

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  enterpriseId: string;
}

const MIN_PASSWORD_LENGTH = 8;
const ASSIGNABLE_ROLES: string[] = ['ADMIN', 'OPERATOR'];

class CreateUserService {
  async execute({ name, email, password, role = 'OPERATOR', enterpriseId }: CreateUserRequest) {
    if (!name || !email || !password) {
      throw new Error("Nome, e-mail e senha são obrigatórios.");
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    }

    // O MASTER é global e não é criado pela API
    if (!ASSIGNABLE_ROLES.includes(role)) {
      throw new Error("Perfil de acesso inválido.");
    }

    const enterprise = await prisma.enterprise.findFirst({
      where: { id: enterpriseId }
    });

    if (!enterprise) {
      throw new Error("Empresa não encontrada ou desativada.");
    }

    // 1. Valida se o email já está em uso
    const userAlreadyExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userAlreadyExists) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    // 2. Criptografa a senha (o custo 8 é um bom balanço entre segurança e velocidade)
    const passwordHash = await hash(password, 8);

    // 3. Cria o usuário no banco vinculado à empresa de quem o cadastrou
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        enterpriseId
      },
      // SELECT: Define exatamente quais campos retornar. NUNCA retorne o password.
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enterpriseId: true,
        createdAt: true
      }
    });

    return user;
  }
}

export { CreateUserService };

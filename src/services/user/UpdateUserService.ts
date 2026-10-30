import { prisma } from '../../lib/prisma.js';
import { UserRole, Prisma } from '@prisma/client'; // Importar o namespace Prisma

interface UpdateUserRequest {
  id: string;
  enterpriseId: string;
  actorId: string;
  actorRole: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

const ASSIGNABLE_ROLES: string[] = ['ADMIN', 'OPERATOR'];

class UpdateUserService {
  async execute({ id, enterpriseId, actorId, actorRole, name, email, role }: UpdateUserRequest) {
    const userExists = await prisma.user.findFirst({
      where: { id, enterpriseId, isDeleted: false }
    });

    if (!userExists) {
      throw new Error("Usuário não encontrado ou não pertence à sua empresa.");
    }

    if (userExists.role === 'MASTER' && actorRole !== 'MASTER') {
      throw new Error("Apenas um MASTER pode alterar outro MASTER.");
    }

    if (role !== undefined && role !== userExists.role) {
      if (id === actorId) {
        throw new Error("Você não pode alterar o seu próprio perfil de acesso.");
      }

      if (!ASSIGNABLE_ROLES.includes(role)) {
        throw new Error("Perfil de acesso inválido.");
      }
    }

    // E-mail de usuário excluído continua reservado: findUnique enxerga as linhas excluídas
    if (email !== undefined && email !== userExists.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email } });

      if (emailInUse) {
        throw new Error("Este e-mail já está cadastrado.");
      }
    }

    // 1. Constrói o objeto apenas com as propriedades que vieram definidas
    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (role !== undefined) dataToUpdate.role = role;

    // 2. Faz o update usando o objeto limpo, sem 'undefined'
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true }
    });

    return updatedUser;
  }
}

export { UpdateUserService };

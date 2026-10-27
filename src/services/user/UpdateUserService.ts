import { prisma } from '../../lib/prisma.js';
import { UserRole, Prisma } from '@prisma/client'; // Importar o namespace Prisma

interface UpdateUserRequest {
  id: string;
  enterpriseId: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

class UpdateUserService {
  async execute({ id, enterpriseId, name, email, role }: UpdateUserRequest) {
    const userExists = await prisma.user.findFirst({
      where: { id, enterpriseId, isDeleted: false }
    });

    if (!userExists) {
      throw new Error("Usuário não encontrado ou não pertence à sua empresa.");
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
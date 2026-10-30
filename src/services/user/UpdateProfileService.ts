import { prisma } from '../../lib/prisma.js';
import { Prisma } from '@prisma/client';

interface UpdateProfileRequest {
  id: string;
  name?: string;
  email?: string;
}

class UpdateProfileService {
  async execute({ id, name, email }: UpdateProfileRequest) {
    const user = await prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (email !== undefined && email !== user.email) {
      const emailInUse = await prisma.user.findUnique({ where: { email } });

      if (emailInUse) {
        throw new Error("Este e-mail já está cadastrado.");
      }
    }

    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;

    return prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enterpriseId: true,
        createdAt: true
      }
    });
  }
}

export { UpdateProfileService };

import { prisma } from '../../lib/prisma.js';

class CurrentUserService {
  async execute(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enterpriseId: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return user;
  }
}

export { CurrentUserService };

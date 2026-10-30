import { prisma } from '../../lib/prisma.js';

class ListUsersService {
  async execute(enterpriseId: string) {
    const users = await prisma.user.findMany({
      where: { enterpriseId, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    return users;
  }
}

export { ListUsersService };

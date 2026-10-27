import { prisma } from '../../lib/prisma.js';

interface RequestUserRequest {
  id: string;
  enterpriseId: string;
}

class RequestUserService {
  async execute({ id, enterpriseId }: RequestUserRequest) {
    const user = await prisma.user.findFirst({
      where: { id, enterpriseId, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return user;
  }
}
export { RequestUserService };
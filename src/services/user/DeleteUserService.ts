import { prisma } from '../../lib/prisma.js';

interface DeleteUserRequest {
  id: string;
  enterpriseId: string;
  actorId: string;
  actorRole: string;
}

class DeleteUserService {
  async execute({ id, enterpriseId, actorId, actorRole }: DeleteUserRequest) {
    if (id === actorId) {
      throw new Error("Você não pode excluir o seu próprio usuário.");
    }

    const user = await prisma.user.findFirst({
      where: { id, enterpriseId, isDeleted: false }
    });

    if (!user) {
      throw new Error("Usuário não encontrado ou não pertence à sua empresa.");
    }

    if (user.role === 'MASTER' && actorRole !== 'MASTER') {
      throw new Error("Apenas um MASTER pode excluir outro MASTER.");
    }

    //soft delete
    await prisma.user.delete({
      where: { id }
    });

    return { message: "Usuário removido com sucesso." };
  }
}
export { DeleteUserService };

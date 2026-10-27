import { prisma } from '../../lib/prisma.js';

interface DeleteUserRequest {
  id: string;
  enterpriseId: string;
}

class DeleteUserService {
  async execute({ id, enterpriseId }: DeleteUserRequest) {
    const user = await prisma.user.findFirst({
      where: { id, enterpriseId, isDeleted: false }
    });

    if (!user) {
      throw new Error("Usuário não encontrado ou não pertence à sua empresa.");
    }
    //soft delete
    await prisma.user.delete({
      where: { id }
    });

    return { message: "Usuário removido com sucesso." };
  }
}
export { DeleteUserService };
import { prisma } from '../../lib/prisma.js';

interface ChangeStatusRequest {
  id: string;
  enterpriseId: string;
  status: 'APPROVED' | 'REJECTED';
}

class ChangeUserStatusService {
  async execute({ id, enterpriseId, status }: ChangeStatusRequest) {
    const user = await prisma.user.findFirst({
      where: { id, enterpriseId, status: 'PENDING' }
    });

    if (!user) {
      throw new Error("Usuário pendente não encontrado.");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, status: true }
    });

    return updatedUser;
  }
}
export { ChangeUserStatusService };
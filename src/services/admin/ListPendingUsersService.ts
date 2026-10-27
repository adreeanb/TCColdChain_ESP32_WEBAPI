import { prisma } from '../../lib/prisma.js';

class ListPendingUsersService {
  async execute(enterpriseId: string) {
    const pendingUsers = await prisma.user.findMany({
      where: { 
        enterpriseId, 
        status: 'PENDING', 
        isDeleted: false 
      },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return pendingUsers;
  }
}
export { ListPendingUsersService };
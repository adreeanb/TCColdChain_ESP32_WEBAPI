import { prisma } from '../../lib/prisma.js';

interface ListDeviceAssociationsRequest {
  id: string;
  enterpriseId: string;
}

class ListDeviceAssociationsService {
  async execute({ id, enterpriseId }: ListDeviceAssociationsRequest) {
    const device = await prisma.coldUnitDevice.findFirst({
      where: { id, enterpriseId }
    });

    if (!device) {
      throw new Error("Placa não encontrada ou não pertence à sua empresa.");
    }

    const associations = await prisma.associationHistory.findMany({
      where: { deviceId: id },
      orderBy: { startDate: 'desc' },
      include: {
        coldUnit: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return associations;
  }
}

export { ListDeviceAssociationsService };

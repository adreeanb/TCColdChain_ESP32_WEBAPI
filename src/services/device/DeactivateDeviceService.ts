import { prisma } from '../../lib/prisma.js';

class DeactivateDeviceService {
  async execute(id: string) {
    const device = await prisma.coldUnitDevice.findFirst({
      where: { id, isActive: true }
    });

    if (!device) {
      throw new Error("Placa não encontrada ou já desativada.");
    }

    // O histórico é mantido: a placa só deixa de aceitar dados e novos vínculos
    const [deactivatedDevice] = await prisma.$transaction([
      prisma.coldUnitDevice.update({ where: { id }, data: { isActive: false } }),
      prisma.associationHistory.updateMany({
        where: { deviceId: id, endDate: null },
        data: { endDate: new Date() }
      })
    ]);

    return deactivatedDevice;
  }
}

export { DeactivateDeviceService };

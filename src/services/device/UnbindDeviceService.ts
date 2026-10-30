import { prisma } from '../../lib/prisma.js';

interface UnbindDeviceRequest {
  id: string;
  enterpriseId: string;
}

class UnbindDeviceService {
  async execute({ id, enterpriseId }: UnbindDeviceRequest) {
    const { count } = await prisma.associationHistory.updateMany({
      where: {
        deviceId: id,
        endDate: null,
        device: { enterpriseId }
      },
      data: { endDate: new Date() }
    });

    if (count === 0) {
      throw new Error("Vínculo ativo não encontrado para esta placa.");
    }

    return { message: "Placa desvinculada com sucesso." };
  }
}

export { UnbindDeviceService };

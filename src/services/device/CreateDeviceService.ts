import { prisma } from '../../lib/prisma.js';
import { normalizeMacAddress } from '../../lib/macAddress.js';

interface CreateDeviceRequest {
  macAddress: string;
  enterpriseId: string;
}

class CreateDeviceService {
  async execute({ macAddress, enterpriseId }: CreateDeviceRequest) {
    const normalizedMac = normalizeMacAddress(macAddress);

    if (!normalizedMac) {
      throw new Error("Endereço MAC inválido.");
    }

    const enterprise = await prisma.enterprise.findFirst({
      where: { id: enterpriseId, isDeleted: false }
    });

    if (!enterprise) {
      throw new Error("Empresa não encontrada ou desativada.");
    }

    const deviceAlreadyExists = await prisma.coldUnitDevice.findUnique({
      where: { macAddress: normalizedMac }
    });

    if (deviceAlreadyExists) {
      throw new Error("Já existe uma placa cadastrada com este MAC.");
    }

    const device = await prisma.coldUnitDevice.create({
      data: {
        macAddress: normalizedMac,
        enterpriseId
      }
    });

    return device;
  }
}

export { CreateDeviceService };

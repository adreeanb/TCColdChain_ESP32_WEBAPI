import { prisma } from '../../lib/prisma.js';

class PurgeExpiredTelemetryService {
  async execute() {
    const { count } = await prisma.unboundTelemetry.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });

    return count;
  }
}

export { PurgeExpiredTelemetryService };

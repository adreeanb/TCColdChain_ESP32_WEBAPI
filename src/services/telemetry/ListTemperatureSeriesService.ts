import { prisma } from '../../lib/prisma.js';

interface ListTemperatureSeriesRequest {
  coldUnitId: string;
  enterpriseId: string;
  startDate: string;
  endDate: string;
  bucketMinutes: number;
}

interface SeriesRow {
  bucket: string;
  deviceId: string;
  macAddress: string;
  minTemperature: number;
  avgTemperature: number;
  maxTemperature: number;
  readings: number;
  historicalReadings: number;
}

const MAX_BUCKETS = 2000;

class ListTemperatureSeriesService {
  async execute({ coldUnitId, enterpriseId, startDate, endDate, bucketMinutes }: ListTemperatureSeriesRequest) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new Error("Informe um período válido em startDate e endDate.");
    }

    if (!Number.isInteger(bucketMinutes) || bucketMinutes < 1 || bucketMinutes > 1440) {
      throw new Error("O intervalo de agrupamento deve ser de 1 a 1440 minutos.");
    }

    if ((end.getTime() - start.getTime()) / (bucketMinutes * 60 * 1000) > MAX_BUCKETS) {
      throw new Error("Período longo demais para este intervalo. Aumente o agrupamento.");
    }

    const coldUnit = await prisma.coldUnit.findFirst({
      where: { id: coldUnitId, enterpriseId }
    });

    if (!coldUnit) {
      throw new Error("Unidade fria não encontrada, desativada ou não pertence à sua empresa.");
    }

    // Colunas sem fuso guardadas em UTC: as datas e o bucket são convertidos como texto
    // para o resultado não depender do fuso da sessão do banco.
    return prisma.$queryRaw<SeriesRow[]>`
      SELECT
        to_char(date_bin(make_interval(mins => ${bucketMinutes}::int), r.timestamp, ${start.toISOString()}::timestamp), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS bucket,
        r.device_id AS "deviceId",
        d.mac_address AS "macAddress",
        min(r.temperature)::float8 AS "minTemperature",
        avg(r.temperature)::float8 AS "avgTemperature",
        max(r.temperature)::float8 AS "maxTemperature",
        count(*)::int AS readings,
        (count(*) FILTER (WHERE r.source_type = 'HISTORICAL'))::int AS "historicalReadings"
      FROM temperature_readings r
      JOIN cold_unit_devices d ON d.id = r.device_id
      WHERE r.cold_unit_id = ${coldUnitId}
        AND r.timestamp >= ${start.toISOString()}::timestamp
        AND r.timestamp <= ${end.toISOString()}::timestamp
      GROUP BY 1, r.device_id, d.mac_address
      ORDER BY 1 ASC
    `;
  }
}

export { ListTemperatureSeriesService };

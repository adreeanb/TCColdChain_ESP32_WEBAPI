import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import process from 'process';

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

const SOFT_DELETE_MODELS = ['Enterprise', 'User', 'ColdUnit']

prisma.$extends({
  query: {
    $allModels: {
      // 1. Intercepta consultas de leitura (findMany, findFirst, count)
      async findMany({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model)) {
          args.where = { isDeleted: false, ...args.where }
        }
        return query(args)
      },

      async findFirst({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model)) {
          args.where = { isDeleted: false, ...args.where }
        }
        return query(args)
      },

      async count({ model, args, query }) {
        if (SOFT_DELETE_MODELS.includes(model)) {
          args.where = { isDeleted: false, ...args.where }
        }
        return query(args)
      },

      // 2. Intercepta deleções individuais (prisma.coldUnit.delete)
      async delete({ model, args }) {
        if (SOFT_DELETE_MODELS.includes(model)) {
          return (prisma as any)[model].update({
            where: args.where,
            data: { isDeleted: true },
          })
        }
        // Se o modelo não usa soft delete, executa o delete físico normal
        return (prisma as any)[model].delete({ where: args.where })
      },

      // 3. Intercepta deleções em massa (prisma.coldUnit.deleteMany)
      async deleteMany({ model, args }) {
        if (SOFT_DELETE_MODELS.includes(model)) {
          return (prisma as any)[model].updateMany({
            where: args.where,
            data: { isDeleted: true },
          })
        }
        return (prisma as any)[model].deleteMany({ where: args })
      },
    },
  },
})
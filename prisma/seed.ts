import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

// Verifica se a variável de ambiente existe para evitar erros de tipagem
if (!process.env.DATABASE_URL) {
  throw new Error("A variável de ambiente DATABASE_URL não está definida.");
}

// Configura o adaptador com a string de conexão
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados...');

  // 1. Cria a primeira Empresa (Utilizando upsert para não duplicar se rodar 2x)
  const enterprise = await prisma.enterprise.upsert({
    where: { cnpj: '00000000000191' },
    update: {},
    create: {
      name: 'CTech - Cold Chain Logistics',
      cnpj: '00000000000191',
    },
  });
  console.log(`✅ Empresa criada: ${enterprise.name}`);

  // 2. Criptografa a senha padrão
  const hashedPassword = await bcrypt.hash('123456', 8);

  // 3. Cria o usuário MASTER associado à empresa
  const masterUser = await prisma.user.upsert({
    where: { email: 'adrian@teste.com' },
    update: {},
    create: {
      name: 'Adrian Barros',
      email: 'adrian@teste.com',
      password: hashedPassword,
      role: 'MASTER',
      enterpriseId: enterprise.id,
    },
  });
  console.log(`✅ Usuário MASTER criado: ${masterUser.email} (Senha: 123456)`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
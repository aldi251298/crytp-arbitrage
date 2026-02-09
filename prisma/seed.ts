import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const wallet = await prisma.wallet.upsert({
    where: { id: 1 },
    update: {},
    create: {
      balance: 10000.0,
      totalProfit: 0.0,
    },
  })
  console.log('✅ Wallet Supabase siap:', wallet)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
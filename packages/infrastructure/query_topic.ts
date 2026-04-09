import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const t = await prisma.topic.findFirst()
  console.log(t ? t.slug : 'NO_TOPIC_FOUND')
}
main().catch(console.error).finally(() => prisma.$disconnect())

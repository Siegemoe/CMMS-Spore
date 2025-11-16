import { prisma } from '../src/lib/prisma'

async function fixRoles() {
  try {
    console.log('🔧 Fixing user roles...')

    // Assign ADMIN role to admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@spore-cmms.com' }
    })

    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' }
    })

    const userRole = await prisma.role.findUnique({
      where: { name: 'USER' }
    })

    if (adminUser && adminRole && userRole) {
      await prisma.userRole.deleteMany({
        where: { userId: adminUser.id }
      })

      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
          assignedBy: adminUser.id,
          isActive: true
        }
      })

      console.log('✅ Admin role assigned to admin@spore-cmms.com')
    }

    // Assign TECHNICIAN roles
    const technicianEmails = ['tech1@spore-cmms.com', 'tech2@spore-cmms.com', 'tech@spore-cmms.com']
    const technicianRole = await prisma.role.findUnique({
      where: { name: 'TECHNICIAN' }
    })

    if (technicianRole) {
      for (const email of technicianEmails) {
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (user) {
          await prisma.userRole.deleteMany({
            where: { userId: user.id }
          })

          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: technicianRole.id,
              assignedBy: adminUser?.id || user.id,
              isActive: true
            }
          })

          console.log(`✅ Technician role assigned to ${email}`)
        }
      }
    }

    console.log('🎉 Role assignment complete!')

  } catch (error) {
    console.error('❌ Error fixing roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixRoles()
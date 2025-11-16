import { prisma } from '../src/lib/prisma'

async function makeSuperAdmin() {
  try {
    const userEmail = 'zghormley@gmail.com'

    console.log(`🔧 Making ${userEmail} a super admin...`)

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log('❌ User not found:', userEmail)
      return
    }

    // Find the ADMIN role
    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' }
    })

    if (!adminRole) {
      console.log('❌ ADMIN role not found')
      return
    }

    // Remove existing roles
    await prisma.userRole.deleteMany({
      where: { userId: user.id }
    })

    // Assign ADMIN role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
        assignedBy: user.id,
        isActive: true
      }
    })

    // Also update the user's role in the user table for session compatibility
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })

    console.log('🎉 Successfully made', userEmail, 'a SUPER ADMIN!')
    console.log('📋 Permissions:')

    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    for (const userRole of userRoles) {
      console.log(`   🏷️  ${userRole.role.name}: ${userRole.role.rolePermissions.length} permissions`)
    }

  } catch (error) {
    console.error('❌ Error making super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeSuperAdmin()
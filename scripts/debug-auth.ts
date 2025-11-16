import { getUserPermissions, getUserRoles } from '../src/lib/authorization'
import { prisma } from '../src/lib/prisma'

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication for zghormley@gmail.com...')

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'zghormley@gmail.com' }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', user.email)
    console.log('   User ID:', user.id)
    console.log('   Role in user table:', user.role)

    // Check user roles
    const roles = await getUserRoles(user.id)
    console.log('📋 User roles:', roles)

    // Check permissions
    const permissions = await getUserPermissions(user.id)
    console.log('🔐 User permissions:', permissions.length)
    console.log('   First 5 permissions:', permissions.slice(0, 5))

    // Check user roles directly
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: true
      }
    })

    console.log('🏷️  User roles from database:')
    for (const ur of userRoles) {
      console.log(`   - ${ur.role.name} (active: ${ur.isActive})`)
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuth()
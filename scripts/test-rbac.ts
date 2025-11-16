import { prisma } from '../src/lib/prisma'
import { getUserPermissions, hasPermission, getUserRoles } from '../src/lib/authorization'
import { PERMISSIONS } from '../src/lib/authorization'

async function testRBAC() {
  console.log('🧪 Testing RBAC System...\n')

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
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
        }
      }
    })

    console.log(`📊 Found ${users.length} users in database\n`)

    // Test each user's permissions
    for (const user of users) {
      console.log(`👤 Testing user: ${user.email} (${user.name || 'No Name'})`)

      // Get user roles
      const roles = await getUserRoles(user.id)
      console.log(`   Roles: ${roles.join(', ') || 'None'}`)

      // Get user permissions
      const permissions = await getUserPermissions(user.id)
      console.log(`   Permissions: ${permissions.length} total`)

      // Test specific permissions
      const testPermissions = [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.SITES_READ,
        PERMISSIONS.ASSETS_WRITE,
        PERMISSIONS.WORK_ORDERS_MANAGE,
        PERMISSIONS.SYSTEM_ADMIN
      ]

      for (const permission of testPermissions) {
        const hasPerm = await hasPermission(user.id, permission)
        console.log(`   ✓ ${permission}: ${hasPerm ? '✅' : '❌'}`)
      }
      console.log('')
    }

    // Test role definitions
    console.log('🔐 Testing Role Definitions:\n')

    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    for (const role of roles) {
      console.log(`🏷️  Role: ${role.name} (${role.description})`)
      console.log(`   Permissions: ${role.rolePermissions.length}`)

      // Categorize permissions
      const resources: Record<string, string[]> = {}
      for (const rp of role.rolePermissions) {
        const resource = rp.permission.resource
        if (!resources[resource]) {
          resources[resource] = []
        }
        resources[resource].push(rp.permission.action)
      }

      for (const [resource, actions] of Object.entries(resources)) {
        console.log(`   - ${resource}: ${actions.join(', ')}`)
      }
      console.log('')
    }

    // Summary
    console.log('📈 Summary:')
    console.log(`   - Total Users: ${users.length}`)
    console.log(`   - Total Roles: ${roles.length}`)

    const allPermissions = await prisma.permission.findMany()
    console.log(`   - Total Permissions: ${allPermissions.length}`)

    // Count users per role
    const roleCounts: Record<string, number> = {}
    for (const user of users) {
      const roles = await getUserRoles(user.id)
      for (const role of roles) {
        roleCounts[role] = (roleCounts[role] || 0) + 1
      }
    }

    console.log('\n👥 Users per Role:')
    for (const [role, count] of Object.entries(roleCounts)) {
      console.log(`   - ${role}: ${count}`)
    }

    console.log('\n✅ RBAC System Test Complete!')

  } catch (error) {
    console.error('❌ Error testing RBAC system:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRBAC()
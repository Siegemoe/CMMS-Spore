import { initializeRBAC } from '../src/lib/authorization'
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🔐 Initializing RBAC system...')

  try {
    // Initialize roles and permissions
    const success = await initializeRBAC()

    if (success) {
      console.log('✅ RBAC system initialized successfully!')

      // Display created roles and permissions
      const roles = await prisma.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      })

      console.log('\n📋 Created Roles:')
      for (const role of roles) {
        console.log(`  - ${role.name}: ${role.description}`)
        console.log(`    Permissions: ${role.rolePermissions.length}`)
      }

      const permissions = await prisma.permission.findMany()
      console.log(`\n🔑 Total Permissions Created: ${permissions.length}`)

      // Assign existing users to default roles
      const users = await prisma.user.findMany({
        where: {
          userRoles: {
            none: {}
          }
        }
      })

      console.log(`\n👥 Found ${users.length} users without roles`)

      for (const user of users) {
        const defaultRole = await prisma.role.findUnique({
          where: { name: 'USER' }
        })

        if (defaultRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: defaultRole.id,
              assignedBy: user.id, // Self-assign for existing users
              isActive: true
            }
          })
          console.log(`  ✅ Assigned 'USER' role to ${user.email}`)
        }
      }

      console.log('\n🎉 RBAC initialization complete!')

    } else {
      console.error('❌ Failed to initialize RBAC system')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error during RBAC initialization:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
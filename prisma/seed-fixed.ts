import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🗑️ Clearing existing data...')
  await prisma.activityLog.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.room.deleteMany()
  await prisma.building.deleteMany()
  await prisma.site.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('👥 Creating users...')
  const users = await Promise.all([
    // Admin users
    prisma.user.create({
      data: {
        email: 'admin@spore-cmms.com',
        name: 'System Administrator',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
      }
    }),
    prisma.user.create({
      data: {
        email: 'manager@spore-cmms.com',
        name: 'Facility Manager',
        password: await bcrypt.hash('manager123', 10),
        role: 'USER',
      }
    }),
    prisma.user.create({
      data: {
        email: 'tech@spore-cmms.com',
        name: 'Senior Technician',
        password: await bcrypt.hash('tech123', 10),
        role: 'TECHNICIAN',
      }
    }),
    // Additional technicians
    prisma.user.create({
      data: {
        email: 'tech1@spore-cmms.com',
        name: 'John Technician',
        password: await bcrypt.hash('tech123', 10),
        role: 'TECHNICIAN',
      }
    }),
    prisma.user.create({
      data: {
        email: 'tech2@spore-cmms.com',
        name: 'Sarah Technician',
        password: await bcrypt.hash('tech123', 10),
        role: 'TECHNICIAN',
      }
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create sites
  console.log('🏢 Creating sites...')
  const sites = await Promise.all([
    prisma.site.create({
      data: {
        name: 'Archer Ranch West',
        address: '1234 West Campus Drive, Austin, TX 78701',
        description: 'Main commercial complex with office spaces and retail areas',
        status: 'ACTIVE',
        siteManagerId: users[1].id, // Facility Manager
      }
    }),
    prisma.site.create({
      data: {
        name: 'Archer Ranch East',
        address: '5678 East Campus Drive, Austin, TX 78702',
        description: 'Residential complex with mixed-use spaces',
        status: 'ACTIVE',
        siteManagerId: users[1].id,
      }
    }),
    prisma.site.create({
      data: {
        name: 'Downtown Tower',
        address: '1000 Main Street, Austin, TX 78701',
        description: 'High-rise office building in downtown Austin',
        status: 'ACTIVE',
        siteManagerId: users[0].id, // Admin
      }
    }),
  ])

  console.log(`✅ Created ${sites.length} sites`)

  // Create buildings and rooms for Archer Ranch West (demonstrating your bulk creation concept)
  console.log('🏗️ Creating buildings and rooms for Archer Ranch West...')
  const archerWestBuildings = []

  // Buildings A-J with 3 floors each, 4 rooms per floor
  for (const buildingLetter of ['A', 'B', 'C', 'D', 'E']) {
    const building = await prisma.building.create({
      data: {
        name: `Building ${buildingLetter}`,
        number: buildingLetter,
        description: `Building ${buildingLetter} at Archer Ranch West`,
        floors: 3,
        status: 'ACTIVE',
        siteId: sites[0].id,
        facilityTechnicianId: users[2].id, // Senior Technician
      }
    })
    archerWestBuildings.push(building)

    // Create rooms for each floor (1-3) with 4 rooms per floor
    for (const floor of [1, 2, 3]) {
      for (let roomNum = 1; roomNum <= 4; roomNum++) {
        await prisma.room.create({
          data: {
            number: `${roomNum.toString().padStart(2, '0')}`,
            description: `Room ${buildingLetter}${floor}${roomNum.toString().padStart(2, '0')}`,
            floor,
            squareFootage: floor === 1 ? 800 : floor === 2 ? 750 : 700,
            status: 'AVAILABLE',
            buildingId: building.id,
          }
        })
      }
    }
  }

  console.log(`✅ Created ${archerWestBuildings.length} buildings with rooms`)

  // Create sample assets
  console.log('🔧 Creating assets...')
  const assets = await Promise.all([
    // HVAC Systems
    prisma.asset.create({
      data: {
        name: 'Main HVAC Unit A-101',
        description: 'Primary HVAC unit for building A floor 1',
        assetTag: 'HVAC-A101',
        category: 'equipment',
        location: 'Building A - Room 101',
        status: 'ACTIVE',
        createdById: users[0].id,
        siteId: sites[0].id,
        buildingId: archerWestBuildings[0].id,
      }
    }),
    // Office Equipment
    prisma.asset.create({
      data: {
        name: 'Executive Conference System',
        description: 'Audio-visual system for main conference room',
        assetTag: 'AV-CONF-001',
        category: 'equipment',
        location: 'Building B - Room 201',
        status: 'ACTIVE',
        createdById: users[1].id,
        siteId: sites[0].id,
        buildingId: archerWestBuildings[1].id,
      }
    }),
    // Tools
    prisma.asset.create({
      data: {
        name: 'Power Tool Kit A',
        description: 'Complete power tool set for maintenance',
        assetTag: 'TOOLS-A-001',
        category: 'tool',
        location: 'Maintenance Office',
        status: 'ACTIVE',
        createdById: users[2].id,
        siteId: sites[0].id,
      }
    }),
  ])

  console.log(`✅ Created ${assets.length} assets`)

  // Create sample work orders
  console.log('📋 Creating work orders...')
  const workOrders = await Promise.all([
    prisma.workOrder.create({
      data: {
        workOrderNumber: 'WO-2024-001',
        title: 'Preventive Maintenance - HVAC A-101',
        description: 'Quarterly preventive maintenance on main HVAC unit',
        priority: 'MEDIUM',
        status: 'OPEN',
        assetId: assets[0].id,
        workType: 'preventive',
        scopeOfWork: 'Replace filters, check refrigerant levels, inspect electrical connections, test thermostat operation',
        assignedToId: users[2].id, // Senior Technician
        createdById: users[1].id, // Facility Manager
        requestedById: users[0].id, // Admin
        siteLocation: 'Archer Ranch West',
      }
    }),
    prisma.workOrder.create({
      data: {
        workOrderNumber: 'WO-2024-002',
        title: 'Conference System Check',
        description: 'Monthly check of audio-visual conference equipment',
        priority: 'LOW',
        status: 'OPEN',
        assetId: assets[1].id,
        workType: 'inspection',
        assignedToId: users[3].id, // John Technician
        createdById: users[1].id, // Facility Manager
        siteLocation: 'Archer Ranch West',
      }
    }),
  ])

  console.log(`✅ Created ${workOrders.length} work orders`)

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   Users: ${users.length}`)
  console.log(`   Sites: ${sites.length}`)
  console.log(`   Buildings: ${archerWestBuildings.length}`)
  console.log(`   Rooms: ${archerWestBuildings.length * 3 * 4}`)
  console.log(`   Assets: ${assets.length}`)
  console.log(`   Work Orders: ${workOrders.length}`)
  console.log('\n🔑 Login Credentials:')
  console.log(`   Admin: admin@spore-cmms.com / admin123`)
  console.log(`   Manager: manager@spore-cmms.com / manager123`)
  console.log(`   Technician: tech@spore-cmms.com / tech123`)
  console.log(`   Tech1: tech1@spore-cmms.com / tech123`)
  console.log(`   Tech2: tech2@spore-cmms.com / tech123`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
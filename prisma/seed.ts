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
  for (const buildingLetter of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) {
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

  // Create some additional buildings for other sites
  const otherBuildings = await Promise.all([
    // Archer Ranch East - smaller complex
    prisma.building.create({
      data: {
        name: 'Residence Building A',
        number: 'A',
        description: 'Residential building A at Archer Ranch East',
        floors: 5,
        status: 'ACTIVE',
        siteId: sites[1].id,
        facilityTechnicianId: users[3].id, // John Technician
      }
    }),
    prisma.building.create({
      data: {
        name: 'Community Center',
        number: 'CC',
        description: 'Community amenities building',
        floors: 2,
        status: 'ACTIVE',
        siteId: sites[1].id,
        facilityTechnicianId: users[4].id, // Sarah Technician
      }
    }),
    // Downtown Tower
    prisma.building.create({
      data: {
        name: 'Main Tower',
        number: 'TOWER',
        description: 'Main office tower',
        floors: 25,
        status: 'ACTIVE',
        siteId: sites[2].id,
        facilityTechnicianId: users[2].id, // Senior Technician
      }
    }),
  ])

  console.log(`✅ Created ${archerWestBuildings.length + otherBuildings.length} buildings with rooms`)

  // Create tenants for some rooms
  console.log('👨‍💼 Creating tenants...')
  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        names: 'TechCorp Solutions',
        phoneNumbers: '512-555-0101, 512-555-0102',
        email: 'admin@techcorp.com',
        status: 'ACTIVE',
      }
    }),
    prisma.tenant.create({
      data: {
        names: 'Creative Agency LLC',
        phoneNumbers: '512-555-0201',
        email: 'contact@creativeagency.com',
        status: 'ACTIVE',
      }
    }),
    prisma.tenant.create({
      data: {
        names: 'Legal Partners',
        phoneNumbers: '512-555-0301, 512-555-0302, 512-555-0303',
        email: 'info@legalpartners.com',
        status: 'ACTIVE',
      }
    }),
    prisma.tenant.create({
      data: {
        names: 'Health & Wellness Center',
        phoneNumbers: '512-555-0401',
        email: 'info@healthwellness.com',
        status: 'ACTIVE',
      }
    }),
  ])

  // Assign some tenants to rooms
  const rooms = await prisma.room.findMany({ take: 4 })
  await Promise.all([
    prisma.room.update({
      where: { id: rooms[0].id },
      data: {
        status: 'OCCUPIED',
        tenantId: tenants[0].id
      }
    }),
    prisma.room.update({
      where: { id: rooms[1].id },
      data: {
        status: 'OCCUPIED',
        tenantId: tenants[1].id
      }
    }),
    prisma.room.update({
      where: { id: rooms[2].id },
      data: {
        status: 'OCCUPIED',
        tenantId: tenants[2].id
      }
    }),
    prisma.room.update({
      where: { id: rooms[3].id },
      data: {
        status: 'OCCUPIED',
        tenantId: tenants[3].id
      }
    }),
  ])

  console.log(`✅ Created ${tenants.length} tenants and assigned to rooms`)

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
        purchaseDate: '2023-01-15',
        purchaseCost: 8500,
        warrantyEnd: '2025-01-15',
        createdById: users[0].id,
        siteId: sites[0].id,
        buildingId: archerWestBuildings[0].id,
        roomId: rooms[0]?.id,
      }
    }),
    prisma.asset.create({
      data: {
        name: 'HVAC Unit B-201',
        description: 'HVAC unit for building B floor 2',
        assetTag: 'HVAC-B201',
        category: 'equipment',
        location: 'Building B - Room 201',
        status: 'MAINTENANCE',
        purchaseDate: '2023-02-20',
        purchaseCost: 9200,
        warrantyEnd: '2025-02-20',
        createdById: users[0].id,
        siteId: sites[0].id,
        buildingId: archerWestBuildings[1].id,
      }
    }),
    // Office Equipment
    prisma.asset.create({
      data: {
        name: 'Executive Conference System',
        description: 'Audio-visual system for main conference room',
        assetTag: 'AV-CONF-001',
        category: 'equipment',
        location: 'Building C - Room 301',
        status: 'ACTIVE',
        purchaseDate: '2023-03-10',
        purchaseCost: 15000,
        warrantyEnd: '2026-03-10',
        createdById: users[1].id,
        siteId: sites[0].id,
        buildingId: archerWestBuildings[2].id,
      }
    }),
    // Vehicles
    prisma.asset.create({
      data: {
        name: 'Maintenance Van 1',
        description: 'Ford Transit maintenance vehicle',
        assetTag: 'VEH-001',
        category: 'vehicle',
        location: 'Facility Garage',
        status: 'ACTIVE',
        purchaseDate: new Date('2022-11-01').toISOString(),
        purchaseCost: 35000,
        warrantyEnd: new Date('2024-11-01').toISOString(),
        createdById: users[0].id,
        siteId: sites[0].id,
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
        purchaseDate: '2023-04-05',
        purchaseCost: 2500,
        warrantyEnd: '2025-04-05',
        createdById: users[2].id,
        siteId: sites[0].id,
      }
    }),
    // Building Infrastructure
    prisma.asset.create({
      data: {
        name: 'Fire Alarm System - Building A',
        description: 'Complete fire alarm and detection system',
        assetTag: 'FIRE-A-001',
        category: 'building',
        location: 'Building A - All Floors',
        status: 'ACTIVE',
        purchaseDate: '2022-12-01',
        purchaseCost: 12000,
        warrantyEnd: '2027-12-01',
        createdById: users[0].id,
        siteId: sites[0].id,
        buildingId: archerWestBuildings[0].id,
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
        partsRequired: 'HVAC filters (4), Refrigerant R-410A, Electrical tape',
        toolsRequired: 'Multimeter, Refrigerant gauges, Filter wrench, Screwdriver set',
        safetyNotes: 'Lock out power before servicing. Wear appropriate PPE. Work in ventilated area.',
        estimatedStart: '2024-01-20T09:00:00Z',
        estimatedCompletion: '2024-01-20T11:00:00Z',
        assignedToId: users[2].id, // Senior Technician
        createdById: users[1].id, // Facility Manager
        requestedById: users[0].id, // Admin
        siteLocation: 'Archer Ranch West',
        roomLocation: 'A-101',
      }
    }),
    prisma.workOrder.create({
      data: {
        workOrderNumber: 'WO-2024-002',
        title: 'Repair HVAC Unit B-201',
        description: 'HVAC unit not cooling properly, requires immediate attention',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assetId: assets[1].id,
        workType: 'corrective',
        scopeOfWork: 'Diagnose cooling issue, repair or replace faulty components, test system operation',
        partsRequired: 'Potential replacement parts: compressor, condenser fan motor, refrigerant',
        toolsRequired: 'Refrigerant recovery machine, Vacuum pump, Leak detector, Multi-tool set',
        safetyNotes: 'High priority repair. Coordinate with building occupants for service window.',
        actualStart: '2024-01-19T14:00:00Z',
        estimatedCompletion: '2024-01-19T17:00:00Z',
        assignedToId: users[3].id, // John Technician
        createdById: users[2].id, // Senior Technician
        requestedById: users[1].id, // Facility Manager
        siteLocation: 'Archer Ranch West',
        roomLocation: 'B-201',
      }
    }),
    prisma.workOrder.create({
      data: {
        workOrderNumber: 'WO-2024-003',
        title: 'Annual Fire Safety Inspection',
        description: 'Annual inspection and testing of fire alarm system',
        priority: 'MEDIUM',
        status: 'OPEN',
        assetId: assets[5].id,
        workType: 'inspection',
        scopeOfWork: 'Test all alarm devices, inspect wiring, verify backup power, update inspection records',
        partsRequired: 'Inspection tags, batteries for sensors',
        toolsRequired: 'Test equipment, Multimeter, Ladder, Inspection forms',
        safetyNotes: 'Coordinate with building management. May require temporary alarm testing.',
        estimatedStart: '2024-01-25T08:00:00Z',
        estimatedCompletion: '2024-01-25T16:00:00Z',
        assignedToId: users[4].id, // Sarah Technician
        createdById: users[0].id, // Admin
        siteLocation: 'Archer Ranch West',
      }
    }),
    prisma.workOrder.create({
      data: {
        workOrderNumber: 'WO-2024-004',
        title: 'Maintenance Van Oil Change',
        description: 'Routine oil change and maintenance on maintenance van',
        priority: 'LOW',
        status: 'COMPLETED',
        assetId: assets[3].id,
        workType: 'preventive',
        scopeOfWork: 'Oil change, filter replacement, tire rotation, safety inspection',
        partsRequired: 'Oil filter, Engine oil (5W-30), Air filter',
        toolsRequired: 'Oil filter wrench, Socket set, Tire pressure gauge',
        safetyNotes: 'Use proper vehicle lifting equipment. Dispose of oil properly.',
        estimatedStart: '2024-01-15T10:00:00Z',
        actualStart: '2024-01-15T10:00:00Z',
        actualCompletion: '2024-01-15T11:30:00Z',
        completedAt: '2024-01-15T11:30:00Z',
        completionNotes: 'Oil change completed successfully. All fluids topped up. Next service due at 75,000 miles.',
        assignedToId: users[2].id, // Senior Technician
        createdById: users[1].id, // Facility Manager
        siteLocation: 'Archer Ranch West',
      }
    }),
  ])

  console.log(`✅ Created ${workOrders.length} work orders`)

  // Create activity logs
  console.log('📊 Creating activity logs...')
  await Promise.all([
    prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entityType: 'SITE',
        entityId: sites[0].id,
        entityName: sites[0].name,
        description: 'Created new site: Archer Ranch West',
        userId: users[0].id,
        userName: users[0].name!,
        details: JSON.stringify({ siteId: sites[0].id, siteName: sites[0].name }) as string,
      }
    }),
    prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entityType: 'ASSET',
        entityId: assets[0].id,
        entityName: assets[0].name,
        description: 'Created new asset: Main HVAC Unit A-101',
        userId: users[0].id,
        userName: users[0].name!,
        details: JSON.stringify({ assetId: assets[0].id, assetTag: assets[0].assetTag }) as string,
      }
    }),
    prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entityType: 'WORK_ORDER',
        entityId: workOrders[0].id,
        entityName: workOrders[0].title,
        description: 'Created new work order: Preventive Maintenance - HVAC A-101',
        userId: users[1].id,
        userName: users[1].name!,
        details: JSON.stringify({ workOrderNumber: workOrders[0].workOrderNumber, priority: workOrders[0].priority }) as string,
      }
    }),
  ])

  console.log(`✅ Created activity logs`)

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   Users: ${users.length}`)
  console.log(`   Sites: ${sites.length}`)
  console.log(`   Buildings: ${archerWestBuildings.length + otherBuildings.length}`)
  console.log(`   Rooms: ${archerWestBuildings.length * 3 * 4 + otherBuildings.length * 5} (Archer West: ${archerWestBuildings.length * 3 * 4} rooms)`)
  console.log(`   Tenants: ${tenants.length}`)
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
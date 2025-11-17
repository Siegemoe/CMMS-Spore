import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AlertType, AlertPriority, Alert } from '@/types/alerts'

// Sample alerts for testing/development
const sampleAlerts: Alert[] = [
  {
    id: '1',
    type: AlertType.TASK,
    priority: AlertPriority.HIGH,
    title: 'Work Order Assignment',
    message: 'You have been assigned a new work order: "HVAC System Maintenance"',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    actionUrl: '/work-orders/123',
    actionText: 'View Work Order',
    autoDismiss: false,
  },
  {
    id: '2',
    type: AlertType.WARNING,
    priority: AlertPriority.MEDIUM,
    title: 'Asset Maintenance Due',
    message: 'Asset "Main Production Line" is scheduled for maintenance in 3 days',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    actionUrl: '/assets/456',
    actionText: 'View Asset',
    autoDismiss: false,
  },
  {
    id: '3',
    type: AlertType.SUCCESS,
    priority: AlertPriority.LOW,
    title: 'Work Order Completed',
    message: 'Work Order "Emergency Electrical Repair" has been marked as completed',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    actionUrl: '/work-orders/789',
    actionText: 'View Details',
    autoDismiss: true,
    dismissAfter: 5000, // 5 seconds
  },
  {
    id: '4',
    type: AlertType.ERROR,
    priority: AlertPriority.CRITICAL,
    title: 'System Alert',
    message: 'Critical temperature warning detected in Server Room A',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    actionUrl: '/buildings/1/rooms/101',
    actionText: 'Investigate',
    autoDismiss: false,
  },
  {
    id: '5',
    type: AlertType.INFO,
    priority: AlertPriority.LOW,
    title: 'System Update',
    message: 'CMMS system will be updated tonight at 2:00 AM EST',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    autoDismiss: true,
    dismissAfter: 10000, // 10 seconds
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let alerts = sampleAlerts

    if (unreadOnly) {
      alerts = alerts.filter(alert => !alert.isRead)
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching sample alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      priority,
      title,
      message,
      actionUrl,
      actionText,
      autoDismiss,
      dismissAfter,
    } = body

    // Validate required fields
    if (!type || !priority || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, priority, title, message' },
        { status: 400 }
      )
    }

    const newAlert: Alert = {
      id: Date.now().toString(),
      type,
      priority,
      title,
      message,
      actionUrl,
      actionText,
      autoDismiss: autoDismiss || false,
      dismissAfter,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(newAlert, { status: 201 })
  } catch (error) {
    console.error('Error creating sample alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
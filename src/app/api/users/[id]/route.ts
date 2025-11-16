import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

interface Params {
  params: Promise<{ id: string }>
}

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'USER', 'TECHNICIAN'])
})

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'New password must contain at least one special character')
})

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assets: { where: { status: { not: 'ARCHIVED' } } },
            assignedWorkOrders: { where: { status: { not: 'COMPLETED' } } },
            managedSites: { where: { status: { not: 'ARCHIVED' } } }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Determine what type of update this is
    const isPasswordUpdate = body.currentPassword && body.newPassword
    const isProfileUpdate = body.name || body.email || body.role

    let validation
    if (isPasswordUpdate) {
      validation = updatePasswordSchema.safeParse(body)
    } else if (isProfileUpdate) {
      validation = updateUserSchema.safeParse(body)
    } else {
      return NextResponse.json(
        { error: 'No valid update data provided' },
        { status: 400 }
      )
    }

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For non-admin users, only allow updating their own profile and password
    // This is a basic check - we'll enhance this with proper RBAC
    if (session.user?.role !== 'ADMIN') {
      // TODO: Add proper RBAC check for user self-management
      // For now, allow users to update their own profile
    }

    let updateData: any = {}

    if (isProfileUpdate) {
      const profileUpdateData = validation.data as { name: string; email: string; role: "ADMIN" | "USER" | "TECHNICIAN" }
      // Check if email is being changed and if it conflicts with another user
      if (profileUpdateData.email !== existingUser.email) {
        const emailConflict = await prisma.user.findUnique({
          where: { email: profileUpdateData.email }
        })
        if (emailConflict) {
          return NextResponse.json(
            { error: 'Email already exists' },
            { status: 409 }
          )
        }
      }

      updateData = {
        name: profileUpdateData.name,
        email: profileUpdateData.email,
        role: session.user?.role === 'ADMIN' ? profileUpdateData.role : existingUser.role, // Only admins can change roles
      }
    } else if (isPasswordUpdate) {
      const passwordUpdateData = validation.data as { currentPassword: string; newPassword: string }
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        passwordUpdateData.currentPassword,
        existingUser.password
      )

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(passwordUpdateData.newPassword, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update user:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete users
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assets: true,
            assignedWorkOrders: true,
            managedSites: true
          }
        }
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deletion of users with assets, work orders, or managed sites
    if (
      existingUser._count.assets > 0 ||
      existingUser._count.assignedWorkOrders > 0 ||
      existingUser._count.managedSites > 0
    ) {
      return NextResponse.json(
        {
          error: 'Cannot delete user with existing assets, work orders, or managed sites. Reassign or archive these first.',
          details: {
            assets: existingUser._count.assets,
            workOrders: existingUser._count.assignedWorkOrders,
            managedSites: existingUser._count.managedSites
          }
        },
        { status: 400 }
      )
    }

    // Prevent self-deletion
    if (session.user?.email === existingUser.email) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
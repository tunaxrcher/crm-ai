import { Notification, Prisma } from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'

export class NotificationRepository extends BaseRepository<Notification> {
  private static instance: NotificationRepository

  public static getInstance() {
    if (!NotificationRepository.instance) {
      NotificationRepository.instance = new NotificationRepository()
    }
    return NotificationRepository.instance
  }

  async findAll() {
    return this.prisma.notification.findMany()
  }

  async findById(id: number) {
    return this.prisma.notification.findUnique({
      where: { id },
    })
  }

  async findByUserId(userId: number, args?: Prisma.NotificationFindManyArgs) {
    return this.prisma.notification.findMany({
      where: { userId },
      ...args,
    })
  }

  async create(
    data:
      | Prisma.NotificationCreateInput
      | Prisma.NotificationUncheckedCreateInput
  ) {
    return this.prisma.notification.create({ data })
  }

  async update(id: number, data: Prisma.NotificationUpdateInput) {
    return this.prisma.notification.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.notification.delete({
      where: { id },
    })
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    })
  }
}

export const notificationRepository = NotificationRepository.getInstance()

import { getServerSession } from '@src/lib/auth'
import { prisma } from '@src/lib/db'
import { BaseService } from '@src/lib/service/server/baseService'
import 'server-only'

import { UserRepository, userRepository } from '../repository'

export class UserService extends BaseService {
  private static instance: UserService
  private userRepository: UserRepository

  constructor() {
    super()
    this.userRepository = userRepository
  }

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }

    return UserService.instance
  }

  async getUser(id: number) {
    return this.userRepository.findById(id)
  }

  async getUsersByUserId(userId: number) {
    return this.userRepository.findByUserId(userId)
  }

  // async deleteUser(id: number) {
  //   return this.userRepository.delete(id)
  // }

  async getUserCharacters() {
    const session = await getServerSession()

    console.log(`[Server] Fetching User Character with ID: ${session.user.id}`)

    return await this.userRepository.findUserCharactersByUserId(+session.user.id)
  }
}

export const userService = UserService.getInstance()

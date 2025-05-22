import { BaseService } from '@src/lib/service/server/baseService'
import 'server-only'

import { UserRepository, userRepository } from '../repository'

export class UserService extends BaseService {
  private static instance: UserService
  private UserRepository: UserRepository

  constructor() {
    super()
    this.UserRepository = userRepository
  }

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }

    return UserService.instance
  }

  async getAllUsers() {
    return this.UserRepository.findAll()
  }

  async getUser(id: number) {
    return this.UserRepository.findById(id)
  }

  async createUser() {}

  async updateUser() {}

  async deleteUser() {}
}

export const userService = UserService.getInstance()

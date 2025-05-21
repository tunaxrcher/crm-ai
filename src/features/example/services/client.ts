import { BaseService } from '@/lib/service/client/baseService'

export class UserService extends BaseService {
  private static instance: UserService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }
}

export const userService = UserService.getInstance()

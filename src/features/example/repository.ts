import { User } from "@prisma/client";
import { BaseRepository } from "@/lib/repository/baseRepository";

export class UserRepository extends BaseRepository<User> {
  private static instance: UserRepository;

  public static getInstance() {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(
    id: number,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

export const userRepository = UserRepository.getInstance();

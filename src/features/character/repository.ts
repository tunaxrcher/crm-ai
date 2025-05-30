import { Character, JobClass, JobLevel } from '@prisma/client'
import { BaseRepository } from '@src/lib/repository/baseRepository'

export class CharacterRepository extends BaseRepository<Character> {
  private static instance: CharacterRepository

  public static getInstance() {
    if (!CharacterRepository.instance) {
      CharacterRepository.instance = new CharacterRepository()
    }
    return CharacterRepository.instance
  }

  async findAll() {
    return this.prisma.character.findMany()
  }

  async findById(id: number) {
    return this.prisma.character.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.character.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.character.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.character.delete({
      where: { id },
    })
  }
}
export const characterRepository = CharacterRepository.getInstance()

export class JobClassRepository extends BaseRepository<JobClass> {
  private static instance: JobClassRepository

  public static getInstance() {
    if (!JobClassRepository.instance) {
      JobClassRepository.instance = new JobClassRepository()
    }
    return JobClassRepository.instance
  }

  async findAll() {
    return this.prisma.jobClass.findMany({
      include: {
        levels: {
          orderBy: { level: 'asc' },
          take: 6,
        },
      },
    })
  }

  async findById(id: number) {
    return this.prisma.jobClass.findUnique({
      where: { id },
      include: {
        levels: {
          orderBy: { level: 'asc' },
          take: 6,
        },
      },
    })
  }

  async create(data: Omit<JobClass, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.jobClass.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<JobClass, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.jobClass.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.jobClass.delete({
      where: { id },
    })
  }
}
export const jobClassRepository = JobClassRepository.getInstance()

export class JobLevelRepository extends BaseRepository<JobLevel> {
  private static instance: JobLevelRepository

  public static getInstance() {
    if (!JobLevelRepository.instance) {
      JobLevelRepository.instance = new JobLevelRepository()
    }
    return JobLevelRepository.instance
  }

  async findAll() {
    return this.prisma.jobLevel.findMany()
  }

  async findById(id: number) {
    return this.prisma.jobLevel.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<JobLevel, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.jobLevel.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<JobLevel, 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prisma.jobLevel.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.jobLevel.delete({
      where: { id },
    })
  }
}
export const jobLevelRepository = JobLevelRepository.getInstance()

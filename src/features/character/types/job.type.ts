export interface JobLevel {
  level: number
  requiredCharacterLevel: number
  title: string
  imageUrl?: string
}

export interface JobClass {
  id: string
  name: string
  levels: JobLevel[]
  description?: string
  imageUrl?: string
}

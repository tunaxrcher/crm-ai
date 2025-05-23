import { assistantRepository } from './repository'

export type Assistant = Awaited<
  ReturnType<typeof assistantRepository.findAll>
>[number]

export type AssistantDetails = NonNullable<
  Awaited<ReturnType<typeof assistantRepository.findById>>
>

export interface AiItem {
  id: string
  name: string
  description: string
  iconUrl: string
  visibility: 'System' | 'Custom'
  link?: string
  isDraft?: boolean // เพิ่ม isDraft
}

export type KnowledgeItem = {
  file: File
  preview: string
  fileId?: string
}

export type ConfigData = {
  name: string
  description: string
  instructions: string
  knowledgeItems: KnowledgeItem[]
  iconFile?: File | null
  iconUrl?: string | null
}

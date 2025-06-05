// import { BaseService } from '@src/lib/services/server/baseService'

// import { AssistantDetails } from '../types'

// export interface AssistantFormData {
//   name: string
//   description: string
//   instructions: string
//   isDraft?: boolean
//   iconFile?: File | null
//   files?: File[]
//   removeIcon?: boolean
//   removedFileIds?: string[]
// }

// export class AssistantService extends BaseService {
//   private static instance: AssistantService

//   constructor() {
//     super()
//   }

//   public static getInstance() {
//     if (!AssistantService.instance) {
//       AssistantService.instance = new AssistantService()
//     }
//     return AssistantService.instance
//   }

//   prepareAssistantFormData(data: AssistantFormData): FormData {
//     const formData = new FormData()

//     formData.append('name', data.name)
//     formData.append('description', data.description || '')
//     formData.append('instructions', data.instructions)
//     formData.append('isDraft', String(data.isDraft ?? true))

//     // Handle icon
//     if (data.iconFile) {
//       formData.append('icon', data.iconFile)
//     }

//     if (data.removeIcon) {
//       formData.append('removeIcon', 'true')
//     }

//     // Handle files
//     if (data.files && data.files.length > 0) {
//       data.files.forEach((file) => {
//         formData.append('files', file)
//       })
//     }

//     // Handle removed files
//     if (data.removedFileIds && data.removedFileIds.length > 0) {
//       data.removedFileIds.forEach((fileId) => {
//         formData.append('removedFileIds', fileId)
//       })
//     }

//     return formData
//   }

//   async createAssistantAPI(data: AssistantFormData) {
//     const formData = this.prepareAssistantFormData(data)

//     const response = await fetch('/api/assistants', {
//       method: 'POST',
//       body: formData,
//     })

//     if (!response.ok) {
//       throw new Error('Failed to create assistant')
//     }

//     return response.json()
//   }

//   async updateAssistantAPI(assistantId: number, data: AssistantFormData) {
//     const formData = this.prepareAssistantFormData(data)

//     const response = await fetch(`/api/assistants/${assistantId}/update`, {
//       method: 'PATCH',
//       body: formData,
//     })

//     if (!response.ok) {
//       throw new Error('Failed to update assistant')
//     }

//     return response.json()
//   }

//   async deleteAssistantAPI(assistantId: number) {
//     const response = await fetch(`/api/assistants/${assistantId}`, {
//       method: 'DELETE',
//     })

//     if (!response.ok) {
//       throw new Error('Failed to delete assistant')
//     }

//     return response.json()
//   }

//   async getAssistantById(assistantId: string) {
//     const response = await fetch(`/api/assistants/${assistantId}`)

//     if (!response.ok) {
//       throw new Error('Failed to fetch assistant')
//     }

//     return response.json()
//   }

//   // Fetch assistances
//   async fetchAssistants() {
//     const response = await fetch(`/api/me/assistants`)

//     if (!response.ok) {
//       throw new Error(`Error fetching assistants: ${response.statusText}`)
//     }

//     const data = await response.json()

//     return data as AssistantDetails[]
//   }
// }

// export const assistantService = AssistantService.getInstance()

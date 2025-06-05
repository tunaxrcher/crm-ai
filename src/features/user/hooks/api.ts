// import { useRouter } from 'next/navigation'

// import { useMutation, useQuery } from '@tanstack/react-query'
// import toast from 'react-hot-toast'

// import { type AssistantFormData, assistantService } from '../services/client'

// // Hook สำหรับสร้าง Assistant
// export function useCreateAssistant() {
//   const router = useRouter()

//   return useMutation({
//     mutationFn: assistantService.createAssistantAPI,
//     onSuccess: (data) => {
//       toast.success('สร้าง Assistant สำเร็จ')
//     },
//     onError: (error) => {
//       toast.error('เกิดข้อผิดพลาดในการสร้าง Assistant')
//       console.error('Create assistant error:', error)
//     },
//   })
// }

// // Hook สำหรับอัปเดต Assistant
// export function useUpdateAssistant(assistantId: number) {
//   const router = useRouter()

//   return useMutation({
//     mutationFn: (data: AssistantFormData) =>
//       assistantService.updateAssistantAPI(assistantId, data),
//     onSuccess: () => {
//       toast.success('อัปเดต Assistant สำเร็จ')
//     },
//     onError: (error) => {
//       toast.error('เกิดข้อผิดพลาดในการอัปเดต Assistant')
//       console.error('Update assistant error:', error)
//     },
//   })
// }

// // Hook สำหรับลบ Assistant
// export function useRemoveAssistant() {
//   return useMutation({
//     mutationFn: assistantService.deleteAssistantAPI,
//     onSuccess: () => {
//       toast.success('ลบ AI สำเร็จ')
//     },
//     onError: (error) => {
//       toast.error('เกิดข้อผิดพลาดในการลบ AI')
//       console.error('Delete assistant error:', error)
//     },
//   })
// }

// // Hook สำหรับดึงข้อมูล Assistant
// export function useAssistant(assistantId: string) {
//   return useQuery({
//     queryKey: ['assistant', assistantId],
//     queryFn: () => assistantService.getAssistantById(assistantId),
//     enabled: !!assistantId,
//   })
// }

// // Hook สำหรับดึงรายการ Assistants ทั้งหมด
// export function useGetAssistants(userId?: string) {
//   return useQuery({
//     queryKey: ['assistants', userId],
//     queryFn: () => assistantService.fetchAssistants(),
//   })
// }

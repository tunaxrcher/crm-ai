'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@src/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@src/components/ui/form'
import { Input } from '@src/components/ui/input'
import { Button } from '@src/components/ui/button'
import { Settings, Clock, DollarSign, Loader2 } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'

interface WorkSettings {
  workStartTime: string | null
  workEndTime: string | null
  salary: number | null
}

interface WorkSettingsDialogProps {
  children?: React.ReactNode
}

export function WorkSettingsDialog({ children }: WorkSettingsDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<WorkSettings>({
    defaultValues: {
      workStartTime: '',
      workEndTime: '',
      salary: null,
    },
  })

  // Fetch current settings
  const { data: currentSettings } = useQuery({
    queryKey: ['work-settings'],
    queryFn: async () => {
      const response = await fetch('/api/character/work-settings')
      if (!response.ok) throw new Error('Failed to fetch work settings')
      const result = await response.json()
      return result.data as WorkSettings
    },
    enabled: open,
  })

  // Update settings when data is loaded
  useEffect(() => {
    if (currentSettings) {
      form.reset({
        workStartTime: currentSettings.workStartTime || '',
        workEndTime: currentSettings.workEndTime || '',
        salary: currentSettings.salary,
      })
    }
  }, [currentSettings, form])

  // Update mutation
  const updateSettings = useMutation({
    mutationFn: async (data: WorkSettings) => {
      const response = await fetch('/api/character/work-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update work settings')
      return response.json()
    },
    onSuccess: () => {
      alert('อัพเดทการตั้งค่าเสร็จสิ้น')
      setOpen(false)
    },
    onError: (error) => {
      alert('เกิดข้อผิดพลาดในการอัพเดท: ' + error.message)
    },
  })

  const onSubmit = (data: WorkSettings) => {
    updateSettings.mutate({
      workStartTime: data.workStartTime || null,
      workEndTime: data.workEndTime || null,
      salary: data.salary ? Number(data.salary) : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            ตั้งค่าเวลาทำงาน
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ตั้งค่าเวลาทำงานและเงินเดือน</DialogTitle>
          <DialogDescription>
            กำหนดเวลาเข้า-ออกงานและเงินเดือนของคุณ
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="workStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    เวลาเข้างาน
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="09:00"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    เวลาที่คุณต้องเข้างาน (เช่น 09:00)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    เวลาออกงาน
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="18:00"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    เวลาที่คุณสามารถออกงานได้ (เช่น 18:00)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    เงินเดือน
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="25000"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>
                    เงินเดือนของคุณ (บาท/เดือน)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'บันทึก'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
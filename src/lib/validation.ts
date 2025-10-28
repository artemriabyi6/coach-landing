import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Імʼя має містити принаймні 2 символи'),
  email: z.string().email('Невірний формат email'),
  phone: z.string().min(10, 'Невірний формат телефону'),
  message: z.string().min(10, 'Повідомлення має містити принаймні 10 символів'),
  courseInterest: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
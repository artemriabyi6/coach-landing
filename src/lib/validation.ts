import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Імʼя має містити принаймні 2 символи')
    .max(50, 'Імʼя занадто довге'),
  email: z.string()
    .email('Будь ласка, введіть коректний email')
    .min(1, 'Email обовʼязковий'),
  phone: z.string()
    .min(10, 'Телефон має містити принаймні 10 цифр')
    .regex(/^\+?[0-9\s\-\(\)]+$/, 'Будь ласка, введіть коректний номер телефону'),
  message: z.string()
    .min(10, 'Повідомлення має містити принаймні 10 символів')
    .max(500, 'Повідомлення занадто довге'),
  course: z.string().optional()
})

export type ContactFormData = z.infer<typeof contactFormSchema>
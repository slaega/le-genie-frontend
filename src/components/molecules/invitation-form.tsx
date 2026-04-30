'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSendInvitation } from '@/hooks/mutations/use-invitation'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Email invalide'),
  content: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface InvitationFormProps {
  postId: string
  onSuccess?: () => void
}

export function InvitationForm({ postId, onSuccess }: InvitationFormProps) {
  const { mutateAsync, isPending } = useSendInvitation(postId)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', content: '' },
  })

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({ email: values.email, content: values.content || undefined })
      toast.success('Invitation envoyée', {
        description: `Une invitation a été envoyée à ${values.email}`,
      })
      form.reset()
      onSuccess?.()
    } catch {
      toast.error("Erreur lors de l'envoi de l'invitation")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email du collaborateur</FormLabel>
              <FormControl>
                <Input placeholder="collaborateur@exemple.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Bonjour, je vous invite à collaborer sur cet article..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full gap-2">
          <Send className="h-4 w-4" />
          {isPending ? "Envoi en cours..." : "Envoyer l'invitation"}
        </Button>
      </form>
    </Form>
  )
}

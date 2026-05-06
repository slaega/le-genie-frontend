'use server'

import { z } from 'zod'
import { safeAction } from '@/libs/safe-action'
import { serverApi } from '@/lib/api/server'
import { TEMPLATE_IDS, type UpsertResumePayload } from '@/lib/api/types'

const upsertSchema = z.object({
  templateId: z.enum(TEMPLATE_IDS).optional(),
  isPublic: z.boolean().optional(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: z.any().optional(),
})

export const saveResume = safeAction
  .inputSchema(upsertSchema)
  .action(async ({ parsedInput }) => {
    await serverApi.put('resume/me', parsedInput as UpsertResumePayload)
    return { success: true }
  })

export const deleteResumeAction = safeAction
  .inputSchema(z.object({ _: z.undefined().optional() }))
  .action(async () => {
    await serverApi.delete('resume/me')
    return { success: true }
  })

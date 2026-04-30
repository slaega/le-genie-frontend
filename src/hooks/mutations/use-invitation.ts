import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invitationsApi } from '@/lib/api'
import type { SendInvitationPayload } from '@/lib/api/types'
import { invitationKeys } from '../queries/use-invitations'

export function useSendInvitation(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SendInvitationPayload) =>
      invitationsApi.send(postId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invitationKeys.byPost(postId) })
    },
  })
}

export function useCancelInvitation(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationsApi.cancel(postId, invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invitationKeys.byPost(postId) })
    },
  })
}

export function useResendInvitation(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationsApi.resend(postId, invitationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invitationKeys.byPost(postId) })
    },
  })
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: (token: string) => invitationsApi.accept(token),
  })
}

export function useRefuseInvitation() {
  return useMutation({
    mutationFn: (token: string) => invitationsApi.refuse(token),
  })
}

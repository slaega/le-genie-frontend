import { useMutation } from '@tanstack/react-query'
import { postsApi } from '@/lib/api'

export function useUploadImage(postId: string) {
  return useMutation({
    mutationFn: (file: File) => postsApi.uploadImage(postId, file),
  })
}

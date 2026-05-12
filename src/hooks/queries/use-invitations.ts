import { useQuery } from '@tanstack/react-query';
import { invitationsApi } from '@/lib/api';

export const invitationKeys = {
    all: ['invitations'] as const,
    byPost: (postId: string) => [...invitationKeys.all, postId] as const,
};

export function useInvitations(postId: string) {
    return useQuery({
        queryKey: invitationKeys.byPost(postId),
        queryFn: () => invitationsApi.list(postId),
        enabled: !!postId,
    });
}

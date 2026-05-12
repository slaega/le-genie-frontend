import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api';
import type { Post, PostStatus } from '@/lib/api/types';
import { postKeys } from '../queries/use-posts';

export function usePublishPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: PostStatus }) =>
            postsApi.update(id, { status }),
        onSuccess: (post: Post) => {
            qc.setQueryData(postKeys.detail(post.id), post);
            qc.invalidateQueries({ queryKey: postKeys.lists() });
        },
    });
}

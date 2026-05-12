import { api } from '../client';
import type { Invitation, SendInvitationPayload } from '../types';

export const invitationsApi = {
    list(postId: string) {
        return api.get<Invitation[]>(`/posts/${postId}/invitations`);
    },

    send(postId: string, payload: SendInvitationPayload) {
        return api.post<Invitation>(`/posts/${postId}/invitations`, payload);
    },

    resend(postId: string, invitationId: string) {
        return api.post<void>(
            `/posts/${postId}/invitations/${invitationId}/resend`
        );
    },

    cancel(postId: string, invitationId: string) {
        return api.delete<void>(`/posts/${postId}/invitations/${invitationId}`);
    },

    accept(token: string) {
        return api.post<void>('/invitations/accept', { token });
    },

    refuse(token: string) {
        return api.post<void>('/invitations/refuse', { token });
    },
};

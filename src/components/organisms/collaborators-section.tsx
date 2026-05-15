'use client';

import { Users, UserPlus, MailCheck, MailX, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ContributorItem } from '@/components/molecules/contributor-item';
import { InvitationForm } from '@/components/molecules/invitation-form';
import { useContributors } from '@/hooks/queries/use-contributors';
import { useInvitations } from '@/hooks/queries/use-invitations';
import {
    useCancelInvitation,
    useResendInvitation,
} from '@/hooks/mutations/use-invitation';
import { useAuth } from '@/providers/auth-provider';
import type { Invitation } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface CollaboratorsSectionProps {
    postId: string;
}

/* ── Inline invitation row ───────────────────────────────────────────────── */

function InvitationRow({
    invitation,
    postId,
}: {
    invitation: Invitation;
    postId: string;
}) {
    const { mutateAsync: cancel, isPending: isCanceling } =
        useCancelInvitation(postId);
    const { mutateAsync: resend, isPending: isResending } =
        useResendInvitation(postId);
    const isExpired = new Date(invitation.expiredAt) < new Date();

    return (
        <div className="flex items-center gap-2.5 py-2">
            <div
                className={cn(
                    'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                    isExpired ? 'bg-destructive/10' : 'bg-muted'
                )}
            >
                <MailCheck
                    className={cn(
                        'h-3.5 w-3.5',
                        isExpired ? 'text-destructive' : 'text-muted-foreground'
                    )}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium truncate text-foreground">
                    {invitation.email}
                </p>
                <p className="text-[11px] text-muted-foreground">
                    {isExpired ? (
                        <span className="text-destructive">Expirée</span>
                    ) : (
                        <>
                            Expire{' '}
                            {formatDistanceToNow(
                                new Date(invitation.expiredAt),
                                { addSuffix: true, locale: fr }
                            )}
                        </>
                    )}
                </p>
            </div>
            <div className="flex gap-0.5 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Renvoyer l'invitation"
                    onClick={() => resend(invitation.id)}
                    disabled={isResending}
                >
                    <RefreshCw
                        className={cn('h-3 w-3', isResending && 'animate-spin')}
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Annuler l'invitation"
                    onClick={() => cancel(invitation.id)}
                    disabled={isCanceling}
                >
                    <MailX className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

/* ── CollaboratorsSection — inline, always visible ───────────────────────── */

/**
 * Inline replacement for the legacy <CollaboratorsPanel> Sheet/modal.
 *
 * Designed to live directly in the editor's right info panel — the section
 * is always visible (no toggle), the email invitation form sits at the
 * bottom so the owner can invite a co-author without leaving the editor.
 */
export function CollaboratorsSection({ postId }: CollaboratorsSectionProps) {
    const { user } = useAuth();
    const { data: contributors = [], isLoading: loadingContributors } =
        useContributors(postId);
    const { data: invitations = [], isLoading: loadingInvitations } =
        useInvitations(postId);

    const isOwner =
        contributors.find((c) => c.userId === user?.id)?.owner ?? false;

    const isLoading = loadingContributors || loadingInvitations;

    return (
        <section className="rounded-2xl border border-border bg-background p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Collaborateurs
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {contributors.length}
                </span>
            </div>

            {/* Members list */}
            <div className="space-y-1 -mx-1">
                {isLoading && (
                    <p className="text-[12px] text-muted-foreground italic px-1 py-2">
                        Chargement…
                    </p>
                )}
                {!isLoading &&
                    contributors.map((contributor) => (
                        <ContributorItem
                            key={contributor.id}
                            contributor={contributor}
                            isOwner={isOwner}
                            canRemove={isOwner}
                        />
                    ))}
                {!isLoading && contributors.length === 0 && (
                    <p className="text-[12px] text-muted-foreground italic px-1 py-2">
                        Aucun collaborateur pour l&apos;instant.
                    </p>
                )}
            </div>

            {/* Pending invitations */}
            {invitations.length > 0 && (
                <>
                    <div className="h-px bg-border/60 my-4" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                        Invitations en attente
                    </p>
                    <div className="-mx-1">
                        {invitations.map((inv) => (
                            <InvitationRow
                                key={inv.id}
                                invitation={inv}
                                postId={postId}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Owner-only — invite by email */}
            {isOwner && (
                <>
                    <div className="h-px bg-border/60 my-4" />
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                        <UserPlus className="h-3 w-3" />
                        Inviter par email
                    </p>
                    <InvitationForm postId={postId} />
                </>
            )}
        </section>
    );
}

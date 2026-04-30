'use client'

import { useState } from 'react'
import { Users, UserPlus, MailCheck, MailX, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContributorItem } from '@/components/molecules/contributor-item'
import { InvitationForm } from '@/components/molecules/invitation-form'
import { useContributors } from '@/hooks/queries/use-contributors'
import { useInvitations } from '@/hooks/queries/use-invitations'
import { useCancelInvitation, useResendInvitation } from '@/hooks/mutations/use-invitation'
import { useAuth } from '@/providers/auth-provider'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Invitation } from '@/lib/api/types'

interface CollaboratorsPanelProps {
  postId: string
}

function InvitationItem({ invitation, postId }: { invitation: Invitation; postId: string }) {
  const { mutateAsync: cancel, isPending: isCanceling } = useCancelInvitation(postId)
  const { mutateAsync: resend, isPending: isResending } = useResendInvitation(postId)
  const isExpired = new Date(invitation.expiredAt) < new Date()

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
        <MailCheck className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{invitation.email}</p>
        <p className="text-xs text-muted-foreground">
          {isExpired ? (
            <span className="text-destructive">Expirée</span>
          ) : (
            <>Expire {formatDistanceToNow(new Date(invitation.expiredAt), { addSuffix: true, locale: fr })}</>
          )}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => resend(invitation.id).then(() => toast.success('Invitation renvoyée'))}
          disabled={isResending}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => cancel(invitation.id).then(() => toast.success('Invitation annulée'))}
          disabled={isCanceling}
        >
          <MailX className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function CollaboratorsPanel({ postId }: CollaboratorsPanelProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { data: contributors = [] } = useContributors(postId)
  const { data: invitations = [] } = useInvitations(postId)

  const isOwner = contributors.find((c) => c.userId === user?.id)?.owner ?? false

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Collaborateurs
          {contributors.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
              {contributors.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborateurs
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="members" className="flex-1 flex flex-col min-h-0 mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="members">
              Membres
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                {contributors.length}
              </Badge>
            </TabsTrigger>
            {isOwner && (
              <TabsTrigger value="invite">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Inviter
                {invitations.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                    {invitations.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="members" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {contributors.map((contributor) => (
                  <ContributorItem
                    key={contributor.id}
                    contributor={contributor}
                    isOwner={isOwner}
                    canRemove={isOwner}
                  />
                ))}
              </div>

              {isOwner && (
                <>
                  <Separator className="my-4" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Quitter la publication
                  </Button>
                </>
              )}
            </ScrollArea>
          </TabsContent>

          {isOwner && (
            <TabsContent value="invite" className="flex-1 min-h-0 mt-4 space-y-6">
              <InvitationForm postId={postId} onSuccess={() => setOpen(false)} />

              {invitations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Invitations en attente</h4>
                  <div className="divide-y">
                    {invitations.map((inv) => (
                      <InvitationItem key={inv.id} invitation={inv} postId={postId} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

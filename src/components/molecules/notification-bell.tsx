'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellDot, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { notificationsApi } from '@/lib/api'
import type { Notification } from '@/lib/api/types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const POLL_INTERVAL = 60_000 // 1 minute

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.list()
      setNotifications(data.items)
      setUnreadCount(data.unreadCount)
    } catch {
      // silently ignore — user might not be authenticated yet
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Mark all read when opening
  async function handleOpenChange(isOpen: boolean) {
    if (isOpen && unreadCount > 0) {
      try {
        await notificationsApi.markAllRead()
        setUnreadCount(0)
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      } catch {
        // ignore
      }
    }
  }

  async function handleRemove(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await notificationsApi.remove(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // ignore
    }
  }

  async function handleClearAll() {
    try {
      await notificationsApi.removeAll()
      setNotifications([])
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const hasUnread = unreadCount > 0

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-400 hover:text-white hover:bg-gray-800"
          aria-label={hasUnread ? `${unreadCount} notifications non lues` : 'Notifications'}
        >
          {hasUnread ? (
            <BellDot className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-bold flex items-center justify-center pointer-events-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Tout effacer
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification
  onRemove: (id: string, e: React.MouseEvent) => void
}) {
  const inner = (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
        !notification.read && 'bg-primary/5'
      )}
    >
      {/* Unread dot */}
      <span
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
          !notification.read ? 'bg-primary' : 'bg-transparent'
        )}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{notification.title}</p>
        {notification.body && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-1">
        {notification.postId && (
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        <button
          onClick={(e) => onRemove(notification.id, e)}
          className="h-5 w-5 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
          aria-label="Supprimer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )

  if (notification.postId) {
    return (
      <Link href={`/post/${notification.postId}`} className="block">
        {inner}
      </Link>
    )
  }

  return <div>{inner}</div>
}

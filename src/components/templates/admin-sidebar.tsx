'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Mail,
    BookOpen,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import type { User } from '@/lib/api/types';
import { UserAvatar } from '@/components/atoms/user-avatar';
import { cn } from '@/lib/utils';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users, exact: false },
    {
        href: '/admin/posts',
        label: 'Publications',
        icon: FileText,
        exact: false,
    },
    { href: '/admin/subscribers', label: 'Abonnés', icon: Mail, exact: false },
];

export function AdminSidebar({ user }: { user: User }) {
    const pathname = usePathname();

    function isActive(href: string, exact: boolean) {
        if (exact) return pathname === href || pathname.endsWith(href);
        return pathname.includes(href);
    }

    return (
        <aside className="w-60 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border min-h-screen">
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm text-foreground">Le Génie</span>
                <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-semibold tracking-wider">
                    ADMIN
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {NAV.map(({ href, label, icon: Icon, exact }) => {
                    const active = isActive(href, exact);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                                active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-4 w-4 shrink-0',
                                    active ? 'text-primary' : ''
                                )}
                            />
                            <span className="flex-1">{label}</span>
                            {active && (
                                <ChevronRight className="h-3.5 w-3.5 text-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="border-t border-sidebar-border p-4 flex items-center gap-3">
                <UserAvatar
                    name={user.name}
                    avatarPath={user.avatarPath}
                    size="sm"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
                <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Retour au site"
                >
                    <LogOut className="h-4 w-4" />
                </Link>
            </div>
        </aside>
    );
}

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
        <aside className="w-60 shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 min-h-screen">
            {/* Logo */}
            <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <span className="font-bold text-sm">Le Génie</span>
                <span className="ml-auto text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-semibold tracking-wider">
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
                                    ? 'bg-indigo-600/20 text-indigo-300'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-4 w-4 shrink-0',
                                    active ? 'text-indigo-400' : ''
                                )}
                            />
                            <span className="flex-1">{label}</span>
                            {active && (
                                <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="border-t border-gray-800 p-4 flex items-center gap-3">
                <UserAvatar
                    name={user.name}
                    avatarPath={user.avatarPath}
                    size="sm"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">
                        {user.email}
                    </p>
                </div>
                <Link
                    href="/"
                    className="text-gray-500 hover:text-white transition-colors"
                    title="Retour au site"
                >
                    <LogOut className="h-4 w-4" />
                </Link>
            </div>
        </aside>
    );
}

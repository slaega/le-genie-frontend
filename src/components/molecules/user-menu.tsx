'use client';

import Link from 'next/link';
import { User, LogOut, BookOpen, LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/atoms/user-avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User as UserType } from '@/lib/api/types';

interface Props {
    user: UserType;
    isPending: boolean;
    onNewPost: () => void;
    onLogout: () => void;
}

export function UserMenu({ user, isPending, onNewPost, onLogout }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 p-0 ml-1"
                >
                    <UserAvatar
                        name={user.name}
                        avatarPath={user.avatarPath}
                        size="sm"
                    />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/me" className="gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Mon profil
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link
                        href="/publications?mine=true"
                        className="gap-2 cursor-pointer"
                    >
                        <BookOpen className="h-4 w-4" />
                        Mes publications
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="gap-2 cursor-pointer md:hidden"
                    onClick={onNewPost}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <BookOpen className="h-4 w-4" />
                    )}
                    {isPending ? 'Création…' : 'Écrire un article'}
                </DropdownMenuItem>

                {user.role === 'ADMIN' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/admin"
                                className="gap-2 cursor-pointer text-indigo-500 focus:text-indigo-500"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Panel admin
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="text-destructive gap-2 focus:text-destructive cursor-pointer"
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

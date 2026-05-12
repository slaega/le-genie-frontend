import { serverApi } from '@/lib/api/server';
import type { AdminStats } from '@/lib/api/types';
import {
    Users,
    FileText,
    MessageSquare,
    Mail,
    Heart,
    BookOpen,
    Archive,
    PenLine,
} from 'lucide-react';
import { OnlineCounter } from '@/components/molecules/online-counter';

export const metadata = { title: 'Dashboard Admin — Le Génie' };

export default async function AdminDashboard() {
    let stats: AdminStats = {
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        totalSubscribers: 0,
        totalFollows: 0,
        postsByStatus: { PUBLISHED: 0, DRAFT: 0, EMPTY: 0, ARCHIVED: 0 },
    };

    try {
        stats = await serverApi.get<AdminStats>('admin/stats');
    } catch {
        // affiche zéros si erreur
    }

    const globalCards = [
        {
            label: 'Utilisateurs',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-400',
        },
        {
            label: 'Publications',
            value: stats.totalPosts,
            icon: FileText,
            color: 'text-green-400',
        },
        {
            label: 'Commentaires',
            value: stats.totalComments,
            icon: MessageSquare,
            color: 'text-yellow-400',
        },
        {
            label: 'Abonnés newsletter',
            value: stats.totalSubscribers,
            icon: Mail,
            color: 'text-purple-400',
        },
        {
            label: 'Abonnements (follow)',
            value: stats.totalFollows,
            icon: Heart,
            color: 'text-rose-400',
        },
    ];

    const statusCards = [
        {
            label: 'Publiés',
            value: stats.postsByStatus.PUBLISHED,
            icon: BookOpen,
            color: 'text-green-400',
        },
        {
            label: 'Brouillons',
            value: stats.postsByStatus.DRAFT,
            icon: PenLine,
            color: 'text-yellow-400',
        },
        {
            label: 'Archivés',
            value: stats.postsByStatus.ARCHIVED,
            icon: Archive,
            color: 'text-gray-400',
        },
        {
            label: 'Vides',
            value: stats.postsByStatus.EMPTY,
            icon: FileText,
            color: 'text-gray-600',
        },
    ];

    return (
        <div className="space-y-10">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Vue d'ensemble de la plateforme
                    </p>
                </div>
                <OnlineCounter />
            </div>

            {/* Global stats */}
            <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                    Chiffres globaux
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {globalCards.map(({ label, value, icon: Icon, color }) => (
                        <div
                            key={label}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3"
                        >
                            <Icon className={`h-5 w-5 ${color}`} />
                            <div>
                                <p className="text-2xl font-bold">
                                    {value.toLocaleString('fr-FR')}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Posts by status */}
            <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                    Articles par statut
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statusCards.map(({ label, value, icon: Icon, color }) => (
                        <div
                            key={label}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4"
                        >
                            <div
                                className={`p-2 rounded-lg bg-gray-800 ${color}`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xl font-bold">
                                    {value.toLocaleString('fr-FR')}
                                </p>
                                <p className="text-xs text-gray-400">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick links */}
            <section>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                    Actions rapides
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        {
                            href: '/admin/users',
                            label: 'Gérer les utilisateurs',
                            desc: 'Rôles, suspensions',
                            icon: Users,
                        },
                        {
                            href: '/admin/posts',
                            label: 'Gérer les articles',
                            desc: 'Archiver, supprimer',
                            icon: FileText,
                        },
                        {
                            href: '/admin/subscribers',
                            label: 'Gérer les abonnés',
                            desc: 'Newsletter',
                            icon: Mail,
                        },
                    ].map(({ href, label, desc, icon: Icon }) => (
                        <a
                            key={href}
                            href={href}
                            className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-indigo-600/50 rounded-xl p-4 transition-colors group"
                        >
                            <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600/20 transition-colors">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{label}</p>
                                <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}

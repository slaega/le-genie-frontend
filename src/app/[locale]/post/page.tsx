import { redirect } from 'next/navigation';

// Cette route est doublonnée avec /publications — on redirige
export default function PostsPage() {
    redirect('/publications');
}

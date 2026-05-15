import type { Metadata } from 'next';
import { LegalPage } from '@/components/templates/legal-page';

export const metadata: Metadata = {
    title: "Conditions générales d'utilisation — Le Génie",
    description:
        'Les règles du jeu pour publier, lire et collaborer sur Le Génie.',
};

export default function TermsPage() {
    return (
        <LegalPage
            eyebrow="Conditions générales d'utilisation"
            title="Les règles du jeu, sans jargon."
            description="Le Génie est ouvert à tous, mais quelques règles claires permettent à la communauté de fonctionner. Lisez-les une fois, on n'y revient plus."
            updatedAt="2026-05-13"
            sections={[
                {
                    id: 'acceptation',
                    title: 'En vous inscrivant, vous acceptez',
                    content: (
                        <>
                            <p>
                                Créer un compte sur Le Génie vaut acceptation
                                pleine et entière des présentes conditions. Si
                                vous n&apos;êtes pas d&apos;accord avec un
                                point, ne créez pas de compte — c&apos;est aussi
                                simple que ça.
                            </p>
                            <p>
                                Ces conditions peuvent évoluer. Toute
                                modification substantielle vous est notifiée par
                                email au moins 30 jours avant son entrée en
                                vigueur.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'compte',
                    title: 'Votre compte',
                    content: (
                        <>
                            <p>
                                L&apos;inscription est libre et gratuite. Vous
                                êtes responsable de la confidentialité de votre
                                accès et de toute activité réalisée depuis votre
                                compte.
                            </p>
                            <ul>
                                <li>
                                    Un compte par personne — pas de comptes
                                    automatisés ou collectifs sans accord
                                    préalable.
                                </li>
                                <li>
                                    Votre identifiant unique (
                                    <code>@username</code>) est public et
                                    apparaît dans les URLs de vos publications.
                                </li>
                                <li>
                                    Vous pouvez supprimer votre compte à tout
                                    moment depuis votre espace.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: 'contenu',
                    title: 'Vos publications',
                    content: (
                        <>
                            <p>
                                Vous restez{' '}
                                <strong>propriétaire de tout contenu</strong>{' '}
                                que vous publiez. En publiant, vous accordez à
                                Le Génie une licence non-exclusive
                                d&apos;hébergement, d&apos;affichage et de
                                redistribution sur la plateforme.
                            </p>
                            <p>
                                Cette licence prend fin si vous supprimez la
                                publication. Vous pouvez exporter vos contenus à
                                tout moment au format Markdown / JSON.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'comportement',
                    title: "Ce qui n'est pas accepté",
                    content: (
                        <>
                            <p>
                                On veut une communauté agréable. Sont
                                strictement interdits&nbsp;:
                            </p>
                            <ul>
                                <li>
                                    Contenu illégal, haineux, harcelant,
                                    diffamatoire ou portant atteinte à la
                                    dignité d&apos;une personne.
                                </li>
                                <li>
                                    Plagiat, contrefaçon, violation de droits
                                    d&apos;auteur ou de marque.
                                </li>
                                <li>
                                    Spam, contenus générés en masse sans valeur
                                    ajoutée, manipulation des métriques (likes,
                                    vues).
                                </li>
                                <li>
                                    Contenus à caractère pornographique, violent
                                    ou choquant sans avertissement contextuel.
                                </li>
                                <li>
                                    Incitation à la haine, discrimination,
                                    désinformation manifeste.
                                </li>
                            </ul>
                            <p>
                                En cas de manquement, votre publication peut
                                être retirée et votre compte suspendu sans
                                préavis.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'collaboration',
                    title: 'Collaboration et co-écriture',
                    content: (
                        <>
                            <p>
                                Vous pouvez inviter d&apos;autres auteurs à
                                co-éditer vos publications. Tous les
                                contributeurs apparaissent sur la page de
                                l&apos;article et conservent leurs droits
                                respectifs sur leurs apports.
                            </p>
                            <p>
                                L&apos;auteur principal (propriétaire) reste le
                                seul à pouvoir publier, dépublier ou supprimer
                                la publication.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'responsabilite',
                    title: 'Responsabilité',
                    content: (
                        <>
                            <p>
                                Le Génie fournit le service{' '}
                                <em>en l&apos;état</em>, sans garantie de
                                disponibilité ininterrompue. Nous faisons de
                                notre mieux mais ne pouvons être tenus
                                responsables d&apos;une perte de données due à
                                un incident technique majeur.
                            </p>
                            <p>
                                <strong>
                                    Faites des sauvegardes de vos contenus
                                    importants.
                                </strong>{' '}
                                L&apos;export Markdown est disponible à tout
                                moment depuis votre espace.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'resiliation',
                    title: 'Suspension et résiliation',
                    content: (
                        <>
                            <p>
                                Nous nous réservons le droit de suspendre ou
                                supprimer un compte qui ne respecte pas ces
                                conditions. La décision vous est notifiée par
                                email avec le motif.
                            </p>
                            <p>
                                Vous pouvez contester une décision en écrivant à{' '}
                                <a href="mailto:contact@legenie.app">
                                    contact@legenie.app
                                </a>{' '}
                                — toute demande est étudiée sous 7 jours.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'droit-applicable',
                    title: 'Droit applicable',
                    content: (
                        <>
                            <p>
                                Les présentes conditions sont régies par le
                                droit français. Tout litige relèvera de la
                                compétence des tribunaux français, sauf
                                disposition légale contraire.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}

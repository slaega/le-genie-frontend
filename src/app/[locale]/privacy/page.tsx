import type { Metadata } from 'next';
import { LegalPage } from '@/components/templates/legal-page';

export const metadata: Metadata = {
    title: 'Politique de confidentialité — Le Génie',
    description:
        'Comment Le Génie collecte, utilise et protège vos données personnelles.',
};

export default function PrivacyPage() {
    return (
        <LegalPage
            eyebrow="Politique de confidentialité"
            title="Vos données, vos règles."
            description="Le Génie a été pensé pour respecter votre vie privée. Cette page explique en clair ce qu'on collecte, pourquoi, et comment vous reprenez la main à tout moment."
            updatedAt="2026-05-13"
            sections={[
                {
                    id: 'qui-sommes-nous',
                    title: 'Qui sommes-nous ?',
                    content: (
                        <>
                            <p>
                                Le Génie est une plateforme collaborative de
                                publication, ouverte à la communauté. Le
                                responsable du traitement de vos données est{' '}
                                <strong>Le Génie</strong>, joignable à{' '}
                                <a href="mailto:contact@legenie.app">
                                    contact@legenie.app
                                </a>
                                .
                            </p>
                            <p>
                                Nous appliquons le RGPD et la loi française
                                Informatique et Libertés. Aucun paiement, aucune
                                publicité, aucun transfert hors UE non
                                encadré&nbsp;: vos données restent les vôtres.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'donnees-collectees',
                    title: 'Données collectées',
                    content: (
                        <>
                            <p>
                                On collecte uniquement ce dont on a besoin pour
                                faire fonctionner le service&nbsp;:
                            </p>
                            <ul>
                                <li>
                                    <strong>Identité&nbsp;:</strong> nom, email,
                                    nom d&apos;utilisateur, avatar (si fourni).
                                </li>
                                <li>
                                    <strong>Contenu&nbsp;:</strong> vos
                                    publications, commentaires, brouillons.
                                </li>
                                <li>
                                    <strong>Usage&nbsp;:</strong> pages
                                    consultées, articles lus, agrégés et
                                    pseudonymisés pour les statistiques.
                                </li>
                                <li>
                                    <strong>Technique&nbsp;:</strong> adresse
                                    IP, type de navigateur, conservés 30 jours
                                    pour la sécurité du service.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: 'usage',
                    title: 'Comment vos données sont utilisées',
                    content: (
                        <>
                            <p>
                                Vos données servent à&nbsp;: vous authentifier,
                                publier et afficher vos articles, vous notifier
                                des activités sur vos publications, modérer la
                                communauté, et améliorer le service via des
                                statistiques agrégées.
                            </p>
                            <p>
                                <strong>
                                    On ne vend rien, on ne traque rien hors du
                                    site, on ne diffuse pas de publicité.
                                </strong>
                            </p>
                        </>
                    ),
                },
                {
                    id: 'cookies',
                    title: 'Cookies',
                    content: (
                        <>
                            <p>
                                On utilise uniquement des cookies
                                strictement nécessaires&nbsp;:
                            </p>
                            <ul>
                                <li>
                                    Cookie de session pour vous garder connecté.
                                </li>
                                <li>
                                    Cookie de préférence (thème clair/sombre).
                                </li>
                            </ul>
                            <p>
                                Aucun cookie tiers, aucun pixel publicitaire,
                                aucun outil de tracking comportemental.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'vos-droits',
                    title: 'Vos droits',
                    content: (
                        <>
                            <p>
                                À tout moment vous pouvez accéder à vos données,
                                les rectifier, demander leur suppression,
                                limiter ou vous opposer à leur traitement, et
                                récupérer vos publications dans un format ouvert
                                (Markdown / JSON).
                            </p>
                            <p>
                                Une demande&nbsp;? Un email à{' '}
                                <a href="mailto:contact@legenie.app">
                                    contact@legenie.app
                                </a>{' '}
                                — réponse sous 30 jours, sans condition.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'conservation',
                    title: 'Durée de conservation',
                    content: (
                        <>
                            <p>
                                Vos données sont conservées tant que votre
                                compte est actif. À la suppression de votre
                                compte, tout est effacé sous 30 jours, sauf les
                                publications déjà publiées que vous avez choisi
                                d&apos;archiver pour la communauté (vous pouvez
                                toujours demander leur retrait complet).
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}

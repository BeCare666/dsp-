import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type SectionLegale } from "@/components/marketing/legal-page";
import { PHOTOS, SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions générales d'utilisation de DSP, la plateforme de sécurité des patients des établissements de santé du Bénin.",
};

const CREDITS = [
  { photo: PHOTOS.medecin, usage: "Page d'accueil, ouverture" },
  { photo: PHOTOS.sageFemme, usage: "Page d'accueil, section « Au chevet du patient »" },
  { photo: PHOTOS.cnhu, usage: "Page d'accueil, section « Pour qui »" },
  { photo: PHOTOS.centreSante, usage: "Page d'accueil, section « Pour qui »" },
];

const SECTIONS: SectionLegale[] = [
  {
    id: "objet",
    titre: "Objet",
    contenu: (
      <p>
        Les présentes conditions générales d&apos;utilisation (ci-après les « CGU ») encadrent l&apos;accès et
        l&apos;utilisation de la plateforme {SITE.nom}, {SITE.nomComplet}, accessible en ligne. Toute création de
        compte vaut acceptation pleine et entière des présentes CGU.
      </p>
    ),
  },
  {
    id: "definitions",
    titre: "Définitions",
    contenu: (
      <ul>
        <li>
          <strong>Plateforme</strong> : le service en ligne {SITE.nom} et l&apos;ensemble de ses modules.
        </li>
        <li>
          <strong>Établissement</strong> : l&apos;établissement de santé inscrit sur la Plateforme via un compte
          organisation, de type EH ou ESPC, identifié par son IFU.
        </li>
        <li>
          <strong>Compte individuel</strong> : compte ouvert par une personne physique, sans rattachement à un
          Établissement, donnant accès au catalogue de formations.
        </li>
        <li>
          <strong>Utilisateur</strong> : toute personne disposant d&apos;un compte sur la Plateforme, qu&apos;il
          soit rattaché à un Établissement ou individuel.
        </li>
        <li>
          <strong>Responsable du compte</strong> : l&apos;Utilisateur qui a inscrit l&apos;Établissement et qui en
          administre le compte.
        </li>
      </ul>
    ),
  },
  {
    id: "acces",
    titre: "Accès à la plateforme et création de compte",
    contenu: (
      <>
        <p>
          L&apos;inscription d&apos;un Établissement requiert son identité (nom, type EH ou ESPC, numéro IFU) ainsi que
          l&apos;identité de son responsable. Un même IFU et une même adresse email ne peuvent être associés
          qu&apos;à un seul compte.
        </p>
        <p>
          Tout compte doit être confirmé par un lien envoyé à l&apos;adresse email indiquée. Tant que cette adresse
          n&apos;est pas confirmée, la connexion est impossible.
        </p>
        <p>
          L&apos;Utilisateur garantit l&apos;exactitude des informations fournies et s&apos;engage à les maintenir à
          jour. Le Responsable du compte peut corriger à tout moment les coordonnées de son Établissement depuis son
          espace.
        </p>
      </>
    ),
  },
  {
    id: "roles",
    titre: "Rôles au sein de l'établissement",
    contenu: (
      <>
        <p>L&apos;accès aux fonctionnalités dépend du ou des rôles attribués à chaque Utilisateur :</p>
        <ul>
          <li>
            <strong>Responsable du compte</strong> : administration du compte de l&apos;Établissement et accès à
            l&apos;ensemble de ses modules.
          </li>
          <li>
            <strong>Responsable qualité</strong> : conduite des auto-évaluations, qualification et traitement des
            événements indésirables, suivi des alertes.
          </li>
          <li>
            <strong>Personnel soignant</strong> : suivi des patients et saisie des mesures NEWS, déclaration des
            événements indésirables.
          </li>
          <li>
            <strong>Gestionnaire de formation</strong> : suivi du catalogue et des réservations de formations.
          </li>
        </ul>
        <p>Un même Utilisateur peut cumuler plusieurs rôles.</p>
      </>
    ),
  },
  {
    id: "services",
    titre: "Description des services",
    contenu: (
      <>
        <p>La Plateforme propose quatre modules :</p>
        <ul>
          <li>
            <strong>Auto-évaluation qualité</strong> : évaluation de l&apos;Établissement selon la grille
            correspondant à son type, avec calcul automatique du score.
          </li>
          <li>
            <strong>Score NEWS</strong> : suivi des patients hospitalisés, calcul du score NEWS2 à partir de sept
            paramètres vitaux et alerte automatique en cas de risque moyen ou élevé.
          </li>
          <li>
            <strong>Événements indésirables</strong> : déclaration, qualification, analyse des causes, plan
            d&apos;actions correctives et suivi jusqu&apos;à la clôture.
          </li>
          <li>
            <strong>Formations</strong> : catalogue de formations à la sécurité des patients, réservation et
            paiement en ligne.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "conditions-financieres",
    titre: "Conditions financières",
    contenu: (
      <>
        <ul>
          <li>Le module d&apos;auto-évaluation est gratuit.</li>
          <li>
            Les modules Score NEWS et Événements indésirables bénéficient d&apos;une période d&apos;essai gratuite de
            90 jours, ouverte à la première utilisation de chaque module. À son terme, la poursuite de
            l&apos;utilisation est soumise à la souscription d&apos;un abonnement.
          </li>
          <li>
            Les formations sont payantes à l&apos;unité, selon la formule choisie (individuelle, groupe de 5 ou groupe
            de 10). Le tarif appliqué est celui affiché au moment de la réservation ; il n&apos;est plus modifié
            ensuite, même si le catalogue évolue.
          </li>
        </ul>
        <p>
          Les paiements sont traités par le prestataire KKiaPay. Chaque paiement est systématiquement revérifié par
          la Plateforme auprès de KKiaPay avant d&apos;être considéré comme acquis. Une facture est émise
          automatiquement dès la confirmation du paiement, et la date de la session de formation est communiquée
          sous 48 heures.
        </p>
      </>
    ),
  },
  {
    id: "obligations",
    titre: "Obligations des utilisateurs",
    contenu: (
      <>
        <p>L&apos;Utilisateur s&apos;engage notamment à :</p>
        <ul>
          <li>garder ses identifiants strictement confidentiels et ne jamais partager son compte ;</li>
          <li>signaler sans délai toute utilisation non autorisée de son compte ;</li>
          <li>
            n&apos;enregistrer que les données nécessaires aux finalités de la Plateforme, dans le respect du secret
            professionnel et médical ;
          </li>
          <li>
            ne pas tenter d&apos;accéder aux données d&apos;un autre Établissement, ni de contourner les mesures de
            sécurité de la Plateforme ;
          </li>
          <li>utiliser la Plateforme conformément à la réglementation en vigueur en République du Bénin.</li>
        </ul>
      </>
    ),
  },
  {
    id: "aide-decision",
    titre: "Nature des outils : une aide, pas une décision",
    contenu: (
      <>
        <p>
          Le score NEWS et les alertes qui en découlent constituent une aide à la surveillance clinique. Ils ne
          remplacent en aucun cas le jugement du professionnel de santé, qui reste seul responsable des décisions de
          prise en charge.
        </p>
        <p>
          Les résultats de l&apos;auto-évaluation sont un outil de pilotage interne de la qualité. Ils ne valent ni
          certification, ni accréditation, ni inspection officielle de l&apos;Établissement.
        </p>
      </>
    ),
  },
  {
    id: "integrite",
    titre: "Intégrité et traçabilité des données",
    contenu: (
      <>
        <p>Pour garantir la fiabilité des informations de sécurité des soins :</p>
        <ul>
          <li>
            une mesure NEWS ou un événement indésirable enregistré ne peut pas être supprimé ;
          </li>
          <li>une auto-évaluation soumise est définitivement figée, avec la version de la grille utilisée ;</li>
          <li>chaque changement de statut d&apos;un événement indésirable est historisé (auteur et date) ;</li>
          <li>les scores sont calculés par la Plateforme, jamais saisis manuellement.</li>
        </ul>
      </>
    ),
  },
  {
    id: "disponibilite",
    titre: "Disponibilité et responsabilité",
    contenu: (
      <>
        <p>
          La Plateforme est accessible en continu, sous réserve des opérations de maintenance et des incidents
          indépendants de sa volonté. Elle met en œuvre les moyens raisonnables pour assurer la sécurité et la
          continuité du service, sans pouvoir garantir une disponibilité ininterrompue.
        </p>
        <p>
          La Plateforme ne saurait être tenue responsable d&apos;un usage non conforme aux présentes CGU, ni des
          décisions prises par les Utilisateurs sur la base des informations qu&apos;elle restitue.
        </p>
      </>
    ),
  },
  {
    id: "suspension",
    titre: "Suspension et désactivation des comptes",
    contenu: (
      <p>
        En cas de manquement aux présentes CGU, d&apos;usage frauduleux ou de risque pour la sécurité des données,
        un compte Utilisateur ou un compte d&apos;Établissement peut être désactivé. Un compte désactivé ne permet
        plus de se connecter. Chaque Utilisateur peut par ailleurs consulter et fermer à tout moment ses sessions
        actives depuis son espace.
      </p>
    ),
  },
  {
    id: "credits",
    titre: "Propriété intellectuelle et crédits photographiques",
    contenu: (
      <>
        <p>
          La structure de la Plateforme, ses textes, ses éléments graphiques et son logiciel sont protégés. Toute
          reproduction sans autorisation est interdite. Les données saisies par un Établissement restent sa
          propriété.
        </p>
        <p>
          Les photographies de la vitrine proviennent de Wikimedia Commons et sont utilisées conformément à leur
          licence libre :
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Photographie</th>
                <th>Auteur</th>
                <th>Licence</th>
              </tr>
            </thead>
            <tbody>
              {CREDITS.map(({ photo, usage }) => (
                <tr key={photo.src}>
                  <td>
                    <a href={photo.source} target="_blank" rel="noopener noreferrer">
                      {photo.alt}
                    </a>
                    <br />
                    <span className="text-xs text-text-faint">{usage}</span>
                  </td>
                  <td>{photo.auteur}</td>
                  <td>{photo.licence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "donnees-personnelles",
    titre: "Données personnelles",
    contenu: (
      <p>
        Le traitement des données personnelles, y compris des données de santé, est décrit dans la{" "}
        <Link href="/politique-confidentialite">politique de confidentialité</Link>, qui fait partie intégrante des
        présentes CGU.
      </p>
    ),
  },
  {
    id: "modification",
    titre: "Modification des conditions",
    contenu: (
      <p>
        Les présentes CGU peuvent évoluer, notamment pour tenir compte de nouvelles fonctionnalités ou de
        changements réglementaires. La date de dernière mise à jour figure en tête de ce document. La poursuite de
        l&apos;utilisation de la Plateforme après une modification vaut acceptation des nouvelles CGU.
      </p>
    ),
  },
  {
    id: "droit-applicable",
    titre: "Droit applicable et contact",
    contenu: (
      <>
        <p>
          Les présentes CGU sont régies par le droit de la {SITE.pays}. À défaut de résolution amiable, tout litige
          relève des juridictions compétentes du Bénin.
        </p>
        <p>
          Pour toute question relative aux présentes CGU :{" "}
          <a href={`mailto:${SITE.emailContact}`}>{SITE.emailContact}</a>.
        </p>
      </>
    ),
  },
];

export default function ConditionsUtilisationPage() {
  return (
    <LegalPage
      surtitre="Informations légales"
      titre="Conditions générales d'utilisation"
      introduction={
        <p>
          Ces conditions décrivent les règles d&apos;utilisation de {SITE.nom} par les établissements de santé, leurs
          équipes et les comptes individuels. Elles reprennent les règles effectivement appliquées par la plateforme.
        </p>
      }
      sections={SECTIONS}
    />
  );
}

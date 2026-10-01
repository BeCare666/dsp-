import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type SectionLegale } from "@/components/marketing/legal-page";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment DSP collecte, protège et traite les données personnelles et les données de santé des établissements, de leurs équipes et de leurs patients.",
};

const DONNEES = [
  {
    categorie: "Comptes utilisateurs",
    detail: "Nom, prénom, adresse email, téléphone (facultatif), rôles, rattachement à un établissement et à un service, mot de passe (stocké uniquement sous forme chiffrée irréversible).",
  },
  {
    categorie: "Établissements",
    detail: "Nom, type (EH ou ESPC), numéro IFU, adresse, téléphone et email de contact.",
  },
  {
    categorie: "Patients (module NEWS)",
    detail: "Nom, prénom, date de naissance, sexe, numéro de dossier, dates d'admission et de sortie, service, constantes vitales mesurées, score NEWS, alertes et interventions associées.",
  },
  {
    categorie: "Événements indésirables",
    detail: "Description de l'événement, type, service, gravité, causes, actions correctives, historique des statuts et pièces jointes éventuelles.",
  },
  {
    categorie: "Auto-évaluation",
    detail: "Réponses aux grilles, scores calculés, dates de démarrage et de soumission, auteur des sessions.",
  },
  {
    categorie: "Formations",
    detail: "Réservations, formule choisie, tarif appliqué, identifiant de transaction KKiaPay, facture, date de session et présence.",
  },
  {
    categorie: "Données techniques",
    detail: "Sessions de connexion actives et journal des actions sensibles (connexions, déconnexions, actions d'administration).",
  },
];

const PRESTATAIRES = [
  { nom: "TiDB Cloud", role: "Hébergement de la base de données", lieu: "Centre de données AWS de Francfort (Allemagne)" },
  { nom: "Cloudinary", role: "Stockage des pièces jointes des événements indésirables", lieu: "Hors du Bénin" },
  { nom: "Brevo", role: "Envoi des emails transactionnels (confirmation, alertes, réinitialisation)", lieu: "Union européenne" },
  { nom: "KKiaPay", role: "Traitement des paiements des formations", lieu: "Bénin" },
];

const SECTIONS: SectionLegale[] = [
  {
    id: "responsables",
    titre: "Qui est responsable de vos données",
    contenu: (
      <>
        <p>
          <strong>Pour les données des comptes</strong> (utilisateurs, établissements, réservations), {SITE.nom} est
          responsable du traitement.
        </p>
        <p>
          <strong>Pour les données relatives aux patients et aux événements indésirables</strong>, chaque
          établissement de santé reste responsable du traitement des informations qu&apos;il saisit. {SITE.nom}{" "}
          agit alors comme prestataire technique : la plateforme héberge et traite ces données uniquement pour le
          compte de l&apos;établissement et selon ses instructions.
        </p>
      </>
    ),
  },
  {
    id: "cadre-legal",
    titre: "Cadre légal",
    contenu: (
      <p>
        Les traitements sont réalisés conformément à la loi n° 2017-20 du 20 avril 2018 portant Code du numérique en
        République du Bénin, et notamment à son livre consacré à la protection des données à caractère personnel,
        sous le contrôle de l&apos;Autorité de Protection des Données Personnelles (APDP).
      </p>
    ),
  },
  {
    id: "donnees",
    titre: "Données collectées",
    contenu: (
      <>
        <p>La plateforme ne collecte que les données nécessaires au fonctionnement de ses modules :</p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="w-44">Catégorie</th>
                <th>Données</th>
              </tr>
            </thead>
            <tbody>
              {DONNEES.map((ligne) => (
                <tr key={ligne.categorie}>
                  <td className="font-medium text-text">{ligne.categorie}</td>
                  <td>{ligne.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>Aucune donnée de carte bancaire ou de compte Mobile Money</strong> n&apos;est collectée ni stockée
          par {SITE.nom} : le paiement est saisi directement dans le module sécurisé de KKiaPay.
        </p>
      </>
    ),
  },
  {
    id: "finalites",
    titre: "Finalités du traitement",
    contenu: (
      <ul>
        <li>créer et sécuriser les comptes, authentifier les utilisateurs ;</li>
        <li>permettre l&apos;auto-évaluation qualité et le calcul des scores ;</li>
        <li>assurer la surveillance clinique des patients et déclencher les alertes NEWS ;</li>
        <li>déclarer, analyser et suivre les événements indésirables ;</li>
        <li>gérer les réservations, paiements et factures des formations ;</li>
        <li>envoyer les notifications liées au service (confirmation d&apos;email, alertes, dates de formation) ;</li>
        <li>assurer la sécurité de la plateforme et la traçabilité des actions sensibles.</li>
      </ul>
    ),
  },
  {
    id: "donnees-sante",
    titre: "Données de santé",
    contenu: (
      <>
        <p>
          Les informations relatives aux patients et aux événements indésirables sont des données de santé,
          particulièrement sensibles. Elles bénéficient de protections renforcées :
        </p>
        <ul>
          <li>
            elles ne sont accessibles qu&apos;aux utilisateurs de l&apos;établissement concerné, selon leur rôle ; le
            personnel soignant ne voit que les patients de son service ;
          </li>
          <li>
            aucun autre établissement n&apos;y a accès, et l&apos;administration de la plateforme ne les consulte
            pas : ses tableaux de bord ne présentent que des chiffres agrégés, sans identité de patient ni contenu
            d&apos;incident ;
          </li>
          <li>elles ne sont jamais vendues, ni utilisées à des fins publicitaires.</li>
        </ul>
      </>
    ),
  },
  {
    id: "destinataires",
    titre: "Destinataires et prestataires",
    contenu: (
      <>
        <p>
          Les données sont accessibles aux seuls utilisateurs habilités. Pour fonctionner, la plateforme fait appel
          aux prestataires techniques suivants, qui n&apos;agissent que sur ses instructions :
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Prestataire</th>
                <th>Rôle</th>
                <th>Localisation</th>
              </tr>
            </thead>
            <tbody>
              {PRESTATAIRES.map((p) => (
                <tr key={p.nom}>
                  <td className="font-medium text-text">{p.nom}</td>
                  <td>{p.role}</td>
                  <td>{p.lieu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Certaines données sont ainsi hébergées hors du Bénin. Ces transferts sont limités à ce qui est nécessaire
          au service et encadrés par les garanties de sécurité décrites ci-dessous.
        </p>
      </>
    ),
  },
  {
    id: "securite",
    titre: "Sécurité",
    contenu: (
      <ul>
        <li>mots de passe jamais stockés en clair (hachage bcrypt) ;</li>
        <li>connexion à la base de données chiffrée (TLS) ;</li>
        <li>cookies de session inaccessibles aux scripts du navigateur (httpOnly) ;</li>
        <li>cloisonnement systématique des données par établissement ;</li>
        <li>contrôle des accès par rôle, vérifié par le serveur à chaque requête ;</li>
        <li>limitation des tentatives de connexion et de réinitialisation de mot de passe ;</li>
        <li>journal des actions sensibles et possibilité de fermer à distance ses sessions actives.</li>
      </ul>
    ),
  },
  {
    id: "conservation",
    titre: "Durée de conservation",
    contenu: (
      <>
        <p>
          Les données des comptes sont conservées tant que le compte est actif. Les données de santé sont conservées
          pendant la durée d&apos;utilisation du service par l&apos;établissement, dans le respect des durées de
          conservation applicables aux dossiers de soins.
        </p>
        <p>
          Pour garantir l&apos;intégrité du suivi des soins, la sortie d&apos;un patient clôture sa fiche sans effacer
          son historique, et une mesure NEWS ou un événement indésirable ne peut pas être supprimé individuellement.
        </p>
      </>
    ),
  },
  {
    id: "droits",
    titre: "Vos droits",
    contenu: (
      <>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;opposition et, dans les limites
          prévues par la loi, d&apos;effacement de vos données. Vous pouvez corriger directement certaines
          informations depuis votre espace (coordonnées de l&apos;établissement, sessions actives).
        </p>
        <p>
          Pour exercer vos droits, écrivez à <a href={`mailto:${SITE.emailContact}`}>{SITE.emailContact}</a>. Les
          demandes concernant les données d&apos;un patient doivent être adressées à l&apos;établissement de santé
          qui l&apos;a pris en charge, responsable de ces données.
        </p>
        <p>Vous pouvez également introduire une réclamation auprès de l&apos;APDP.</p>
      </>
    ),
  },
  {
    id: "cookies",
    titre: "Cookies et stockage local",
    contenu: (
      <>
        <p>
          {SITE.nom} n&apos;utilise <strong>aucun cookie publicitaire ni outil de mesure d&apos;audience</strong>.
          Seuls les éléments strictement nécessaires au fonctionnement sont déposés :
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Finalité</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-text">access_token</td>
                <td>Maintenir votre connexion (cookie httpOnly)</td>
                <td>15 minutes</td>
              </tr>
              <tr>
                <td className="font-medium text-text">refresh_token</td>
                <td>Renouveler votre session de manière sécurisée (cookie httpOnly)</td>
                <td>30 jours</td>
              </tr>
              <tr>
                <td className="font-medium text-text">Stockage local</td>
                <td>Mémoriser l&apos;état ouvert ou replié des menus de votre espace</td>
                <td>Jusqu&apos;à suppression par le navigateur</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Lors d&apos;un paiement, le module KKiaPay peut déposer ses propres cookies, régis par la politique de ce
          prestataire.
        </p>
      </>
    ),
  },
  {
    id: "modification",
    titre: "Évolution de cette politique",
    contenu: (
      <p>
        Cette politique peut être mise à jour pour refléter l&apos;évolution de la plateforme ou de la
        réglementation. La date de dernière mise à jour figure en tête de page. Voir aussi les{" "}
        <Link href="/conditions-utilisation">conditions générales d&apos;utilisation</Link>.
      </p>
    ),
  },
];

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage
      surtitre="Informations légales"
      titre="Politique de confidentialité"
      introduction={
        <p>
          {SITE.nom} traite des données personnelles et des données de santé. Cette politique explique, sans jargon,
          quelles données sont collectées, pourquoi, où elles sont hébergées, comment elles sont protégées et
          comment exercer vos droits.
        </p>
      }
      sections={SECTIONS}
    />
  );
}

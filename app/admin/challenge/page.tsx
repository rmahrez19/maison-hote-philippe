import AuthShell from "@/components/admin/AuthShell";
import ChallengeForm from "@/components/admin/ChallengeForm";

export default function ChallengePage() {
  return (
    <AuthShell
      eyebrow="Administration"
      title="Vérification"
      description="Saisissez le code à 6 chiffres généré par votre application d'authentification."
    >
      <ChallengeForm />
    </AuthShell>
  );
}

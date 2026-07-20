import AuthShell from "@/components/admin/AuthShell";
import Setup2FAForm from "@/components/admin/Setup2FAForm";

export default function Setup2FAPage() {
  return (
    <AuthShell
      eyebrow="Administration · Configuration"
      title="Double authentification"
      description="Scannez ce QR code avec Google Authenticator ou Authy, puis saisissez le code à 6 chiffres pour valider l'association."
    >
      <Setup2FAForm />
    </AuthShell>
  );
}

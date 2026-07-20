import AuthShell from "@/components/admin/AuthShell";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <AuthShell
      eyebrow="Administration"
      title="Connexion"
      description="Réservé à l'hôte et à son développeur."
    >
      <LoginForm />
    </AuthShell>
  );
}

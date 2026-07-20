import { logout } from "@/app/admin/actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400 transition-colors hover:text-stone-900"
      >
        Se déconnecter
      </button>
    </form>
  );
}

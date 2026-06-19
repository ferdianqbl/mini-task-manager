import RegisterForm from "../../components/features/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#090D16] relative overflow-hidden">
      {/* Decorative modern backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <RegisterForm />
    </main>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticación',
  description: 'Inicia sesión o crea tu cuenta en Finanwas para comenzar tu camino hacia la libertad financiera. Accede a cursos, gestiona tu portfolio y alcanza tus metas de ahorro.',
  openGraph: {
    title: 'Únete a Finanwas - Plataforma de Educación Financiera',
    description: 'Crea tu cuenta gratis y comienza a aprender sobre inversiones, finanzas personales y gestión de dinero.',
  },
  twitter: {
    title: 'Únete a Finanwas - Plataforma de Educación Financiera',
    description: 'Crea tu cuenta gratis y comienza a aprender sobre inversiones, finanzas personales y gestión de dinero.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Finanwas</h1>
          <p className="text-muted">Tu camino hacia la libertad financiera</p>
        </div>
        {children}
      </div>
    </div>
  );
}

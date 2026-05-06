export const dynamic = 'force-dynamic';

// Este layout vacío sobrescribe el (standard) layout intencionalmente.
// El editor split-screen necesita ocupar el 100% del espacio disponible
// sin los paddings ni max-width que aplica el layout estándar.
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import ServicePausedView from '@/components/ui/ServicePausedView';

// Route langsung, kalau kamu mau redirect manual ke sini begitu tahu
// (misalnya dari sebuah health-check) Supabase project sedang paused.
export default function ServicePausedPage() {
  return <ServicePausedView />;
}

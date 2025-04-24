import { lusitana } from '@/app/ui/fonts';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('Dashboard');
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        {t('title')}
      </h1>
    </main>
  );
}
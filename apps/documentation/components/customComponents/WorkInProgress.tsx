import PopoutBox from '~/components/PopoutBox';
import { Paragraph } from '@codaco/ui';
import { cn } from '~/lib/utils';
import { useTranslations } from 'next-intl';

const WorkInProgress = () => {
  const t = useTranslations('WorkInProgress');
  return (
    <PopoutBox
      title={t('title')}
      className={cn(
        'bg-success/10 [--link:var(--success)]',
        '![background-color:color-mix(in_oklab,hsl(var(--background))_80%,hsl(var(--success)))]',
      )}
      iconClassName="bg-white"
      icon={
        <img
          src="/images/work-in-progress.svg"
          alt={t('title')}
          width={22}
          height={22}
        />
      }
    >
      <Paragraph>{t('content')}</Paragraph>
    </PopoutBox>
  );
};

export default WorkInProgress;

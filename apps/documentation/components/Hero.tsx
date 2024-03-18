'use client';

import { BackgroundBlobs } from '@codaco/art';
import { buttonVariants } from '@codaco/ui';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '~/navigation';
import DocSearchComponent from './DocSearchComponent';
import FancyHeading from './FancyHeading';
import FancyParagraph from './FancyParagraph';
import { cn } from '~/lib/utils';
import Image from 'next/image';

export function Hero() {
  const t = useTranslations();

  return (
    <div className="h-full overflow-hidden">
      <div className="py-20">
        <div className="mx-auto grid grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-6xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
          <div className="relative md:text-center lg:text-left">
            <div className="relative">
              <FancyHeading variant="h1" className="text-4xl">
                {t('Hero.title')}
              </FancyHeading>
              <FancyParagraph variant="lead">
                {t('Hero.tagline')}
              </FancyParagraph>
              <div className="hidden pt-8 lg:block">
                <DocSearchComponent className="!w-full text-base" large />
                <Link
                  href="/desktop"
                  className={cn(
                    buttonVariants({ variant: 'accent' }),
                    'w-full',
                  )}
                >
                  {t('ProjectSwitcher.desktop.label')}
                </Link>
                <Link
                  href="/fresco"
                  className={cn(
                    buttonVariants({ variant: 'secondary' }),
                    'w-full',
                  )}
                >
                  {t('ProjectSwitcher.fresco.label')}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6">
            <Image
              src="images/robot.svg"
              width={400}
              height={400}
              alt="Robot"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

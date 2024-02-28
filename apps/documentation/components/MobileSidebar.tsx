'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Dialog } from '@headlessui/react';

import { Navigation } from '~/components/Sidebar';

function MenuIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M5 5l14 14M19 5l-14 14" />
    </svg>
  );
}

function CloseOnNavigation({ close }: { close: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    close();
  }, [pathname, searchParams, close]);

  return null;
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  function onLinkClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const link = event.currentTarget;
    if (
      link.pathname + link.search + link.hash ===
      window.location.pathname + window.location.search + window.location.hash
    ) {
      close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative"
        aria-label="Open navigation"
      >
        <MenuIcon className="stroke-slate-500 h-6 w-6" />
      </button>
      <Suspense fallback={null}>
        <CloseOnNavigation close={close} />
      </Suspense>
      <Dialog
        open={isOpen}
        onClose={() => close()}
        className="bg-slate-900/50 fixed inset-0 z-50 flex items-start overflow-y-auto pr-10 backdrop-blur lg:hidden"
        aria-label="Navigation"
      >
        <Dialog.Panel className="dark:bg-slate-900 min-h-full w-full max-w-xs bg-white px-4 pb-12 pt-5 sm:px-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => close()}
              aria-label="Close navigation"
            >
              <CloseIcon className="stroke-slate-500 h-6 w-6" />
            </button>
            <Link href="/" className="ml-6" aria-label="Home page">
              <Image
                src="/images/mark.svg"
                alt="Network Canvas Documentation"
                width={36}
                height={36}
              />
            </Link>
          </div>
          <Navigation className="mt-5 px-1" onLinkClick={onLinkClick} />
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

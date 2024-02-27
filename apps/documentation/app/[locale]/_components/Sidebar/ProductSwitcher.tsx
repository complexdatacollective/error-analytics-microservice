'use client';

import { type Dispatch, type SetStateAction } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@acme/ui';

import { useRouter } from '~/navigation';

type ProductSwitcherProps = {
  setProduct: Dispatch<SetStateAction<string>>;
  product: string;
};

export default function ProductSwitcher({
  setProduct,
  product,
}: ProductSwitcherProps) {
  const router = useRouter();
  const t = useTranslations('ProductSwitcher');
  const locale = useLocale();

  return (
    <Select
      value={product}
      onValueChange={(val) => {
        setProduct(val);
        router.push(`/${val}`, { locale });
      }}
    >
      <SelectTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 h-16 w-full text-sm transition-colors lg:text-base">
        <SelectValue placeholder={t('selectPlaceholder')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem className="text-sm lg:text-base" value="desktop">
            {t('desktop')}
          </SelectItem>
          <SelectItem className="text-sm lg:text-base" value="fresco">
            {t('fresco')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

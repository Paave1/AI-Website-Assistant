import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'fi'}];
}

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {children} = props;
  const {locale} = await props.params;
  const messages = await getMessages();
  return <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>;
}



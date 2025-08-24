import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  const supported = ['en', 'fi'] as const;
  const normalized = (locale && (supported as readonly string[]).includes(locale)) ? locale : 'en';
  const lc = normalized as 'en' | 'fi';
  const messages = (await import(`./messages/${lc}.json`)).default;
  return {messages, locale: lc};
});



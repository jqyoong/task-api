export type SupportLocales = Array<'en-MY'>;

export default async ({ supportedLocales }: { supportedLocales: SupportLocales }) => {
  const translationsMessages: {
    [key: string]: {
      [key: string]: string;
    };
  } = {};

  await Promise.all(
    supportedLocales.map(async (locale) => {
      try {
        const localeMessages = await import(`./${locale}`);
        translationsMessages[locale] = localeMessages.default;
      } catch (e) {
        translationsMessages[locale] = (await import('./en-MY')).default;
      }
    })
  );

  return translationsMessages;
};

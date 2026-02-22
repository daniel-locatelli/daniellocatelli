export type LegalSection = {
  heading: string;
  content: string;
};

export type LegalPage = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export type I18nLegal = {
  privacyPolicy: LegalPage;
  terms: LegalPage;
  impressum: LegalPage;
};

export interface Content {
  siteName: string
  email: string
  langLabels: { en: string; uk: string }
  nav: {
    psychotherapy: string
    about: string
    contact: string
  }
  menu: {
    open: string
    close: string
    title: string
    book: string
    emailLabel: string
  }
  footer: {
    emailLabel: string
    rights: string
    privacy: string
    credit: string
  }
  pages: {
    home: { title: string }
    psychotherapy: { title: string }
    about: { title: string }
    contact: { title: string }
    privacyPolicy: { title: string }
  }
}

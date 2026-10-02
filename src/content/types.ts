export interface Content {
  siteName: string
  nav: {
    psychotherapy: string
    about: string
    contact: string
  }
  pages: {
    home: { title: string }
    psychotherapy: { title: string }
    about: { title: string }
    contact: { title: string }
    privacyPolicy: { title: string }
  }
}

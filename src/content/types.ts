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
  home: {
    heroLines: string[]
    intro: {
      titleLines: [string, string]
      paragraphs: string[]
    }
    cards: {
      label: string
      slides: { title: string; quote: string; author: string }[]
    }
    wishes: {
      label: string
      heading: string
      note: string
      featured: {
        initial: string
        number: string
        title: string
        subtitle: string
        paragraphs: string[]
      }
      items: {
        initial: string
        number: string
        title: string
      }[]
      wellnessWord: string
    }
  }
  pages: {
    home: { title: string }
    psychotherapy: { title: string }
    about: { title: string }
    contact: { title: string }
    privacyPolicy: { title: string }
  }
}

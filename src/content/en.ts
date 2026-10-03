import type { Content } from './types'

export const en: Content = {
  siteName: 'Your Name',
  email: 'hello@example.com',
  langLabels: { en: 'EN', uk: 'UK' },
  nav: {
    psychotherapy: 'Psychotherapy',
    about: 'About',
    contact: 'Contact',
  },
  menu: {
    open: 'Menu',
    close: 'Close',
    title: 'Menu',
    book: 'Book an intro call',
    emailLabel: 'Email:',
  },
  footer: {
    emailLabel: 'email:',
    rights: 'All rights reserved.',
    privacy: 'Privacy policy',
    credit: 'Design credit - O.LA',
  },
  home: {
    heroLines: [
      'Change rarely begins',
      'with an answer.',
      'It begins with the patience',
      'to listen inward.',
    ],
    intro: {
      titleLines: ['Psychotherapy offers', 'a way back to yourself'],
      paragraphs: [
        'A steady space to make sense of your feelings, your relationships and the patterns that keep repeating.',
        'Whether you are facing anxiety, grief, burnout or a turning point in life, or simply want to know yourself better, therapy can open new directions.',
        'Together, in a confidential setting, we look beneath the surface, trace where the difficulties began and build change that lasts.',
      ],
    },
    cards: {
      label: 'What brings you here',
      slides: [
        {
          title: 'Anxiety or low mood weighs on you',
          quote: 'Heavy days are real. They are not the whole story.',
          author: 'Placeholder author',
        },
        {
          title: 'Being kind to yourself feels hard',
          quote: 'Acceptance is where change quietly starts.',
          author: 'Placeholder author',
        },
        {
          title: 'Life is shifting under your feet',
          quote: 'When the path changes, we find new ways to walk.',
          author: 'Placeholder author',
        },
        {
          title: 'Old wounds still ache',
          quote: 'What we can name, we can begin to tend.',
          author: 'Placeholder author',
        },
        {
          title: 'You want closer connections',
          quote: 'Being seen is a risk worth learning to take.',
          author: 'Placeholder author',
        },
      ],
    },
  },
  pages: {
    home: { title: 'Home' },
    psychotherapy: { title: 'Psychotherapy' },
    about: { title: 'About me' },
    contact: { title: 'Contacts' },
    privacyPolicy: { title: 'Privacy policy' },
  },
}

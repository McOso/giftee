// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Site
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
interface SiteConfig {
  name: string
  title: string
  tagline: string
  emoji: string
  description: string
  localeDefault: string
  links: {
    twitter: string
    github: string
  }
}

export const SITE_CANONICAL = 'https://turboeth.xyz'

export const siteConfig: SiteConfig = {
  name: 'giftee',
  title: 'giftee 🧧 magical gift cards',
  tagline: 'magical gift cards',
  emoji: '🧧',
  description: 'a magical way to send USDC gift cards.',
  localeDefault: 'en',
  links: {
    twitter: 'https://twitter.com/mcoso_',
    github: 'https://github.com/mcoso/giftee',
  },
}

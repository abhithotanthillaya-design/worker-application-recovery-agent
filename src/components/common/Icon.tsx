import type { SVGProps } from 'react'

type IconName = 'spark' | 'plus' | 'inbox' | 'user' | 'settings' | 'chevron' | 'attach' | 'arrow' | 'shield' | 'search' | 'check' | 'menu' | 'close' | 'clock' | 'file'
const paths: Record<IconName, React.ReactNode> = {
  spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>, inbox: <><path d="M4 5h16v14H4z"/><path d="M4 13h4l2 3h4l2-3h4"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.3.8l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.3-.8l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.6l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.3-.8l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.3.8l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.5Z"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>, attach: <path d="m20.5 11.5-8.7 8.7a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 0 1 5 5L9.7 18a2 2 0 0 1-2.8-2.8l8.5-8.5"/>,
  arrow: <><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>, shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>, check: <path d="m5 12 4 4L19 6"/>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>, close: <><path d="m6 6 12 12M18 6 6 18"/></>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, file: <><path d="M13 3H6v18h12V8z"/><path d="M13 3v5h5M9 13h6M9 17h6"/></>
}

export function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}

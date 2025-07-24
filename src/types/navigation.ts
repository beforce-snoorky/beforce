export type NavItemProps = {
  icon: React.ReactNode
  name: string
  url: string
}

export type NavListProps = {
  title?: string
  items: { icon: React.ReactNode; name: string; url: string }[]
  pathname: string
  isMobile?: boolean
}

export type NavLinkProps = {
  item: { icon: React.ReactNode; name: string; url: string }
  pathname: string
  isMobile?: boolean
}

export type NavButtonProps = {
  label: string
  icon: React.ReactNode
  onClick: () => void
}
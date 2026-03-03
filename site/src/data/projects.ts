export type ProjectLinkType = 'github' | 'site' | 'npm' | 'bilibili'

export interface ProjectItem {
  name: string
  description: string
  links: Array<{
    type: ProjectLinkType
    href: string
  }>
}

export const projects: ProjectItem[] = [
  {
    name: 'Your Project Name',
    description: 'Briefly describe what this project solves and your contribution.',
    links: [
      { type: 'github', href: 'https://github.com/yourname/your-project' },
      { type: 'site', href: 'https://example.com' }
    ]
  }
]

'use client'

import ClubWebsiteRenderer from '@/components/website/ClubWebsiteRenderer'
import type { ClubWebsiteData } from '@/lib/website/templates/types'

interface Props extends ClubWebsiteData {
  isDemo?: boolean
}

export default function ClubPublicPage(props: Props) {
  return <ClubWebsiteRenderer {...props} />
}

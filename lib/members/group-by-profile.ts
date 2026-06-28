/** One row per profile — merges multiple club_memberships (roles) for the same person. */

export interface GroupedMember {
  profile_id: string
  profiles: {
    full_name?: string | null
    email?: string | null
    avatar_url?: string | null
  } | null
  roles: {
    id?: string
    slug?: string
    name_sv?: string | null
    name_en?: string | null
  }[]
  membership_ids: string[]
  status: string
}

export function groupMembersByProfile(memberships: Record<string, unknown>[]): GroupedMember[] {
  const map = new Map<string, GroupedMember>()

  for (const m of memberships) {
    const profileId = m.profile_id as string
    if (!profileId) continue

    const role = m.club_roles as GroupedMember['roles'][0] | null
    const existing = map.get(profileId)

    if (!existing) {
      map.set(profileId, {
        profile_id: profileId,
        profiles: (m.profiles as GroupedMember['profiles']) ?? null,
        roles: role ? [role] : [],
        membership_ids: [m.id as string],
        status: (m.status as string) ?? 'active',
      })
    } else {
      if (role && !existing.roles.some(r => r.id === role.id)) {
        existing.roles.push(role)
      }
      existing.membership_ids.push(m.id as string)
    }
  }

  return Array.from(map.values())
}

export function roleLabel(role: GroupedMember['roles'][0]): string {
  return role.name_sv || role.name_en || role.slug || 'Medlem'
}

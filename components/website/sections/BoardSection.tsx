import SectionHeading from '../ui/SectionHeading'
import { IconBuilding } from '../icons'

interface BoardSectionProps {
  title: string
  boardMembers: Record<string, unknown>[]
}

export default function BoardSection({ title, boardMembers }: BoardSectionProps) {
  if (boardMembers.length === 0) return null

  return (
    <section>
      <SectionHeading title={title} icon={<IconBuilding />} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boardMembers.map(m => {
          const profile = m.profiles as Record<string, unknown>
          const role = m.club_roles as Record<string, unknown>
          return (
            <div
              key={m.id as string}
              className="border p-4 text-center"
              style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3 overflow-hidden"
                style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}
              >
                {profile?.avatar_url
                  ? <img src={profile.avatar_url as string} alt="" className="w-full h-full object-cover" />
                  : (profile?.full_name as string)?.charAt(0) || '?'}
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--site-card-fg)' }}>{profile?.full_name as string}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--site-primary)' }}>{role?.name_sv as string}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

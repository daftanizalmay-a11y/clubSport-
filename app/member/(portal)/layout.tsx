import MemberShell from '@/components/member/MemberShell'

export default function MemberPortalLayout({ children }: { children: React.ReactNode }) {
  return <MemberShell>{children}</MemberShell>
}

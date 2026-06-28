'use client'

import type { MemberPaymentRow } from '@/lib/finances/member-payments'
import StatusBadge from './StatusBadge'
import EditPaymentModal from './EditPaymentModal'
import SendReminderButton from './SendReminderButton'

interface Props {
  clubId: string
  clubName: string
  primaryColor?: string
  members: MemberPaymentRow[]
  onRefresh: () => void
  onGenerate?: () => void
  generating?: boolean
  missingCount?: number
}

export default function MembersPaymentList({
  clubId,
  primaryColor,
  members,
  onRefresh,
  onGenerate,
  generating,
  missingCount = 0,
}: Props) {
  const paidCount = members.filter(m => m.payment_status === 'paid').length
  const partialCount = members.filter(m => m.payment_status === 'partially_paid').length
  const unpaidCount = members.filter(m => m.payment_status === 'unpaid' || m.payment_status === 'overdue').length

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Medlemmar', count: members.length, color: 'text-white' },
          { label: 'Betalda', count: paidCount, color: 'text-[#22c55e]' },
          { label: 'Delvis', count: partialCount, color: 'text-yellow-400' },
          { label: 'Obetalda', count: unpaidCount, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-white/40 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {missingCount > 0 && onGenerate && (
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={onGenerate} disabled={generating}
            className="text-sm px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl disabled:opacity-50 cursor-pointer">
            {generating ? 'Genererar...' : `Generera avgift för ${missingCount} medlem${missingCount !== 1 ? 'mar' : ''}`}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {members.map(member => (
          <div key={member.profile_id} className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
            <div className="flex justify-between items-start mb-3 gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                  style={{ backgroundColor: primaryColor || '#22c55e' }}>
                  {member.full_name.charAt(0) || '?'}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{member.full_name}</h4>
                  <p className="text-xs text-white/40">{member.email}</p>
                </div>
              </div>
              <StatusBadge status={member.payment_status} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-white/40">Förfallet belopp</p>
                <p className="text-lg font-semibold text-white">{member.amount_due.toLocaleString('sv-SE')} kr</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Betalt</p>
                <p className="text-lg font-semibold text-[#22c55e]">{member.amount_paid.toLocaleString('sv-SE')} kr</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Kvarvarande</p>
                <p className={`text-lg font-semibold ${member.amount_remaining > 0 ? 'text-red-400' : 'text-[#22c55e]'}`}>
                  {member.amount_remaining.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>

            {member.notes && (
              <p className="text-xs text-white/30 italic mb-3">Anteckning: {member.notes}</p>
            )}

            {member.payment_id ? (
              <div className="flex flex-wrap gap-3 items-start">
                <EditPaymentModal
                  clubId={clubId}
                  paymentId={member.payment_id}
                  currentAmount={member.amount_paid}
                  dueAmount={member.amount_due}
                  currentNotes={member.notes}
                  primaryColor={primaryColor}
                  onSave={onRefresh}
                />
                {member.amount_remaining > 0 && member.payment_status !== 'waived' && (
                  <SendReminderButton
                    clubId={clubId}
                    paymentId={member.payment_id}
                    memberName={member.full_name}
                    amountRemaining={member.amount_remaining}
                    lastReminder={member.last_reminder_sent_at}
                    reminderCount={member.reminder_count}
                    onSent={onRefresh}
                  />
                )}
              </div>
            ) : (
              <p className="text-xs text-white/30">Avgift ej genererad — klicka &quot;Generera avgift&quot; ovan.</p>
            )}

            {member.last_reminder_sent_at && member.payment_id && member.amount_remaining <= 0 && (
              <p className="text-xs text-white/30 mt-2">
                Påminnelser skickade: {member.reminder_count}× (senast{' '}
                {new Date(member.last_reminder_sent_at).toLocaleDateString('sv-SE')})
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

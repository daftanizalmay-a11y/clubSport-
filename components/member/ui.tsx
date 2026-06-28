function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sv-SE', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export { Card, formatDate }

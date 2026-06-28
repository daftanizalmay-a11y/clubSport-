export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-white font-bold">Club</span>
          <span className="text-[#22c55e] font-bold">Sports</span>
          <p className="text-white/30 text-sm mt-1">Föreningsplattformen för moderna klubbar.</p>
        </div>
        <p className="text-white/20 text-sm">© 2026 ClubSports. Alla rättigheter förbehållna.</p>
      </div>
    </footer>
  )
}

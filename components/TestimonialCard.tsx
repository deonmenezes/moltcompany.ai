export function TestimonialCard({
  name,
  role,
  quote,
  stars,
}: {
  name: string
  role: string
  quote: string
  stars: number
}) {
  return (
    <div className="comic-card p-6">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-xl ${i < stars ? 'text-brand-yellow' : 'text-gray-300'}`}>
            &#9733;
          </span>
        ))}
      </div>

      <p className="text-brand-gray-dark font-body text-base mb-6 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3 border-t-2 border-black pt-4">
        <div className="w-10 h-10 rounded-full bg-brand-yellow border-2 border-black flex items-center justify-center">
          <span className="font-display font-black text-sm">{name.charAt(0)}</span>
        </div>
        <div>
          <div className="font-display font-bold text-sm text-black">{name}</div>
          <div className="text-xs text-brand-gray-medium">{role}</div>
        </div>
      </div>
    </div>
  )
}

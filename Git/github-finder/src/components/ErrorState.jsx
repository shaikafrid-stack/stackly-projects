export default function ErrorState({ message }) {
  return (
    <div className="card fade-in w-full max-w-2xl mx-auto p-10 flex flex-col items-center gap-4 text-center">
      <div className="text-4xl select-none">⚠</div>
      <h3 className="font-display font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
        Oops, something went wrong
      </h3>
      <p className="text-sm text-[--text-muted] font-mono max-w-xs leading-relaxed">
        {message}
      </p>
    </div>
  )
}

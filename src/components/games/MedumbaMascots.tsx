export function PathMascot({ className = "h-44 w-40" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mascots/medumba-lion.png"
      alt="Lion"
      width={320}
      height={320}
      className={`max-w-none object-contain ${className}`}
    />
  );
}

export function SpeakerMascot() {
  return <PathMascot className="h-40 w-36" />;
}

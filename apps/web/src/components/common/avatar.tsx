interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
  className?: string;
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, src, size = 32, className = "" }: AvatarProps) {
  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-[var(--accent-muted)] text-[var(--accent)] font-medium ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
      title={name}
    >
      {src ? (
        <img src={src} alt={name ?? "User"} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

// ── Filter chip & row components for the Coaching Directory ──────────────────

export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-primary border-primary text-zinc-950"
          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export function FilterRow({ label, tags, selected, onToggle }: {
  label: string;
  tags: { tag_key: string; tag_label: string }[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mr-1 w-20 shrink-0">{label}</span>
      {tags.map(t => (
        <FilterChip
          key={t.tag_key}
          label={t.tag_label}
          active={selected.includes(t.tag_key)}
          onClick={() => onToggle(t.tag_key)}
        />
      ))}
    </div>
  );
}

/** Toggle a value in/out of a multi-select set */
export function toggle(set: string[], value: string): string[] {
  return set.includes(value) ? set.filter(v => v !== value) : [...set, value];
}

export function Badge({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div className="py-0 px-2 text-11 rounded text-custom-text-300 bg-surface-2 flex flex-shrink-0 items-center gap-1">
      {icon}
      {text}
    </div>
  );
}

import Typing from "./typing";

export function Thinking({ text = "Thinking" }: { text?: string }) {
  return (
    <div className="flex">
      <span className="text-base">{text} &nbsp;</span>
      <Typing />
    </div>
  );
}

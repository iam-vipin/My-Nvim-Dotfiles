type TProps = {
  text: string;
};

export function ConjunctionLabel(props: TProps) {
  const { text } = props;

  return <p className="leading-4 text-13 text-accent-primary font-medium font-mono uppercase">{text}</p>;
}

type TProps = {
  text: string;
};

export function ConjunctionLabel(props: TProps) {
  const { text } = props;

  return <p className="leading-4 text-sm text-custom-primary-100 font-medium font-mono uppercase">{text}</p>;
}

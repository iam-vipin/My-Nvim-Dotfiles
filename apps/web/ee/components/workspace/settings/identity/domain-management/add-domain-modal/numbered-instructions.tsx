type TNumberedInstructions = {
  instructions: string[];
};

export function NumberedInstructions({ instructions }: TNumberedInstructions) {
  return (
    <div className="space-y-2 p-4 bg-layer-1 rounded-lg">
      {instructions.map((instruction, index) => (
        <div key={index} className="flex gap-2 text-body-xs-regular text-secondary">
          <span className="shrink-0">{index + 1}.</span>
          <p>{instruction}</p>
        </div>
      ))}
    </div>
  );
}

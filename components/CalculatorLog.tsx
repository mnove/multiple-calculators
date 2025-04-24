import React from "react";

interface CalculatorLogProps {
  operations: string[];
}

export function CalculatorLog({ operations }: CalculatorLogProps) {
  return (
    <div className="mt-5 w-full max-w-[320px] bg-background border border-border rounded-[var(--radius)] shadow-md p-4">
      <h3 className="text-lg mb-2 text-foreground font-medium">
        Operation History
      </h3>
      {operations.length === 0 ? (
        <p className="text-muted-foreground italic">No operations yet</p>
      ) : (
        <ul className="list-none p-0 m-0 max-h-[200px] overflow-y-auto">
          {operations.map((operation, index) => (
            <li
              key={index}
              className="py-2 px-2 border-b border-border text-foreground last:border-none"
            >
              {operation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

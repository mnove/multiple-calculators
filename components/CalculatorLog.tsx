import React from "react";

interface CalculatorLogProps {
  operations: string[];
}

export function CalculatorLog({ operations }: CalculatorLogProps) {
  return (
    <div className="calculator-log">
      <h3 className="log-title">Operation History</h3>
      {operations.length === 0 ? (
        <p className="log-empty">No operations yet</p>
      ) : (
        <ul className="log-list">
          {operations.map((operation, index) => (
            <li key={index} className="log-item">
              {operation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

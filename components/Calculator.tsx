"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Add these props to the Calculator component interface
export default function Calculator({
  id = "calc1",
  removeCalculator,
  isFirst = false,
  isLast = false,
  transferResult,
  prevCalculator,
  nextCalculator,
}: {
  id?: string;
  removeCalculator: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  transferResult?: (fromId: string, toId: string, value: string) => void;
  prevCalculator: string | null;
  nextCalculator: string | null;
}) {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [fullExpression, setFullExpression] = useState("");
  const [operationHistory, setOperationHistory] = useState<string[]>([]);

  // Load operation history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(`calculatorHistory_${id}`);
      if (savedHistory) {
        setOperationHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load calculator history:", error);
    }
  }, [id]);

  // Save operation history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      `calculatorHistory_${id}`,
      JSON.stringify(operationHistory)
    );
  }, [operationHistory, id]);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
      setFullExpression(fullExpression + digit);
    } else {
      const newDisplay = display === "0" ? digit : display + digit;
      setDisplay(newDisplay);

      // If we're just starting or after clear, update fullExpression to match display
      if (!firstOperand && !operator) {
        setFullExpression(newDisplay);
      } else if (operator) {
        // If we're entering the second operand
        setFullExpression(fullExpression + digit);
      }
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      setFullExpression(fullExpression + "0.");
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
      setFullExpression(fullExpression + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setFullExpression("");
  };

  const handleOperator = (nextOperator: string) => {
    const operatorSymbol = getOperatorSymbol(nextOperator);

    if (firstOperand === null) {
      setFirstOperand(display);
      setFullExpression(display + " " + operatorSymbol + " ");
    } else if (operator) {
      // Keep the full expression going and just append the new operator
      // instead of doing the calculation and starting a new expression
      setFullExpression(fullExpression + " " + operatorSymbol + " ");

      // Store the current calculation result
      const result = performCalculation();
      setDisplay(String(result));
      setFirstOperand(String(result));
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const getOperatorSymbol = (op: string): string => {
    switch (op) {
      case "+":
        return "+";
      case "-":
        return "−";
      case "*":
        return "×";
      case "/":
        return "÷";
      case "%":
        return "%";
      default:
        return op;
    }
  };

  const performCalculation = (): number => {
    const firstValue = parseFloat(firstOperand!);
    const secondValue = parseFloat(display);

    if (operator === "+") return firstValue + secondValue;
    if (operator === "-") return firstValue - secondValue;
    if (operator === "*") return firstValue * secondValue;
    if (operator === "/") return firstValue / secondValue;
    if (operator === "%") return firstValue * (secondValue / 100);

    return secondValue;
  };

  const calculateResult = () => {
    if (!firstOperand || !operator) return;

    const result = performCalculation();
    setDisplay(String(result));

    // Create log entry and add to history (most recent first)
    const logEntry = `${fullExpression} = ${result}`;
    setOperationHistory([logEntry, ...operationHistory]);

    // Show the full expression with the result first
    setFullExpression(fullExpression + " = " + result);

    // Reset the expression after a brief delay
    setTimeout(() => {
      setFullExpression(String(result));
    }, 1500);

    // Next operation should use the result as the first operand
    setFirstOperand(String(result));
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  // Add useEffect to listen for transfer events
  useEffect(() => {
    const handleTransferReceive = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.targetId === id) {
        const receivedValue = customEvent.detail.value;
        const sourceId = customEvent.detail.sourceId;

        // Set the received value to display
        setDisplay(receivedValue);

        // Reset calculator state for new operations with this value
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
        setFullExpression(receivedValue);

        // Add to history that value was received from another calculator
        const logEntry = `Received value ${receivedValue} from calculator ${sourceId}`;
        setOperationHistory([logEntry, ...operationHistory]);
      }
    };

    // Add event listener
    document.addEventListener("calculator-transfer", handleTransferReceive);

    // Clean up
    return () => {
      document.removeEventListener(
        "calculator-transfer",
        handleTransferReceive
      );
    };
  }, [id, operationHistory]);

  // Function to handle transfer of result
  const handleTransferResult = (targetId: string) => {
    if (transferResult && targetId) {
      transferResult(id, targetId, display);
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-2">
        {!isFirst && prevCalculator && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => handleTransferResult(prevCalculator)}
          >
            ← Send to Previous
          </Button>
        )}
        {!isLast && nextCalculator && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => handleTransferResult(nextCalculator)}
          >
            Send to Next →
          </Button>
        )}
      </div>

      <div className="calculator">
        <div className="p-1.5 flex items-center justify-between">
          <p className="font-mono text-sm text-muted-foreground">Standard</p>

          <DropdownMenu>
            <DropdownMenuTrigger>
              {" "}
              <div className=" h-6 w-6">
                <MoreHorizontal className="hover:bg-muted rounded-sm cursor-pointer text-muted-foreground" />{" "}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => removeCalculator(id)}>
                Delete Calculator
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="expression-container">
          <div className="expression">{fullExpression || display}</div>
        </div>
        <div className="display">{display}</div>
        <div className="keypad">
          <button onClick={clearDisplay} className="key clear">
            C
          </button>
          <button
            onClick={() => {
              const newDisplay =
                display.charAt(0) === "-"
                  ? display.substring(1)
                  : "-" + display;
              setDisplay(newDisplay);
              if (!operator) {
                setFullExpression(newDisplay);
              }
            }}
            className="key"
          >
            +/-
          </button>
          <button onClick={() => handleOperator("%")} className="key">
            %
          </button>
          <button onClick={() => handleOperator("/")} className="key operator">
            ÷
          </button>

          <button onClick={() => inputDigit("7")} className="key">
            7
          </button>
          <button onClick={() => inputDigit("8")} className="key">
            8
          </button>
          <button onClick={() => inputDigit("9")} className="key">
            9
          </button>
          <button onClick={() => handleOperator("*")} className="key operator">
            ×
          </button>

          <button onClick={() => inputDigit("4")} className="key">
            4
          </button>
          <button onClick={() => inputDigit("5")} className="key">
            5
          </button>
          <button onClick={() => inputDigit("6")} className="key">
            6
          </button>
          <button onClick={() => handleOperator("-")} className="key operator">
            −
          </button>

          <button onClick={() => inputDigit("1")} className="key">
            1
          </button>
          <button onClick={() => inputDigit("2")} className="key">
            2
          </button>
          <button onClick={() => inputDigit("3")} className="key">
            3
          </button>
          <button onClick={() => handleOperator("+")} className="key operator">
            +
          </button>

          <button onClick={() => inputDigit("0")} className="key zero">
            0
          </button>
          <button onClick={inputDecimal} className="key">
            .
          </button>
          <button onClick={calculateResult} className="key operator">
            =
          </button>
        </div>
      </div>

      {/* <CalculatorLog operations={operationHistory} /> */}
    </>
  );
}

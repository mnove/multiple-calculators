"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CalculatorLog } from "./CalculatorLog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

// get a different colors for each calculator id

const getCalculatorColor = (id: string) => {
  const colors = [
    "bg-orange-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-lime-600",
  ];
  const index = parseInt(id.split("_")[1]) % colors.length;
  return colors[index];
};

// Add these props to the Calculator component interface
export default function Calculator({
  id = "calc_1",
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
  const [isFocused, setIsFocused] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // State to track which button was recently pressed for visual feedback
  const [activeButton, setActiveButton] = useState<string | null>(null);

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

  // Add effect to clear active button state after a short delay
  useEffect(() => {
    if (activeButton) {
      const timer = setTimeout(() => {
        setActiveButton(null);
      }, 150); // Clear active state after 150ms
      return () => clearTimeout(timer);
    }
  }, [activeButton]);

  const inputDigit = (digit: string) => {
    setActiveButton(digit); // Set active button for visual feedback

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
    setActiveButton("."); // Set active button for visual feedback

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
    setActiveButton("C"); // Set active button for visual feedback

    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setFullExpression("");
  };

  const handleOperator = (nextOperator: string) => {
    setActiveButton(nextOperator); // Set active button for visual feedback

    const operatorSymbol = getOperatorSymbol(nextOperator);

    // When starting a new operation after a previous calculation
    if (operator === null && firstOperand !== null) {
      // This happens when we've just calculated a result and now we're starting a new operation
      setFullExpression(display + " " + operatorSymbol + " ");
    } else if (firstOperand === null) {
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
    setActiveButton("="); // Set active button for visual feedback

    if (!firstOperand || !operator) return;

    const result = performCalculation();
    setDisplay(String(result));

    // Create log entry and add to history (most recent first)
    const logEntry = `${fullExpression} = ${result}`;
    setOperationHistory([logEntry, ...operationHistory]);

    // Show the full expression with the result first
    setFullExpression(fullExpression + " = " + result);

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

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent default behavior for calculator keys to avoid scrolling with space, etc.
    if (
      [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        ".",
        "+",
        "-",
        "*",
        "/",
        "%",
        "=",
        "Enter",
        "Backspace",
        "Delete",
        "Escape",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }

    // Numeric keys and decimal
    if (/^[0-9]$/.test(e.key)) {
      setActiveButton(e.key); // Set active button for visual feedback
      inputDigit(e.key);
    } else if (e.key === ".") {
      setActiveButton("."); // Set active button for visual feedback
      inputDecimal();
    }
    // Operators
    else if (["+", "-", "*", "/"].includes(e.key)) {
      setActiveButton(e.key); // Set active button for visual feedback
      handleOperator(e.key);
    } else if (e.key === "%") {
      setActiveButton("%"); // Set active button for visual feedback
      handleOperator("%");
    }
    // Equal sign or Enter
    else if (e.key === "=" || e.key === "Enter") {
      setActiveButton("="); // Set active button for visual feedback
      calculateResult();
    }
    // Clear with Escape
    else if (e.key === "Escape") {
      setActiveButton("C"); // Set active button for visual feedback
      clearDisplay();
    }
    // Backspace to delete last digit
    else if (e.key === "Backspace") {
      handleBackspace(); // Use shared backspace function instead of inline code
    }
    // Transfer to next/previous calculator
    else if (e.key === "ArrowRight" && !isLast && nextCalculator) {
      handleTransferResult(nextCalculator);
    } else if (e.key === "ArrowLeft" && !isFirst && prevCalculator) {
      handleTransferResult(prevCalculator);
    }
  };

  // Transfer focus to the target calculator after transfer
  useEffect(() => {
    const handleTransferFocus = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.targetId === id) {
        // Focus the calculator that received the value
        setTimeout(() => {
          if (calculatorRef.current) {
            calculatorRef.current.focus();
          }
        }, 100);
      }
    };

    document.addEventListener("calculator-transfer", handleTransferFocus);
    return () => {
      document.removeEventListener("calculator-transfer", handleTransferFocus);
    };
  }, [id]);

  // Function to handle transfer of result
  const handleTransferResult = (targetId: string) => {
    if (transferResult && targetId) {
      transferResult(id, targetId, display);
    }
  };

  // Extract backspace functionality into its own function
  const handleBackspace = () => {
    setActiveButton("backspace"); // Set active button for visual feedback

    if (display !== "0" && display.length > 1) {
      setDisplay(display.slice(0, -1));
      if (!operator) {
        setFullExpression(fullExpression.slice(0, -1));
      } else {
        setFullExpression(fullExpression.slice(0, -1));
      }
    } else if (display.length === 1 && display !== "0") {
      setDisplay("0");
      if (!operator) {
        setFullExpression("0");
      } else {
        setFullExpression(fullExpression.slice(0, -1) + "0");
      }
    }
  };

  // Format number with locale-appropriate thousand separators
  const formatNumberWithSeparators = (value: string): string => {
    // Don't format if it's in the middle of entering a decimal or negative
    if (value.endsWith(".") || value === "-0") return value;

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Use browser's locale for formatting (or 'en-US' as fallback)
    const locale = navigator.language || "en-US";

    // Format with appropriate separators but no decimal places if it's an integer
    if (Number.isInteger(num)) {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(num);
    }

    // For decimals, maintain original precision
    const decimalParts = value.split(".");
    if (decimalParts.length > 1) {
      const integerPart = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(Math.abs(parseInt(decimalParts[0])));

      // Handle negative numbers
      const sign = num < 0 ? "-" : "";
      return `${sign}${integerPart}.${decimalParts[1]}`;
    }

    return new Intl.NumberFormat(locale).format(num);
  };

  // Clear operations history on click
  const clearCalculatorOpsHistory = () => {
    localStorage.removeItem(`calculatorHistory_${id}`);
    setOperationHistory([]);
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

      <div
        ref={calculatorRef}
        tabIndex={0}
        className={cn(
          "w-80 bg-card border rounded-[var(--radius)] shadow-md overflow-hidden border-border outline-none",
          isFocused && "ring-2 ring-primary ring-opacity-50"
        )}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={`Calculator ${id.split("_")[1]}`}
      >
        <div className="p-1.5 flex items-center justify-start gap-2 ">
          <Badge
            className={cn(
              getCalculatorColor(id),
              "text-xs font-mono rounded-sm font-bold text-white"
            )}
          >
            Calc {id.split("_")[1]}{" "}
          </Badge>
          <p className="font-mono text-sm grow-1 text-muted-foreground">
            Standard
          </p>
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
        <div className="max-h-24 p-2 px-4 overflow-y-auto bg-muted">
          <div className="text-right text-muted-foreground font-mono text-base break-words overflow-wrap-break-word whitespace-normal">
            {fullExpression || formatNumberWithSeparators(display)}
          </div>
        </div>
        <div className="h-16 p-0 pb-4 px-4 text-right bg-muted text-muted-foreground font-mono text-3xl font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {formatNumberWithSeparators(display)}
        </div>
        <div className="grid grid-cols-4 gap-px bg-border">
          <button
            onClick={clearDisplay}
            className={cn(
              "h-16 border-none bg-card text-destructive text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "C" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            C
          </button>
          <button
            onClick={() => {
              setActiveButton("+/-");
              const newDisplay =
                display.charAt(0) === "-"
                  ? display.substring(1)
                  : "-" + display;
              setDisplay(newDisplay);
              if (!operator) {
                setFullExpression(newDisplay);
              }
            }}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "+/-" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            +/-
          </button>
          <button
            onClick={handleBackspace}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "backspace" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
            aria-label="Backspace"
          >
            ←
          </button>
          <button
            onClick={() => handleOperator("/")}
            className={cn(
              "h-16 border-none bg-primary text-primary-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-primary/90",
              activeButton === "/" && "bg-primary/80 shadow-inner"
            )}
          >
            ÷
          </button>

          <button
            onClick={() => inputDigit("7")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "7" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            7
          </button>
          <button
            onClick={() => inputDigit("8")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "8" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            8
          </button>
          <button
            onClick={() => inputDigit("9")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "9" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            9
          </button>
          <button
            onClick={() => handleOperator("*")}
            className={cn(
              "h-16 border-none bg-primary text-primary-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-primary/90",
              activeButton === "*" && "bg-primary/80 shadow-inner"
            )}
          >
            ×
          </button>

          <button
            onClick={() => inputDigit("4")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "4" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            4
          </button>
          <button
            onClick={() => inputDigit("5")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "5" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            5
          </button>
          <button
            onClick={() => inputDigit("6")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "6" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            6
          </button>
          <button
            onClick={() => handleOperator("-")}
            className={cn(
              "h-16 border-none bg-primary text-primary-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-primary/90",
              activeButton === "-" && "bg-primary/80 shadow-inner"
            )}
          >
            −
          </button>

          <button
            onClick={() => inputDigit("1")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "1" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            1
          </button>
          <button
            onClick={() => inputDigit("2")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "2" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            2
          </button>
          <button
            onClick={() => inputDigit("3")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "3" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            3
          </button>
          <button
            onClick={() => handleOperator("+")}
            className={cn(
              "h-16 border-none bg-primary text-primary-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-primary/90",
              activeButton === "+" && "bg-primary/80 shadow-inner"
            )}
          >
            +
          </button>

          <button
            onClick={() => handleOperator("%")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "%" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            %
          </button>
          <button
            onClick={() => inputDigit("0")}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "0" &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className={cn(
              "h-16 border-none bg-card text-card-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-muted",
              activeButton === "." &&
                "bg-accent text-accent-foreground shadow-inner"
            )}
          >
            .
          </button>
          <button
            onClick={calculateResult}
            className={cn(
              "h-16 border-none bg-primary text-primary-foreground text-xl font-medium transition-colors duration-150 ease-in cursor-pointer hover:bg-primary/90",
              activeButton === "=" && "bg-primary/80 shadow-inner"
            )}
          >
            =
          </button>
        </div>
      </div>

      <CalculatorLog
        operations={operationHistory}
        clearCalculatorOpsHistory={clearCalculatorOpsHistory}
      />
    </>
  );
}

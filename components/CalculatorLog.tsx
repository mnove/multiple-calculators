import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";

interface CalculatorLogProps {
  operations: string[];
  clearCalculatorOpsHistory: () => void;
}

export function CalculatorLog({
  operations,
  clearCalculatorOpsHistory,
}: CalculatorLogProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-5 w-full max-w-[320px] bg-background border border-border rounded-[var(--radius)] shadow-md p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-between items-center mb-1 gap-2">
          <h3 className="text-foreground font-medium text-sm grow-1">
            Operation History
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="grow-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearCalculatorOpsHistory}
                    className="text-red-500/50"
                  >
                    <Trash />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>Close</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <CollapsibleTrigger
            className="p-1 rounded-md hover:bg-muted focus:outline-none"
            aria-label={isOpen ? "Collapse history" : "Expand history"}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          {operations.length === 0 ? (
            <p className="text-muted-foreground italic">No operations yet</p>
          ) : (
            <ScrollArea className="h-[200px] w-full rounded-md">
              <div className="py-2">
                <ul className="list-none p-0 m-0 font-mono text-sm">
                  {operations.map((operation, index) => (
                    <li
                      key={index}
                      className="py-2 px-2 border-b border-border text-foreground last:border-none"
                    >
                      {operation}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

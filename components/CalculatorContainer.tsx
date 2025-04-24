"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, Plus } from "lucide-react";
import { useState } from "react";
import Calculator from "./Calculator";
import { Button } from "./ui/button";

export default function CalculatorContainer() {
  const [calculators, setCalculators] = useState<string[]>(["calc1"]);

  const addCalculator = () => {
    if (calculators.length < 4) {
      const newId = `calc${calculators.length + 1}`;
      setCalculators([...calculators, newId]);
    }
  };

  const removeCalculator = (id: string) => {
    if (calculators.length > 1) {
      setCalculators(calculators.filter((calcId) => calcId !== id));
    }
  };

  // Function to transfer the result between calculators
  const transferResult = (fromId: string, toId: string, value: string) => {
    // Create custom event to send the data between calculator instances
    const transferEvent = new CustomEvent("calculator-transfer", {
      detail: {
        value,
        targetId: toId,
        sourceId: fromId,
      },
    });

    document.dispatchEvent(transferEvent);
  };

  return (
    <div className="p-4">
      <div className="flex justify-end items-center mb-4 gap-2">
        <Button onClick={addCalculator} disabled={calculators.length >= 4}>
          <Plus />
          Add Calculator ({calculators.length}/4)
        </Button>

        <HoverCard openDelay={0}>
          <HoverCardTrigger>
            {" "}
            <Button variant="outline">
              <Info /> Instructions
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex flex-col gap-2 text-sm">
              <p>
                You can add up to 4 calculators. Click the &quot;Add
                Calculator&quot; button to create a new one.
              </p>
              <p>
                To transfer results between calculators, click on the result of
                one calculator and then click on the input of another
                calculator.
              </p>
              <p>
                To remove a calculator, click on the calculator menu (three
                dots) in the top right corner of the calculator and select
                &quot;Remove Calculator&quot;.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="flex gap-4 items-center flex-wrap justify-center">
        {calculators.map((id, index) => (
          <div key={id} className="calculator-wrapper">
            <Calculator
              id={id}
              removeCalculator={removeCalculator}
              isFirst={index === 0}
              isLast={index === calculators.length - 1}
              transferResult={transferResult}
              prevCalculator={index > 0 ? calculators[index - 1] : null}
              nextCalculator={
                index < calculators.length - 1 ? calculators[index + 1] : null
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

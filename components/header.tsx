import { Github } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b p-2 shadow-md bg-background gap-4">
      <h1 className=" text-xl md:text-2xl font-semibold tracking-tighter grow">
        Multiple Calculator
        <span className="text-sm text-muted-foreground ml-4 hidden md:inline-block tracking-normal">
          A simple calculator app with multiple instances.
        </span>
      </h1>

      <div className="grow-0">
        <Button variant="outline" size="icon">
          <Github />
        </Button>
      </div>

      <div className="grow-0">
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;

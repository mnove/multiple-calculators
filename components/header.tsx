import { ModeToggle } from "./mode-toggle";

function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b p-2 shadow-md bg-background">
      <h1 className="text-2xl font-semibold tracking-tighter">
        Multiple Calculator
      </h1>

      <ModeToggle />
    </header>
  );
}

export default Header;

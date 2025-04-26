function Footer() {
  return (
    <footer className="relative z-10 flex items-center justify-between border-t p-2 shadow-md w-full">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Calculator App
        </span>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <p>
          You can add up to 4 calculators. Click the &quot;Add Calculator&quot;
          button to create a new one.
        </p>
        <p>
          To transfer results between calculators, click on the result of one
          calculator and then click on the input of another calculator.
        </p>
        <p>
          To remove a calculator, click on the calculator menu (three dots) in
          the top right corner of the calculator and select &quot;Remove
          Calculator&quot;.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

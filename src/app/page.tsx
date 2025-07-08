
export default function HomePage() {
  console.log(">>> [page.tsx] Minimal homepage rendering...");
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold font-headline">Hello World!</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        The server is running and the page is loading correctly.
      </p>
    </div>
  );
}

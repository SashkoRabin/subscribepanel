"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body className="system-body"><main className="system-page"><p>SUBSCRIPT</p><h1>We couldn’t start the app.</h1><p>Try again in a moment.</p><button type="button" onClick={reset}>Try again</button></main></body></html>;
}

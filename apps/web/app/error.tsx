"use client";

import { useEffect } from "react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep details out of the UI. A production error reporter can consume this event.
    console.error("Application route failed to render");
  }, []);

  return <main className="system-page"><p className="eyebrow">SOMETHING WENT WRONG</p><h1>We couldn’t load this page.</h1><p>Please try again. If the problem continues, return to your subscriptions and try later.</p><div className="system-actions"><button type="button" onClick={reset}>Try again</button><a className="button secondary" href="/subscriptions">Subscriptions</a></div></main>;
}

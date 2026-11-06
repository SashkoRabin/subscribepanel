import Link from "next/link";

export default function NotFound() {
  return <main className="system-page"><p className="eyebrow">404</p><h1>This page doesn’t exist.</h1><p>The address may be outdated, or the subscription may no longer be available.</p><div className="system-actions"><Link className="button" href="/">Go to dashboard</Link><Link className="button secondary" href="/subscriptions">Subscriptions</Link></div></main>;
}

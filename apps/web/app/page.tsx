import Link from "next/link";
import { formatCalendarDate, formatMinorUnits } from "@subscript/utils";
import { monthlyEquivalentMinor } from "@subscript/domain";
import { createServerSupabaseClient } from "../lib/supabase/server";
import { requireSubscriptionContext } from "../lib/subscriptions";
import { AppNav } from "./components/app-nav";
import { ServiceIcon } from "./components/service-icon";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="landing"><p className="eyebrow">SUBSCRIPT</p><h1>Control every recurring payment.</h1><p>Your private, calmer subscription workspace.</p><Link className="button" href="/auth">Sign in or create an account</Link></main>;
  const context = await requireSubscriptionContext();
  const subscriptions = context ? await context.subscriptions.list(context.user.id) : [];
  const active = subscriptions.filter((item) => item.status === "active" || item.status === "trial");
  const totals = new Map<string, number>(); active.forEach((item) => totals.set(item.currency, (totals.get(item.currency) ?? 0) + monthlyEquivalentMinor(item.amountMinor, item.billingInterval, item.customIntervalDays)));
  const totalText = [...totals.entries()].map(([currency, value]) => formatMinorUnits(value, currency)).join(" · ") || "—";
  const upcoming = active.filter((item) => item.nextBillingDate >= new Date().toISOString().slice(0, 10)).slice(0, 3);
  return <main className="app-shell"><AppNav active="dashboard" /><section className="dashboard-hero"><div><p className="eyebrow">YOUR OVERVIEW</p><h1>Keep the renewals<br />you actually want.</h1><p>A calm, private view of everything that repeats.</p></div><Link className="button" href="/subscriptions">Add subscription</Link></section><section className="metric-grid"><article><span>Monthly recurring</span><strong className="currency-total">{totalText}</strong><p>Normalized estimate. Currencies stay separate.</p></article><article><span>Active subscriptions</span><strong>{active.length}</strong><p>Services you’re currently paying for.</p></article><article><span>Upcoming payments</span><strong>{upcoming.length}</strong><p>{upcoming[0] ? `Next: ${upcoming[0].name} on ${formatCalendarDate(upcoming[0].nextBillingDate)}` : "Nothing scheduled yet."}</p></article></section><section className="upcoming-section"><div className="section-heading"><div><p className="eyebrow">PAYMENT CALENDAR</p><h2>All upcoming renewals</h2></div><Link className="text-link" href="/subscriptions">Manage all</Link></div>{upcoming.length ? <div className="upcoming-list">{upcoming.map((item) => <Link className="upcoming-row" href={`/subscriptions/${item.id}`} key={item.id}><ServiceIcon name={item.name} /><div><strong>{item.name}</strong><span>{item.merchant}</span></div><time dateTime={item.nextBillingDate}>{formatCalendarDate(item.nextBillingDate)}</time><b>{formatMinorUnits(item.amountMinor, item.currency)}</b><span className="row-arrow">→</span></Link>)}</div> : <div className="card empty"><h3>No upcoming payments</h3><p>Add a subscription with its next renewal date to build your calendar.</p></div>}</section><section className="dashboard-empty"><div><p className="eyebrow">AT A GLANCE</p><h2>{subscriptions.length ? "Your next renewals are in view." : "One place for every recurring payment."}</h2><p>{subscriptions.length ? "Review, edit or cancel subscriptions whenever you need." : "Add your first subscription to start tracking your recurring spending."}</p></div><div className="dashboard-actions"><Link href="/subscriptions">Manage subscriptions</Link><Link href="/analytics">View analytics</Link></div></section></main>;
}


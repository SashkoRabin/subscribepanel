import Link from "next/link";
import { formatMinorUnits } from "@subscript/utils";
import { archiveSubscription, cancelSubscription, deleteSubscription } from "./actions";
import { requireSubscriptionContext } from "../../lib/subscriptions";
import { AppNav } from "../components/app-nav";
import { ServiceIcon } from "../components/service-icon";
import { SubscriptionCreateForm } from "./subscription-create-form";
import { SubscriptionActions } from "./subscription-actions";
import { formatCalendarDate } from "@subscript/utils";

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; q?: string }> }) {
  const context = await requireSubscriptionContext();
  if (!context) return <main className="landing"><p className="eyebrow">SUBSCRIPT</p><h1>Your workspace is waiting.</h1><Link className="button" href="/auth">Sign in</Link></main>;
  const params = await searchParams;
  const subscriptions = await context.subscriptions.list(context.user.id, params.q);
  return <main className="workspace app-shell"><AppNav active="subscriptions" />
    <header className="workspace-header"><div><p className="eyebrow">SUBSCRIPT / SUBSCRIPTIONS</p><h1>Your recurring payments</h1><p className="muted">Add subscriptions manually or connect a bank provider.</p></div><div className="row-actions"><Link href="/integrations" className="text-link">Bank connections</Link><Link href="/" className="text-link">Home</Link></div></header>
    {params.error ? <p role="alert" className="notice error">{params.error}</p> : null}
    {params.message ? <p className="notice">{params.message}</p> : null}
    <div className="subscriptions-toolbar"><form className="subscription-search" action="/subscriptions"><input name="q" defaultValue={params.q ?? ""} placeholder="Search subscriptions" aria-label="Search subscriptions" /><button className="secondary" type="submit">Search</button></form><SubscriptionCreateForm /></div><section className="subscription-layout">
      <section className="list-section"><div className="section-heading"><h2>All subscriptions</h2><span>{subscriptions.length}</span></div>
        {subscriptions.length === 0 ? <div className="card empty"><h3>Nothing here yet</h3><p>Add the first subscription you want to keep an eye on.</p></div> : <div className="subscription-list">{subscriptions.map((subscription) => <article className="card subscription" key={subscription.id}><ServiceIcon name={subscription.name} size="large" /><div className="subscription-main"><div><h3>{subscription.name}</h3><p>{subscription.merchant} · {subscription.billingInterval.replace("_", " ")}</p></div><div className="subscription-next"><span>Next payment</span><time>{formatCalendarDate(subscription.nextBillingDate)}</time></div></div><div className="subscription-meta"><strong>{formatMinorUnits(subscription.amountMinor, subscription.currency)}</strong><span className={`status ${subscription.status}`}>{subscription.status}</span></div><SubscriptionActions editHref={`/subscriptions/${subscription.id}`} canManage={subscription.status !== "archived" && subscription.status !== "cancelled"} cancelAction={cancelSubscription.bind(null, subscription.id)} archiveAction={archiveSubscription.bind(null, subscription.id)} deleteAction={deleteSubscription.bind(null, subscription.id)} /></article>)}</div>}
      </section>
    </section>
  </main>;
}

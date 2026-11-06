"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

type ServerAction = (formData: FormData) => void | Promise<void>;

function PendingActionButton({ children, className }: { children: string; className: string }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending} aria-live="polite">{pending ? "Saving…" : children}</button>;
}

export function SubscriptionActions({
  editHref,
  canManage,
  cancelAction,
  archiveAction,
  deleteAction
}: {
  editHref: string;
  canManage: boolean;
  cancelAction: ServerAction;
  archiveAction: ServerAction;
  deleteAction: ServerAction;
}) {
  return <div className="subscription-actions">
    <Link className="button subscription-action-primary" href={editHref}>Edit details</Link>
    {canManage ? <div className="subscription-secondary-actions">
      <form action={cancelAction}><PendingActionButton className="secondary" >Cancel</PendingActionButton></form>
      <form action={archiveAction}><PendingActionButton className="secondary">Archive</PendingActionButton></form>
    </div> : null}
    <form className="subscription-delete-action" action={deleteAction}><PendingActionButton className="danger">Delete</PendingActionButton></form>
  </div>;
}

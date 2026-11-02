import Link from "next/link";
import { AppearanceControls } from "./appearance-controls";
import { NavLinks } from "./nav-links";
export function AppNav({ active }: { active: "dashboard" | "subscriptions" | "analytics" | "integrations" }) { return <nav className="app-nav" aria-label="Main navigation"><Link className="nav-brand" href="/"><span>◒</span> SUBSCRIPT</Link><NavLinks active={active} /><div className="nav-tools"><AppearanceControls /><Link className="nav-avatar" href="/auth" aria-label="Account">A</Link></div></nav>; }

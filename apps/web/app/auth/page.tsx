import Link from "next/link";
import { AuthForm } from "./auth-form";

export default function AuthPage() { return <main className="auth-shell"><Link className="brand" href="/"><span>◒</span> SUBSCRIPT</Link><section className="auth-layout"><aside className="auth-aside"><p className="eyebrow">A QUIETER MONEY LIFE</p><h2>Know what renews before it does.</h2><p>Track every subscription, spot the ones you forgot, and keep your next payment in view.</p><div className="auth-points"><span>Private by design</span><span>Made for EUR & CZK</span><span>Cancel with confidence</span></div></aside><AuthForm /></section></main>; }

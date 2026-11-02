import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles.css";
export const metadata: Metadata = { title: "Subscript", description: "Control every recurring payment." };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }


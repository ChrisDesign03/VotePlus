"use client";

import Link from "next/link";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import { buttonClass } from "./ui";

type NavItem = { href: string; label: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <nav
          id="menu-mobile"
          aria-label="Menu principal"
          className="absolute inset-x-0 top-full z-40 border-y border-white/10 bg-nuit px-5 pb-6 pt-4 shadow-2xl"
        >
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/10 py-4 text-lg font-medium text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-3">
            <Link href="/inscription" className={buttonClass({ variant: "gold", size: "lg", full: true })}>
              Créer un compte
            </Link>
            <Link
              href="/connexion"
              className={`${buttonClass({ variant: "ghost-light", size: "lg", full: true })} border border-white/20`}
            >
              Connexion
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

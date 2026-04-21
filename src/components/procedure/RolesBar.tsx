/**
 * RolesBar displays a compact definition list of personnel roles.
 * Rendered as plain text with a monospace abbreviation column — no pills.
 *
 * @param props.roles - Array of Role objects to display.
 */

import type { Role } from "@/lib/types/procedure";

interface RolesBarProps {
  roles: Role[];
}

export default function RolesBar({ roles }: RolesBarProps) {
  if (roles.length === 0) return null;

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-subtle">
        Roles
      </p>
      <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {roles.map((role) => (
          <div
            key={role.abbreviation}
            className="flex items-baseline gap-3 text-sm"
          >
            <dt className="font-mono text-xs text-ink w-12 shrink-0">
              {role.abbreviation}
            </dt>
            <dd className="text-ink-muted">{role.fullName}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

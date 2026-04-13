/**
 * RolesBar displays a horizontal row of role chips showing abbreviation and full name.
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
      <h4 className="text-sm font-semibold text-slate-700 mb-2">Roles</h4>
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role.abbreviation}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-inset ring-slate-200"
          >
            <span className="font-semibold">{role.abbreviation}</span>
            <span className="text-slate-400">&mdash;</span>
            <span>{role.fullName}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

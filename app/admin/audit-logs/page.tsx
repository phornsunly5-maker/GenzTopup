import { prisma } from "@/lib/prisma";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-brand-primary" /> Audit Logs
        </h1>
        <p className="text-brand-muted text-sm">Track every admin action in the ZennLyyStore system (last 200 events).</p>
      </div>

      {logs.length === 0 ? (
        <div className="glass-card p-12 text-center text-brand-muted text-sm">No events recorded yet.</div>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="text-brand-muted whitespace-nowrap text-xs font-mono">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="font-medium text-brand-text">{l.adminEmail || "System"}</td>
                  <td className="font-mono text-xs">
                    <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-0.5 rounded-md">
                      {l.action}
                    </span>
                  </td>
                  <td className="text-xs">
                    {l.targetType && <span className="text-brand-muted">{l.targetType}</span>}
                    {l.targetId && <span className="font-mono text-brand-muted/50 ml-1">#{l.targetId.slice(-6)}</span>}
                  </td>
                  <td className="text-xs text-brand-muted max-w-xs truncate" title={l.details ?? undefined}>
                    {l.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
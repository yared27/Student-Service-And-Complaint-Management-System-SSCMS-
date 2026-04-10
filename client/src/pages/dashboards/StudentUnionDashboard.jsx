import { Link } from "react-router-dom";

export function StudentUnionDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Student Union Dashboard</h1>
        <p className="mt-2 text-slate-600">Placeholder page for STUDENT_UNION_COMPLAINT_MANAGER role.</p>
        <Link to="/login" className="mt-5 inline-block text-sm font-semibold text-sky-700 hover:underline">
          Back to login
        </Link>
      </section>
    </main>
  );
}

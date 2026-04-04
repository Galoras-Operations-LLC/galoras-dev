import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";

type CoachApplication = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  bio: string | null;
  why_galoras: string | null;
  status: string | null;
  reviewer_notes: string | null;
  created_at: string | null;
};

export default function Applicants() {
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [selected, setSelected] = useState<CoachApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [debugError, setDebugError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  // -------------------------------
  // FETCH APPLICATIONS
  // -------------------------------
  const fetchApplications = async () => {
    setLoading(true);
    setDebugError("");

    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setDebugError(JSON.stringify(error));
      setApplications([]);
      setLoading(false);
      return;
    }

    const rows = (data as unknown as CoachApplication[]) || [];
    setApplications(rows);
    setSelected(rows[0] || null);
    setLoading(false);
  };

  // -------------------------------
  // CREATE COACH FROM APPLICATION
  // -------------------------------
  const createCoachFromApplication = async (app: CoachApplication) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await (supabase
      .from("coaches")
      .insert([
        {
          display_name: app.full_name,
          headline: "",
          status: "approved" as const,
          user_id: user.id,
        },
      ]) as any);

    if (error) {
      console.error("Coach creation failed:", error);
      alert("Failed to create coach");
      return false;
    }

    return true;
  };

  // -------------------------------
  // UPDATE APPLICATION
  // -------------------------------
  const updateApplication = async () => {
    if (!selected) return;

    setSaving(true);

    const { error } = await (supabase
      .from("coach_applications")
      .update({
        status: selected.status as any,
        reviewer_notes: selected.reviewer_notes,
      }) as any)
      .eq("id", selected.id);

    if (error) {
      console.error(error);
      alert("Update failed");
      setSaving(false);
      return;
    }

    // 🚀 APPROVAL LOGIC
    if (selected.status === "approved") {
      const success = await createCoachFromApplication(selected);

      if (!success) {
        setSaving(false);
        return;
      }
    }

    alert("Saved!");
    setSaving(false);
    fetchApplications();
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <Layout>
      <div style={{ padding: 40 }}>
        <h1 style={{ marginBottom: 24 }}>Coach Applications</h1>

        {loading && <div>Loading...</div>}

        {!loading && debugError && (
          <pre style={{ whiteSpace: "pre-wrap", color: "tomato" }}>
            {debugError}
          </pre>
        )}

        {!loading && applications.length === 0 && (
          <div>No applications found.</div>
        )}

        {!loading && applications.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr",
              gap: 24,
            }}
          >
            {/* LEFT TABLE */}
            <div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "white",
                  color: "black",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: 12 }}>Name</th>
                    <th style={{ padding: 12 }}>Email</th>
                    <th style={{ padding: 12 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setSelected(app)}
                      style={{
                        cursor: "pointer",
                        background:
                          selected?.id === app.id ? "#eef6ff" : "white",
                      }}
                    >
                      <td style={{ padding: 12 }}>
                        {app.full_name || "Unnamed"}
                      </td>
                      <td style={{ padding: 12 }}>{app.email}</td>
                      <td style={{ padding: 12 }}>
                        {app.status || "pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT PANEL */}
            <div
              style={{
                background: "white",
                color: "black",
                padding: 20,
                border: "1px solid #ddd",
              }}
            >
              {selected && (
                <>
                  <h2>{selected.full_name}</h2>
                  <p>Email: {selected.email}</p>
                  <p>Phone: {selected.phone || "-"}</p>
                  <p>LinkedIn: {selected.linkedin_url || "-"}</p>
                  <p>Website: {selected.website_url || "-"}</p>
                  <p>Bio: {selected.bio || "-"}</p>
                  <p>Why Galoras: {selected.why_galoras || "-"}</p>
                  <p>Why Galoras: {selected.why_galoras || "-"}</p>

                  <div style={{ marginTop: 20 }}>
                    <div>Status</div>
                    <select
                      value={selected.status || "pending"}
                      onChange={(e) =>
                        setSelected({ ...selected, status: e.target.value })
                      }
                      style={{ width: "100%", padding: 10, marginBottom: 16 }}
                    >
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>

                    <div>Reviewer Notes</div>
                    <textarea
                      value={selected.reviewer_notes || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          reviewer_notes: e.target.value,
                        })
                      }
                      rows={4}
                      style={{
                        width: "100%",
                        padding: 10,
                        marginBottom: 16,
                      }}
                    />


                    <button
                      onClick={updateApplication}
                      disabled={saving}
                      style={{
                        padding: "10px 16px",
                        background: "#38bdf8",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
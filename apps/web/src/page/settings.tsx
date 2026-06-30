import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input } from "../components/common/input";
import Button from "../components/common/button";
import { getMyProfile, updateMyProfile } from "../services/profile.service";
import { useAuth } from "../context/authContext";
import { LocalStorage } from "../utils";
import { Avatar } from "../components/common/avatar";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.tenant_id) {
      navigate("/dashboard", { replace: true });
      return;
    }

    getMyProfile()
      .then((profile: { full_name?: string; email?: string; phone_number?: string }) => {
        setFullName(profile.full_name ?? "");
        setEmail(profile.email ?? "");
        setPhone(profile.phone_number ?? "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        full_name: fullName,
        email: email || undefined,
      });
      updateUser(updated);
      LocalStorage.set("user", updated);
      setSuccess("Saved");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-8 text-[var(--fg-muted)]">Loading...</p>;
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] mobile-list-pad">
      <div className="max-w-md mx-auto min-h-[100dvh] flex flex-col">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] mobile-header-pad">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-medium text-[var(--fg)]">Profile</h1>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex justify-center py-2">
            <Avatar name={fullName || phone} src={user?.avatar} size={64} />
          </div>

          <div>
            <label className="text-xs text-[var(--fg-muted)] mb-1 block">Phone</label>
            <Input value={phone} disabled inputSize="md" className="bg-[var(--surface)] border-[var(--border)] text-[var(--fg-muted)]" />
          </div>

          <div>
            <label className="text-xs text-[var(--fg-muted)] mb-1 block">Name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              inputSize="md"
              className="bg-[var(--surface)] border-[var(--border)] text-[var(--fg)]"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--fg-muted)] mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              inputSize="md"
              className="bg-[var(--surface)] border-[var(--border)] text-[var(--fg)]"
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
          {success && <p className="text-sm" style={{ color: "var(--success)" }}>{success}</p>}

          <Button
            variant="primary"
            size="md"
            loading={saving}
            onClick={handleSave}
            className="w-full"
            style={{ background: "var(--accent)" }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

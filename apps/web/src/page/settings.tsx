import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, X } from "lucide-react";
import { Input } from "../components/common/input";
import Button from "../components/common/button";
import { getMyProfile, updateMyProfile, uploadProfileAvatar } from "../services/profile.service";
import { useAuth } from "../context/authContext";
import { Avatar } from "../components/common/avatar";
import type { IUserDocument } from "@repo/types";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function validateAvatarFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
    return "Only JPG, JPEG, PNG, and WEBP images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (user?.tenant_id) {
      navigate("/dashboard", { replace: true });
      return;
    }

    getMyProfile()
      .then((profile: { full_name?: string; email?: string; phone_number?: string; avatar?: string }) => {
        setFullName(profile.full_name ?? "");
        setEmail(profile.email ?? "");
        setPhone(profile.phone_number ?? "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.tenant_id, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setAvatarError("");
    setSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      e.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  }

  function handleRemoveSelected() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAvatarError("");
    setUploadProgress(0);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    const validationError = validateAvatarFile(selectedFile);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    setAvatarError("");
    setError("");
    setSuccess("");
    setUploading(true);
    setUploadProgress(0);

    try {
      const updated = await uploadProfileAvatar(selectedFile, setUploadProgress);
      updateUser(updated);
      setSuccess("Profile picture updated successfully!");
      handleRemoveSelected();
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : "Failed to upload profile picture");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await updateMyProfile({
        full_name: fullName,
        email: email || undefined,
      }) as Partial<IUserDocument>;
      updateUser(updated);
      setSuccess("Profile saved successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const displayAvatar = previewUrl ?? user?.avatar ?? null;

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
          <div className="flex flex-col items-center py-2 gap-3">
            <div className="relative">
              <Avatar name={fullName || phone} src={displayAvatar} size={80} />
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveSelected}
                  disabled={uploading}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--danger)] text-white flex items-center justify-center disabled:opacity-50"
                  aria-label="Remove selected image"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface)] disabled:opacity-50"
              >
                <Camera size={16} />
                Change Photo
              </button>
            ) : (
              <div className="w-full space-y-2">
                {uploading && (
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-[var(--fg-muted)] mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--border)]">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%`, background: "var(--accent)" }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  variant="primary"
                  size="md"
                  loading={uploading}
                  onClick={handleUpload}
                  className="w-full"
                  style={{ background: "var(--accent)" }}
                >
                  Upload Photo
                </Button>
              </div>
            )}

            {avatarError && (
              <p className="text-sm text-center" style={{ color: "var(--danger)" }}>{avatarError}</p>
            )}
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function DocumentUploadModal({
  bookingId,
  onVerified,
}: {
  bookingId: string;
  onVerified: () => void;
}) {
  const [licenseUrl, setLicenseUrl] = useState("dl_mock_front_back.png");
  const [idUrl, setIdUrl] = useState("aadhaar_mock_card.png");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);

    try {
      const res = await fetch("/api/verify-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          licenseUrl,
          idDocumentUrl: idUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Document verification failed.");

      alert("✅ OCR Verification Successful! Driving License and Aadhaar verified.");
      onVerified();
    } catch (err: any) {
      setError(err.message || "Failed to verify documents.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="rounded-stub border border-marigold bg-marigold/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display font-bold text-ink">
            🪪 Mandatory Self-Drive Verification
          </h4>
          <p className="text-xs text-ink/70">
            Upload Driving License & Govt ID for instant OCR verification before pickup.
          </p>
        </div>
        <span className="font-mono text-[10px] font-bold bg-marigold text-ink px-2 py-0.5 rounded">
          Required
        </span>
      </div>

      <form onSubmit={handleVerify} className="space-y-3">
        <div>
          <label className="text-xs font-mono font-medium text-ink">
            1. Driving License Upload (Front & Back)
          </label>
          <input
            type="text"
            required
            value={licenseUrl}
            onChange={(e) => setLicenseUrl(e.target.value)}
            className="mt-1 w-full rounded-stub border border-line bg-white px-3 py-2 text-xs font-mono text-ink focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-mono font-medium text-ink">
            2. Aadhaar / Govt Photo ID Upload
          </label>
          <input
            type="text"
            required
            value={idUrl}
            onChange={(e) => setIdUrl(e.target.value)}
            className="mt-1 w-full rounded-stub border border-line bg-white px-3 py-2 text-xs font-mono text-ink focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-alert">{error}</p>}

        <Button type="submit" disabled={verifying} className="w-full">
          {verifying ? "Simulating OCR Scanning & Validation..." : "Run OCR Document Check →"}
        </Button>
      </form>
    </div>
  );
}

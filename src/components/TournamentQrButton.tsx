"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface TournamentQrButtonProps {
  tournamentId: string;
  tournamentName: string;
  tournamentLocation: string;
}

export default function TournamentQrButton({
  tournamentId,
  tournamentName,
  tournamentLocation,
}: TournamentQrButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [compositeImageUrl, setCompositeImageUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isOpen) return;

    const url = `${window.location.origin}/tournament/${tournamentId}`;

    QRCode.toDataURL(url, { width: 320, margin: 2 }, (err, dataUrl) => {
      if (err) {
        console.error("Failed to generate QR code", err);
        return;
      }
      setQrDataUrl(dataUrl);

      // Create composite image with tournament details
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Canvas dimensions: QR + padding + text area
        canvas.width = 400;
        canvas.height = 520;

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw tournament name
        ctx.fillStyle = "#000000";
        ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(tournamentName, canvas.width / 2, 35);

        // Draw location
        ctx.font = "16px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#666666";
        ctx.fillText(`📍 ${tournamentLocation}`, canvas.width / 2, 60);

        // Draw QR code
        ctx.drawImage(img, 40, 80, 320, 320);

        // Draw scan instruction
        ctx.font = "14px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#888888";
        ctx.fillText("Scan to view tournament", canvas.width / 2, 430);

        // Convert to data URL
        const compositeUrl = canvas.toDataURL("image/png");
        setCompositeImageUrl(compositeUrl);
      };
      img.src = dataUrl;
    });
  }, [isOpen, tournamentId, tournamentName, tournamentLocation]);

  const handleOpen = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDownload = () => {
    if (!compositeImageUrl) return;

    const link = document.createElement("a");
    link.href = compositeImageUrl;
    link.download = `${tournamentName
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
        style={{
          border: "1px solid var(--accent)",
          color: "var(--accent)",
          background: "color-mix(in srgb, var(--accent) 10%, transparent)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span>QR Code</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={handleClose}
        >
          <div
            className="rounded-xl p-6 w-full max-w-md flex flex-col items-center gap-5 shadow-2xl"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tournament QR Code</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-2xl leading-none hover:opacity-70 transition-opacity"
                style={{ color: "var(--muted)" }}
              >
                ×
              </button>
            </div>

            <div className="w-full text-center space-y-1">
              <h3 className="text-base font-medium">{tournamentName}</h3>
              <p
                className="text-sm flex items-center justify-center gap-1"
                style={{ color: "var(--muted)" }}
              >
                <span>📍</span>
                <span>{tournamentLocation}</span>
              </p>
            </div>

            <div
              className="bg-white p-4 rounded-lg flex items-center justify-center shadow-inner"
              style={{ border: "2px solid var(--border)" }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${tournamentName}`}
                  className="w-72 h-72 object-contain"
                />
              ) : (
                <div
                  className="w-72 h-72 flex items-center justify-center text-sm"
                  style={{ color: "var(--muted)" }}
                >
                  Generating QR code...
                </div>
              )}
            </div>

            <p
              className="text-xs text-center"
              style={{ color: "var(--muted)" }}
            >
              Scan this code to open the tournament scorecard on your device.
            </p>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!compositeImageUrl}
              className="w-full py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-white transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              style={{ background: "var(--accent)" }}
            >
              {compositeImageUrl ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download QR Code
                </span>
              ) : (
                "Preparing download..."
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

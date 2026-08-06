"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw } from "lucide-react";

interface Props {
  onCapture: (dataUrl: string) => void;
  capturedPhoto: string | null;
  onClear: () => void;
}

export default function CameraCapture({ onCapture, capturedPhoto, onClear }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setReady(false);
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;

        video.oncanplay = () => {
          if (cancelled) return;
          video.play().then(() => {
            if (!cancelled) setReady(true);
          });
        };
      })
      .catch((err) => {
        if (!cancelled) {
          setError("Tidak dapat mengakses kamera: " + (err?.message ?? err));
          setActive(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCapture(dataUrl);
    setActive(false);
  };

  const handleOpen = () => {
    setError("");
    setActive(true);
  };

  const handleClose = () => {
    setActive(false);
  };

  const handleRetake = () => {
    onClear();
    setError("");
    setActive(true);
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div
        style={{
          display: active && !capturedPhoto ? "block" : "none",
          position: "relative",
          aspectRatio: "4/3",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
          muted
          playsInline
        />

        {!ready && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
            }}
          >
            Memuat kamera...
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              color: "#111",
              border: "none",
              borderRadius: 999,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 13,
              cursor: ready ? "pointer" : "not-allowed",
              opacity: ready ? 1 : 0.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <Camera size={15} /> Ambil Foto
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <X size={15} /> Batal
          </button>
        </div>
      </div>

      {capturedPhoto && (
        <div
          style={{
            position: "relative",
            aspectRatio: "4/3",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <img
            src={capturedPhoto}
            alt="Foto tamu"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <button
            type="button"
            onClick={handleRetake}
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "8px 16px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Ambil Ulang
          </button>
          <button
            type="button"
            onClick={onClear}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {!active && !capturedPhoto && (
        <button
          type="button"
          onClick={handleOpen}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 12,
            border: "2px dashed #d1d5db",
            background: "#f9fafb",
            padding: "32px 0",
            color: "#6b7280",
            cursor: "pointer",
          }}
        >
          <Camera size={28} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Buka Kamera</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Wajib — foto tamu secara langsung</span>
        </button>
      )}

      {error && (
        <p style={{ marginTop: 8, fontSize: 13, color: "#dc2626" }}>{error}</p>
      )}
    </div>
  );
}

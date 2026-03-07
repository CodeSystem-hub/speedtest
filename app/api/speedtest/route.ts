import { NextResponse } from "next/server";

export async function GET() {
  try {
    const start = Date.now();

    const response = await fetch("https://speed.hetzner.de/10MB.bin", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Falha no download");
    }

    const blob = await response.blob();
    const end = Date.now();

    const duration = (end - start) / 1000;
    const sizeInMb = blob.size / (1024 * 1024);
    const speed = sizeInMb / duration;

    return NextResponse.json({
      download: speed.toFixed(2),
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao testar velocidade" },
      { status: 500 }
    );
  }
}
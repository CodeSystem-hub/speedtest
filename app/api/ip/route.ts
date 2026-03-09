import { NextResponse } from "next/server";

export async function GET() {
  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    const response = await fetch("https://ipapi.co/json/", {
      cache: "no-store",
      headers: {
        "User-Agent": "NextJS-SpeedTest",
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error("Falha na API");
    }

    const data = await response.json();

    return NextResponse.json({
      ip: data?.ip || "N/A",
      city: data?.city || "N/A",
      region: data?.region || "N/A",
      country: data?.country_name || "N/A",
      isp: data?.org || "N/A",
    });
  } catch (error) {
    return NextResponse.json({
      ip: "N/A",
      city: "N/A",
      region: "N/A",
      country: "N/A",
      isp: "Desconhecido",
    });
  }
}
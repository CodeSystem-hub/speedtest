import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json({
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      isp: data.org,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao obter IP" },
      { status: 500 }
    );
  }
}
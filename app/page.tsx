"use client";

import { useState } from "react";
import GaugeComponent from "react-gauge-component";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  Download,
  Upload,
  Clock,
  MapPin,
  Server,
  Activity,
  Zap,
  Shield,
  Globe
} from "lucide-react";

const COLORS = {
  primary: "#46d643",
  secondary: "#144449",
  accent: "#7AB340",
  dark: "#094720",
  light: "#DAEFBE",
  white: "#FFFFFF"
};

export default function Home() {

  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [isp, setIsp] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState("");
  const [progress, setProgress] = useState(0);

  async function getIPInfo() {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    setIsp(data.org || "Não disponível");
    setLocation(`${data.city || "N/A"} - ${data.region || "N/A"}`);
  }

  async function testPing() {
    setCurrentTest("Ping");
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await fetch("https://speed.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
      const end = performance.now();
      times.push(end - start);
      setProgress((i + 1) * 20);
    }
    setPing(Math.round(times.reduce((a, b) => a + b, 0) / times.length));
    setJitter(Math.round(Math.max(...times) - Math.min(...times)));
  }

  async function testDownload() {
  setCurrentTest("Download");

  const size = 50_000_000;

  const response = await fetch(
    `https://speed.cloudflare.com/__down?bytes=${size}`,
    { cache: "no-store" }
  );

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();

  const start = performance.now();

  let received = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    received += value.length;

    setProgress((received / size) * 100);
  }

  const duration = (performance.now() - start) / 1000;

  setDownload(
    parseFloat(((received * 8) / duration / 1_000_000).toFixed(2))
  );
}
  async function testUpload() {
    setCurrentTest("Upload");
    const size = 20_000_000;
    const data = new Uint8Array(size);
    const start = performance.now();

    await fetch("https://speed.cloudflare.com/__up", {
      method: "POST",
      body: data
    });

    const duration = (performance.now() - start) / 1000;
    setUpload(parseFloat(((size * 8) / duration / 1_000_000).toFixed(2)));
  }

  async function startTest() {
    try {
      setLoading(true);
      setProgress(0);

      await getIPInfo();
      await testPing();
      await testDownload();
      await testUpload();

      setCurrentTest("");
      setProgress(100);
    } catch {
      alert("Erro no teste.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at center, ${COLORS.secondary} 0%, ${COLORS.dark} 100%)`,
        color: COLORS.white,
        fontFamily: "'Poppins', sans-serif",
        overflowX: "hidden"
      }}
    >
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "40px"
        }}
      >

        {/* HEADER */}

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <Zap size={42} color={COLORS.primary} />
            <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>
              Speed<span style={{ color: COLORS.primary }}>Test</span> Pro
            </h1>
          </div>

          <p style={{ color: COLORS.light }}>
            Alta performance em cada conexão.
          </p>
        </div>

        {/* GAUGES */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "25px",
            width: "100%",
            maxWidth: "1000px"
          }}
        >
          {[
            { label: "Download", val: download, icon: Download, color: COLORS.primary },
            { label: "Upload", val: upload, icon: Upload, color: COLORS.accent },
            { label: "Ping", val: ping, icon: Clock, color: COLORS.light, unit: "ms" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: "20px",
                padding: "20px",
                textAlign: "center",
                maxWidth: "280px",
                margin: "0 auto"
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                <item.icon size={20} color={item.color} />
                <span>{item.label}</span>
              </div>

              <GaugeComponent
                style={{ width: "220px", margin: "0 auto" }}
                value={item.val}
                maxValue={idx === 2 ? 200 : 500}
                type="semicircle"
                arc={{
                  width: 0.18,
                  padding: 0.02,
                  subArcs: [
                    { limit: 50, color: COLORS.dark },
                    { limit: 150, color: COLORS.accent },
                    { color: COLORS.primary }
                  ]
                }}
                pointer={{ type: "blob", color: COLORS.white }}
              />

              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: item.color
                }}
              >
                {item.val} {item.unit || "Mbps"}
              </div>
            </motion.div>
          ))}
        </div>

        {/* INFO */}

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          {[
            { icon: Server, label: "Provedor", value: isp },
            { icon: MapPin, label: "Localização", value: location },
            { icon: Activity, label: "Jitter", value: `${jitter} ms` }
          ].map((info, i) => (
            <div
              key={i}
              style={{
                background: COLORS.secondary,
                padding: "14px 20px",
                borderRadius: 14,
                minWidth: "200px",
                maxWidth: "260px"
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                <info.icon size={12} /> {info.label}
              </div>

              <div style={{ fontWeight: 600 }}>{info.value || "---"}</div>
            </div>
          ))}
        </div>

        {/* BOTÃO */}

        <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <AnimatePresence>
            {loading && (
              <motion.div>
                <div
                  style={{
                    height: 6,
                    background: "#ffffff11",
                    borderRadius: 10,
                    marginBottom: 10
                  }}
                >
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    style={{
                      height: "100%",
                      background: COLORS.primary
                    }}
                  />
                </div>

                <p>Executando: {currentTest}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={startTest}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            style={{
              padding: "16px 40px",
              borderRadius: 100,
              border: "none",
              background: COLORS.primary,
              fontWeight: 700,
              cursor: "pointer",
              color: COLORS.dark,
              display: "flex",
              gap: 10,
              alignItems: "center",
              justifyContent: "center",
              margin: "20px auto"
            }}
          >
            {loading ? <Activity className="animate-spin" /> : <Zap size={18} />}
            {loading ? "PROCESSANDO..." : "INICIAR TESTE"}
          </motion.button>
        </div>

        {/* FOOTER */}

        <footer
          style={{
            display: "flex",
            gap: 30,
            opacity: 0.5,
            fontSize: 12
          }}
        >
          <span>
            <Shield size={12} /> 100% SEGURO
          </span>

          <span>
            <Globe size={12} /> REDE MUNDIAL
          </span>

          <span>
            <Wifi size={12} /> TECNOLOGIA CLOUDFLARE
          </span>
        </footer>
      </motion.main>
    </div>
  );
}
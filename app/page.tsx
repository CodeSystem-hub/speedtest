"use client";

import { useState, useEffect } from "react";
import GaugeComponent from "react-gauge-component";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  Clock,
  MapPin,
  Server,
  Activity,
  Zap,
  Shield,
  Globe,
  Wifi
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  async function getIPInfo() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      setIsp(data.org || "Desconhecido");
      setLocation(`${data.city || "N/A"}`);
    } catch (e) { 
      setIsp("Erro de Rede"); 
    }
  }

  async function testPing() {
    setCurrentTest("Ping");
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch("https://speed.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
        times.push(performance.now() - start);
      } catch (e) { 
        times.push(100); 
      }
      setProgress((i + 1) * 20);
    }
    setPing(Math.round(Math.min(...times)));
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    setJitter(Math.round(times.reduce((a, b) => a + Math.abs(b - avg), 0) / times.length));
  }

  async function testDownload() {
    setCurrentTest("Download");
    const size = isMobile ? 5000000 : 25000000; 
    try {
      const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, { cache: "no-store" });
      if (!response.body) return;
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
      setDownload(parseFloat(((received * 8) / duration / 1000000).toFixed(2)));
    } catch (err) { 
      console.error(err); 
    }
  }

  async function testUpload() {
    setCurrentTest("Upload");
    const size = isMobile ? 2000000 : 10000000;
    const data = new Uint8Array(size);
    const start = performance.now();
    try {
      await fetch("https://speed.cloudflare.com/__up", { method: "POST", body: data, mode: "cors" });
      const duration = (performance.now() - start) / 1000;
      setUpload(parseFloat(((size * 8) / duration / 1000000).toFixed(2)));
    } catch (err) { 
      console.error(err); 
    }
  }

  async function startTest() {
    setLoading(true);
    setProgress(0);
    setDownload(0);
    setUpload(0);
    await getIPInfo();
    await testPing();
    await testDownload();
    await testUpload();
    setCurrentTest("Concluído");
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `radial-gradient(circle at center, ${COLORS.secondary} 0%, ${COLORS.dark} 100%)`,
        color: COLORS.white,
        fontFamily: "sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "10px" : "40px",
        overflowX: "hidden"
      }}
    >
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          maxWidth: "900px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "10px" : "30px",
          textAlign: "center"
        }}
      >
        {/* HEADER */}
        <div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
            <Zap size={isMobile ? 20 : 32} color={COLORS.primary} />
            <h1 style={{ fontSize: isMobile ? "1.3rem" : "2.5rem", fontWeight: 800, margin: 0 }}>
              Speed<span style={{ color: COLORS.primary }}>Test</span> Pro
            </h1>
          </div>
          <p style={{ color: COLORS.light, fontSize: isMobile ? "9px" : "13px", opacity: 0.7 }}>
            Performance em Tempo Real
          </p>
        </div>

        {/* GAUGES */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: isMobile ? "5px" : "15px",
        }}>
          {[
            { label: "Down", val: download, icon: Download, color: COLORS.primary, max: 500 },
            { label: "Up", val: upload, icon: Upload, color: COLORS.accent, max: 500 },
            { label: "Ping", val: ping, icon: Clock, color: COLORS.light, unit: "ms", max: 200 }
          ].map((item, idx) => (
            <div key={idx} style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              padding: isMobile ? "12px 2px" : "20px",
              border: `1px solid ${item.color}10`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", fontSize: isMobile ? "8px" : "13px", marginBottom: "4px" }}>
                <item.icon size={isMobile ? 10 : 16} color={item.color} />
                <span style={{ fontWeight: 600 }}>{item.label}</span>
              </div>
              
              <GaugeComponent
                value={item.val}
                maxValue={item.max}
                type="semicircle"
                // Usando 'as any' para ignorar restrições de tipo do compilador no build
                labels={{
                   valueLabel: { hide: true } as any,
                   markLabel: { hideMinMax: true } as any
                } as any}
                arc={{
                  width: 0.12,
                  padding: 0.02,
                  subArcs: [
                    { limit: item.max * 0.2, color: COLORS.dark },
                    { limit: item.max * 0.6, color: COLORS.accent },
                    { color: COLORS.primary }
                  ],
                  nbTick: 8
                } as any}
                pointer={{
                  type: "needle",
                  color: COLORS.white,
                  length: 0.75,
                  width: isMobile ? 2 : 4,
                  elastic: true
                } as any}
              />
              
              <div style={{ fontSize: isMobile ? "12px" : "22px", fontWeight: 800, color: item.color, marginTop: "2px" }}>
                {item.val}<span style={{ fontSize: "0.7em", marginLeft: "2px", opacity: 0.8 }}>{item.unit || "Mb"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* INFO GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: isMobile ? "4px" : "10px",
        }}>
          {[
            { icon: Server, label: "Rede", value: isp },
            { icon: MapPin, label: "Local", value: location },
            { icon: Activity, label: "Jitter", value: `${jitter}ms` }
          ].map((info, i) => (
            <div key={i} style={{ 
              background: COLORS.secondary, 
              padding: "8px 2px", 
              borderRadius: "8px"
            }}>
              <div style={{ fontSize: isMobile ? "7px" : "10px", opacity: 0.5, textTransform: "uppercase" }}>{info.label}</div>
              <div style={{ fontWeight: 600, fontSize: isMobile ? "9px" : "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {info.value || "---"}
              </div>
            </div>
          ))}
        </div>

        {/* PROGRESS BAR AREA */}
        <div style={{ height: "20px" }}>
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ height: "3px", background: "#ffffff11", borderRadius: "10px", overflow: "hidden", maxWidth: "250px", margin: "0 auto" }}>
                  <motion.div animate={{ width: `${progress}%` }} style={{ height: "100%", background: COLORS.primary }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <footer style={{ display: "flex", justifyContent: "center", gap: "15px", opacity: 0.3, fontSize: isMobile ? "8px" : "11px" }}>
          <span><Shield size={9} /> SEGURO</span>
          <span><Globe size={9} /> 5G OK</span>
          <span><Wifi size={9} /> CLOUDFLARE</span>
        </footer>

        {/* BOTÃO FLUTUANTE (MOBILE) / FIXO (DESKTOP) */}
        <div style={isMobile ? {
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 1000
        } : {
          width: "100%",
          display: "flex",
          justifyContent: "center"
        }}>
          <motion.button
            onClick={startTest}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: isMobile ? "65px" : "100%",
              height: isMobile ? "65px" : "55px",
              maxWidth: isMobile ? "65px" : "400px",
              borderRadius: isMobile ? "50%" : "12px",
              border: "none",
              background: COLORS.primary,
              color: COLORS.dark,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: `0 10px 25px -5px ${COLORS.primary}88`,
            }}
          >
            {loading ? <Activity className="animate-spin" size={24} /> : <Zap size={isMobile ? 28 : 22} fill={COLORS.dark} />}
            {!isMobile && (loading ? "PROCESSANDO..." : "INICIAR DIAGNÓSTICO")}
          </motion.button>
        </div>
      </motion.main>
    </div>
  );
}
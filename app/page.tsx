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

// Cores extraídas da imagem enviada
const COLORS = {
  primary: "#46d643",    // Verde Vibrante
  secondary: "#144449",  // Verde Petróleo/Escuro
  accent: "#7AB340",     // Verde Oliva
  dark: "#094720",       // Verde Floresta Profundo
  light: "#DAEFBE",      // Verde Bem Claro
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

  // --- LÓGICA MANTIDA CONFORME SOLICITADO ---
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
    const response = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}`, { cache: "no-store" });
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
    setDownload(parseFloat(((received * 8) / duration / 1_000_000).toFixed(2)));
  }

  async function testUpload() {
    setCurrentTest("Upload");
    const size = 20_000_000;
    const data = new Uint8Array(size);
    const start = performance.now();
    await fetch("https://speed.cloudflare.com/__up", { method: "POST", body: data });
    const duration = (performance.now() - start) / 1000;
    setUpload(parseFloat(((size * 8) / duration / 1_000_000).toFixed(2)));
  }

  async function startTest() {
    try {
      setLoading(true); setProgress(0);
      await getIPInfo(); await testPing(); await testDownload(); await testUpload();
      setCurrentTest(""); setProgress(100);
    } catch (err) {
      alert("Erro no teste.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      // Fundo usando o verde mais escuro da paleta
      background: `radial-gradient(circle at center, ${COLORS.secondary} 0%, ${COLORS.dark} 100%)`,
      color: COLORS.white,
      fontFamily: "'Poppins', sans-serif", // Fonte principal da paleta
      position: "relative",
      overflowX: "hidden"
    }}>
      
      {/* Elementos Decorativos Baseados nos ícones da imagem */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "500px",
        height: "500px",
        border: `1px solid ${COLORS.primary}22`,
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "relative",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "50px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px" }}
          >
            <Zap size={48} color={COLORS.primary} fill={COLORS.primary} />
            <h1 style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              margin: 0,
              color: COLORS.white,
              letterSpacing: "-1px"
            }}>
              Speed<span style={{ color: COLORS.primary }}>Test</span> Pro
            </h1>
          </motion.div>
          <p style={{ 
            fontFamily: "'Quicksand', sans-serif", // Segunda fonte da paleta
            color: COLORS.light, 
            fontSize: "1.2rem", 
            marginTop: "10px",
            fontWeight: "500" 
          }}>
            Alta performance em cada conexão.
          </p>
        </div>

        {/* Gauges Container */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
          width: "100%",
        }}>
          {[ 
            { label: "Download", val: download, icon: Download, color: COLORS.primary },
            { label: "Upload", val: upload, icon: Upload, color: COLORS.accent },
            { label: "Ping", val: ping, icon: Clock, color: COLORS.light, unit: "ms" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              style={{
                width: "300px",
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px",
                padding: "30px",
                border: `1px solid ${COLORS.white}11`,
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
                <item.icon color={item.color} size={24} />
                <span style={{ fontWeight: "600", color: COLORS.light }}>{item.label}</span>
              </div>
              
              <GaugeComponent
                value={item.val}
                maxValue={idx === 2 ? 200 : 500}
                type="semicircle"
                arc={{
                  width: 0.15,
                  padding: 0.02,
                  cornerRadius: 10,
                  subArcs: [
                    { limit: 50, color: COLORS.dark },
                    { limit: 150, color: COLORS.accent },
                    { color: COLORS.primary },
                  ]
                }}
                pointer={{ type: 'blob', color: COLORS.white }}
                labels={{
                  valueLabel: { style: { fill: COLORS.white, textShadow: "none" } }
                }}
              />
              <div style={{ fontSize: "1.5rem", fontWeight: "700", color: item.color, marginTop: "10px" }}>
                {item.val} <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>{item.unit || "Mbps"}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Cards */}
        <div style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%"
        }}>
          {[
            { icon: Server, label: "Provedor", value: isp, color: COLORS.primary },
            { icon: MapPin, label: "Localização", value: location, color: COLORS.accent },
            { icon: Activity, label: "Jitter", value: `${jitter} ms`, color: COLORS.light }
          ].map((info, i) => (
            <div key={i} style={{
              background: COLORS.secondary,
              padding: "15px 25px",
              borderRadius: "16px",
              borderLeft: `4px solid ${info.color}`,
              minWidth: "220px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.7, fontSize: "0.8rem", marginBottom: "5px" }}>
                <info.icon size={14} /> {info.label}
              </div>
              <div style={{ fontWeight: "600" }}>{info.value || "---"}</div>
            </div>
          ))}
        </div>

        {/* Progress & Button */}
        <div style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}>
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ height: "6px", background: "#ffffff11", borderRadius: "10px", marginBottom: "15px" }}>
                  <motion.div 
                    style={{ height: "100%", background: COLORS.primary, borderRadius: "10px" }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p style={{ color: COLORS.light, fontSize: "0.9rem" }}>Executando: {currentTest}...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={startTest}
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${COLORS.primary}44` }}
            whileTap={{ scale: 0.98 }}
            style={{
              marginTop: "20px",
              padding: "20px 60px",
              borderRadius: "100px",
              border: "none",
              background: COLORS.primary,
              color: COLORS.dark,
              fontSize: "1.2rem",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "0 auto"
            }}
          >
            {loading ? <Activity className="animate-spin" /> : <Zap size={20} />}
            {loading ? "PROCESSANDO..." : "INICIAR TESTE"}
          </motion.button>
        </div>

        {/* Footer */}
        <footer style={{ 
          display: "flex", 
          gap: "40px", 
          opacity: 0.5, 
          fontSize: "0.8rem",
          borderTop: `1px solid ${COLORS.white}11`,
          paddingTop: "40px",
          width: "100%",
          justifyContent: "center"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Shield size={14} /> 100% SEGURO</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Globe size={14} /> REDE MUNDIAL</span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Wifi size={14} /> TECNOLOGIA CLOUDFLARE</span>
        </footer>
      </motion.main>
    </div>
  );
}
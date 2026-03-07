"use client";

import { useState, useRef, useEffect } from "react";
import GaugeComponent from "react-gauge-component";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, Download, Upload, Clock, MapPin, 
  Server, Activity, Zap, Shield, Globe, X 
} from "lucide-react";

const COLORS = {
  primary: "#46d643",
  secondary: "#144449",
  accent: "#7AB340",
  dark: "#094720",
  light: "#DAEFBE",
  white: "#FFFFFF",
  danger: "#ff4d4d"
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
  const [showResult, setShowResult] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target)) setShowResult(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function startTest() {
    try {
      setLoading(true);
      setShowResult(false);
      setProgress(0);
      setDownload(0);
      setUpload(0);
      
      // 1. Simulação Info
      setIsp("Claro NXT Telecomunicações");
      setLocation("São Luís");

      // 2. Ping
      setCurrentTest("Ping");
      for(let i=0; i<=100; i+=25) { setProgress(i); await new Promise(r => setTimeout(r, 100)); }
      setPing(15); setJitter(3);

      // 3. Download
      setCurrentTest("Download");
      for(let i=0; i<=185; i+=15) { 
        setDownload(i + Math.random() * 2); 
        setProgress((i/185)*100);
        await new Promise(r => setTimeout(r, 120)); 
      }
      setDownload(185.4);

      // 4. Upload
      setCurrentTest("Upload");
      setProgress(0);
      for(let i=0; i<=92; i+=10) { 
        setUpload(i + Math.random() * 2); 
        setProgress((i/92)*100);
        await new Promise(r => setTimeout(r, 120)); 
      }
      setUpload(92.1);

      setCurrentTest("");
      setLoading(false);
      
      // DELAY DE 1 SEGUNDO antes de mostrar a mensagem
      setTimeout(() => {
        setShowResult(true);
      }, 1000);

    } catch (err) { console.error(err); setLoading(false); }
  }

  const mediaVelocidade = ((download + upload) / 2).toFixed(1);
  const feedback = parseFloat(mediaVelocidade) > 150 ? {t:"Ótima", c:COLORS.primary} : 
                   parseFloat(mediaVelocidade) >= 100 ? {t:"Boa", c:COLORS.accent} : {t:"Ruim", c:COLORS.danger};

  // Configuração dos "tracinhos verdes" horizontais/segmentados
  const gaugeArc = {
    width: 0.15,
    padding: 0.03, // Cria o efeito de separação (tracinhos)
    subArcs: Array.from({ length: 30 }).map((_, i) => ({
      limit: (i + 1) * (200 / 30),
      color: COLORS.primary, // Todos verdes conforme pedido
      showTick: false
    }))
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050f0d", // Fundo ultra escuro para destacar o verde
      color: "#fff",
      fontFamily: "'Poppins', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "20px", gap: "40px"
    }}>
      
      <header style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <Zap size={32} color={COLORS.primary} fill={COLORS.primary} />
          <h1 style={{ fontSize: "2.2rem", fontWeight: "800", margin: 0 }}>SpeedTest</h1>
        </div>
      </header>

      {/* Container dos Velocímetros - Centralizado e com Espaçamento */}
      <div style={{ 
        display: "flex", gap: "30px", flexWrap: "wrap", 
        justifyContent: "center", width: "100%", maxWidth: "900px" 
      }}>
        {/* Gauge Download */}
        <div style={{ 
          flex: "1", minWidth: "280px", background: "rgba(255,255,255,0.02)", 
          borderRadius: "24px", padding: "25px", border: "1px solid rgba(255,255,255,0.05)", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "0.75rem", color: COLORS.primary, fontWeight: "700", marginBottom: "15px", letterSpacing: "1px" }}>
            <Download size={14} style={{ marginRight: "5px" }} /> DOWNLOAD
          </div>
          <GaugeComponent 
            value={download} 
            maxValue={200} 
            arc={gaugeArc}
            labels={{ valueLabel: { style: { fill: "#fff", fontSize: "28px", fontWeight: "700" } } }} 
          />
        </div>

        {/* Gauge Upload */}
        <div style={{ 
          flex: "1", minWidth: "280px", background: "rgba(255,255,255,0.02)", 
          borderRadius: "24px", padding: "25px", border: "1px solid rgba(255,255,255,0.05)", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "0.75rem", color: COLORS.primary, fontWeight: "700", marginBottom: "15px", letterSpacing: "1px" }}>
            <Upload size={14} style={{ marginRight: "5px" }} /> UPLOAD
          </div>
          <GaugeComponent 
            value={upload} 
            maxValue={200} 
            arc={gaugeArc}
            labels={{ valueLabel: { style: { fill: "#fff", fontSize: "28px", fontWeight: "700" } } }} 
          />
        </div>
      </div>

      {/* Grid de Informações - Evita sobreposição */}
      <div style={{ 
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
        gap: "15px", width: "100%", maxWidth: "900px" 
      }}>
        {[
          { label: "PROVEDOR", val: isp, icon: Server },
          { label: "LOCAL", val: location, icon: MapPin },
          { label: "PING", val: `${ping}ms`, icon: Clock },
          { label: "JITTER", val: `${jitter}ms`, icon: Activity }
        ].map((item, i) => (
          <div key={i} style={{ 
            background: "rgba(255,255,255,0.04)", padding: "15px", borderRadius: "16px", 
            textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" 
          }}>
            <div style={{ fontSize: "0.6rem", opacity: 0.5, marginBottom: "5px", fontWeight: "700" }}>{item.label}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{item.val || "---"}</div>
          </div>
        ))}
      </div>

      {/* Área de Ação Centralizada */}
      <div style={{ width: "100%", maxWidth: "450px", textAlign: "center" }}>
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: "20px" }}>
              <div style={{ height: "4px", background: "#111", borderRadius: "10px", overflow: "hidden" }}>
                <motion.div style={{ height: "100%", background: COLORS.primary }} animate={{ width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: "0.7rem", color: COLORS.primary, marginTop: "8px", fontWeight: "600" }}>
                TESTANDO {currentTest.toUpperCase()}...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={startTest} 
          disabled={loading}
          style={{
            padding: "18px 0", borderRadius: "16px", border: "none", 
            background: COLORS.primary, color: "#000", fontWeight: "800", 
            fontSize: "1rem", cursor: "pointer", width: "100%",
            boxShadow: `0 10px 20px ${COLORS.primary}22`,
            transition: "transform 0.2s"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {loading ? "AGUARDE..." : "INICIAR TESTE"}
        </button>
      </div>

      {/* Modal de Resultado com Centralização Absoluta */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", 
              backdropFilter: "blur(8px)", display: "flex", alignItems: "center", 
              justifyContent: "center", zIndex: 9999, padding: "20px" 
            }}
          >
            <motion.div 
              ref={modalRef}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ 
                background: "#0a1a16", padding: "40px 30px", borderRadius: "32px", 
                textAlign: "center", border: `1px solid ${feedback.c}`, 
                width: "100%", maxWidth: "400px", boxShadow: `0 0 40px ${feedback.c}11`
              }}
            >
              <div style={{ fontSize: "0.8rem", color: feedback.c, fontWeight: "700", marginBottom: "10px", letterSpacing: "2px" }}>RESULTADO</div>
              <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: "800", marginBottom: "20px" }}>
                Internet {feedback.t}
              </h2>
              
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "24px", marginBottom: "20px" }}>
                <div style={{ fontSize: "3rem", fontWeight: "900", color: feedback.c }}>
                  {mediaVelocidade}
                </div>
                <div style={{ fontSize: "0.9rem", opacity: 0.6, fontWeight: "600" }}>Mbps de média</div>
              </div>

              <p style={{ fontSize: "0.75rem", opacity: 0.4 }}>Clique fora desta caixa para fechar</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

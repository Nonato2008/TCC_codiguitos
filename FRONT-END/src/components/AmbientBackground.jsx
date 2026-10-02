import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useLocation } from "react-router-dom";

const waveSamples = Array.from({ length: 73 }, (_, index) => index * 20);

const scenes = {
  access: { centers: [580, 650, 720, 790], amplitude: 40, frequency: 1.7 },
  signup: { centers: [570, 650, 730, 810], amplitude: 54, frequency: 1.95 },
  welcome: { centers: [600, 675, 750, 830], amplitude: 52, frequency: 1.45 },
  dashboard: { centers: [560, 635, 710, 785], amplitude: 48, frequency: 2.1 },
  sales: { centers: [610, 675, 740, 805], amplitude: 44, frequency: 2.8 },
  saleForm: { centers: [570, 650, 730, 810], amplitude: 58, frequency: 1.55 },
  saleDetail: { centers: [610, 675, 740, 805], amplitude: 42, frequency: 2.65 },
  products: { centers: [590, 660, 730, 800], amplitude: 49, frequency: 2.2 },
  productForm: { centers: [570, 650, 730, 810], amplitude: 60, frequency: 1.6 },
  productDetail: { centers: [600, 670, 740, 810], amplitude: 48, frequency: 1.9 },
  stock: { centers: [580, 650, 720, 790], amplitude: 54, frequency: 2.35 },
  suppliers: { centers: [610, 675, 740, 805], amplitude: 44, frequency: 1.6 },
  supplierForm: { centers: [570, 650, 730, 810], amplitude: 58, frequency: 1.5 },
};

function getScene(pathname) {
  pathname = pathname.toLowerCase();
  if (pathname === "/home") return "welcome";
  if (pathname === "/cadastro") return "signup";
  if (pathname === "/login" || pathname === "/") return "access";
  if (pathname === "/painel") return "dashboard";
  if (pathname === "/vendas/cadastrar") return "saleForm";
  if (pathname === "/vendas") return "sales";
  if (/^\/vendas\/[^/]+$/.test(pathname)) return "saleDetail";
  if (pathname === "/produtos/cadastrar" || pathname === "/cadastroprodutos") return "productForm";
  if (pathname === "/produtos") return "products";
  if (/^\/produtos\/[^/]+$/.test(pathname)) return "productDetail";
  if (pathname === "/gerenciamentoestoque") return "stock";
  if (pathname === "/fornecedores/cadastrar") return "supplierForm";
  if (pathname === "/fornecedores") return "suppliers";
  return "access";
}

function createWavePath(index, phase = 0, scene) {
  const { centers, amplitude, frequency } = scenes[scene];
  const center = centers[index];
  const waveAmplitude = amplitude * (index % 2 === 0 ? 1 : 0.76);

  return waveSamples
    .map((x, sampleIndex) => {
      const progress = x / 1440;
      const primaryWave = Math.sin(progress * Math.PI * frequency + phase + index * 0.72);
      const secondaryWave = Math.sin(progress * Math.PI * (frequency * 1.85) - phase * 0.58 + index) * 0.2;
      const y = center + waveAmplitude * (primaryWave + secondaryWave);
      return `${sampleIndex === 0 ? "M" : "L"}${x} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function SceneArtwork({ scene }) {
  if (scene === "signup") {
    return (
      <g className="ambient-background__artwork" transform="translate(970 135)">
        <path d="M75 55h270v300H75z" />
        <circle cx="210" cy="155" r="54" />
        <path d="M112 315c8-58 41-88 98-88s90 30 98 88" />
        <circle cx="365" cy="300" r="46" />
        <path d="M365 274v52m-26-26h52" />
      </g>
    );
  }

  if (scene === "dashboard") {
    return (
      <g className="ambient-background__artwork" transform="translate(940 135)">
        <path d="M20 330H410M20 330V35" />
        <path d="m35 270 92-68 78 30 88-114 94-58" />
        <circle cx="127" cy="202" r="8" /><circle cx="205" cy="232" r="8" />
        <circle cx="293" cy="118" r="8" /><circle cx="387" cy="60" r="8" />
        <path d="M55 330V285h42v45m60 0v-82h42v82m60 0V190h42v140m60 0V125h42v205" />
      </g>
    );
  }

  if (scene === "sales" || scene === "saleForm" || scene === "saleDetail") {
    return (
      <g className="ambient-background__artwork" transform="translate(1010 120)">
        <path d="M75 30h230l24 30v290l-24-14-24 14-25-14-26 14-25-14-25 14-25-14-25 14-25-14-25 14V60z" />
        <path d="M125 105h120M125 150h150M125 195h104M125 240h138" />
        <circle cx="285" cy="285" r="39" />
        <path d="M296 269c-5-8-24-8-25 4-2 12 24 10 24 23 0 12-20 15-29 5m15-43v50" />
        {scene === "saleForm" && <><circle cx="305" cy="55" r="30" /><path d="M305 39v32m-16-16h32" /></>}
        {scene === "saleDetail" && <path d="M125 285h92" />}
      </g>
    );
  }

  if (scene === "products" || scene === "productForm" || scene === "productDetail") {
    return (
      <g className="ambient-background__artwork" transform="translate(940 150)">
        <path d="M75 72h55v34l18 22v220H57V128l18-22zm9-46h37v46H84z" />
        <path d="M58 185h89m-89 32h89m-74 41h59" />
        <path d="M205 105h48v28l15 19v196h-78V152l15-19zm8-39h32v39h-32z" />
        <path d="M190 195h78m-65 42h52" />
        {scene !== "productDetail" && <><circle cx="345" cy="270" r="45" /><path d="M345 246v48m-24-24h48" /></>}
        {scene === "productDetail" && <path d="m305 100 82 82-84 84-82-82zM284 182h1" />}
      </g>
    );
  }

  if (scene === "stock") {
    return (
      <g className="ambient-background__artwork" transform="translate(910 145)">
        <path d="M30 70h430M30 190h430M30 310h430M55 38v314m380-314v314" />
        <path d="M86 90h95v78H86zm135 0h74v78h-74zm116 0h68v78h-68z" />
        <path d="M76 210h66v-43h45v85H76zm163 0h84v77h-84zm119-28h55v100h-55z" />
        <path d="M50 352h390" />
      </g>
    );
  }

  if (scene === "suppliers" || scene === "supplierForm") {
    return (
      <g className="ambient-background__artwork" transform="translate(930 155)">
        <path d="M65 135h260M195 135v130M325 135l85 110" />
        <circle cx="65" cy="135" r="42" /><circle cx="195" cy="135" r="42" />
        <circle cx="325" cy="135" r="42" /><circle cx="195" cy="265" r="42" />
        <path d="M48 141h34m-17-17v34m113-23h34m-17-17v34m113-11h34m-17-17v34m-17 130h34m-17-17v34" />
        {scene === "supplierForm" && <><path d="M80 340h250v80H80zM80 340l125-75 125 75" /><path d="M205 330v72m-24-36h48" /></>}
        {scene === "suppliers" && <><path d="M320 300h102v63H320zM343 300v-34h45l34 34" /><circle cx="345" cy="370" r="13" /><circle cx="398" cy="370" r="13" /></>}
      </g>
    );
  }

  if (scene === "welcome") {
    return (
      <g className="ambient-background__artwork" transform="translate(920 160)">
        <path d="M90 110h280v220H90zM55 110 230 22l175 88M125 330V195h80v135m58-135h80v72h-80z" />
        <path d="M230 22v-54h48v78M230 55c-35 44-33 68 0 80 34-12 35-36 0-80zm-14 79h28" />
        <path d="M220 250h34" />
      </g>
    );
  }

  return (
    <g className="ambient-background__artwork" transform="translate(975 145)">
      <path d="M92 48h156l30 30v238l-24-13-24 13-24-13-24 13-24-13-24 13-24-13-24 13V78z" />
      <path d="M132 116h106m-106 46h126m-126 46h90" />
      <path d="M350 65c-14 24-43 54-43 80a43 43 0 0 0 86 0c0-26-29-56-43-80z" />
      <path d="M350 130v30m-15-15h30" />
    </g>
  );
}

export default function AmbientBackground() {
  const backgroundRef = useRef(null);
  const { pathname } = useLocation();
  const scene = getScene(pathname);

  useEffect(() => {
    const media = gsap.matchMedia(backgroundRef);

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const waves = gsap.utils.toArray(".ambient-background__wave");
      const motion = { phase: 0 };

      gsap.to(motion, {
        phase: Math.PI * 2,
        duration: 54,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          waves.forEach((wave, index) => {
            wave.setAttribute("d", createWavePath(index, motion.phase, scene));
          });
        },
      });
    });

    return () => media.revert();
  }, [scene]);

  return (
    <div ref={backgroundRef} className={`ambient-background ambient-background--${scene}`} aria-hidden="true">
      <svg
        className="ambient-background__waves"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        focusable="false"
      >
        {[0, 1, 2, 3].map((index) => (
          <path
            key={index}
            className={`ambient-background__wave ambient-background__wave--${index + 1}`}
            d={createWavePath(index, 0, scene)}
          />
        ))}
      </svg>
      <svg
        className="ambient-background__scene-art"
        viewBox="800 0 640 520"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <SceneArtwork scene={scene} />
      </svg>
    </div>
  );
}
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID="pc-premium-visual-system";
function installStyles(){if(document.getElementById(STYLE_ID))return;const style=document.createElement("style");style.id=STYLE_ID;style.textContent=`
:root{--pv-ink:#081b18;--pv-green:#22c55e;--pv-mint:#a7f3d0;--pv-blue:#38bdf8;--pv-line:rgba(15,49,42,.12);--pv-radius:18px}
body.pc-premium-ui{font-feature-settings:"ss01" 1,"cv02" 1,"cv03" 1;text-rendering:optimizeLegibility}
body.pc-premium-ui .site-header{border-bottom:1px solid rgba(255,255,255,.1)!important;background:rgba(5,24,31,.78)!important;backdrop-filter:blur(18px) saturate(140%)!important;box-shadow:0 8px 32px rgba(3,18,24,.08)!important}
body.pc-premium-ui .site-header--scrolled{background:rgba(255,255,255,.9)!important;border-color:var(--pv-line)!important}
body.pc-premium-ui .desktop-nav{padding:4px;border-radius:13px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}
body.pc-premium-ui .desktop-nav a{min-height:38px;display:flex;align-items:center;border-radius:9px!important;transition:background .18s ease,color .18s ease,transform .18s ease}
body.pc-premium-ui .desktop-nav a:hover{background:rgba(255,255,255,.1)!important;transform:translateY(-1px)}
body.pc-premium-ui .site-header--scrolled .desktop-nav{background:#f4f7f5;border-color:#e3e9e5}
body.pc-premium-ui .header-actions .icon-button{border-radius:11px!important;transition:transform .18s ease,background .18s ease}
body.pc-premium-ui .header-actions .icon-button:hover{transform:translateY(-2px)}

body.pc-premium-home .hero{min-height:590px!important;background:#061b24!important;isolation:isolate}
body.pc-premium-home .hero-photo{opacity:.34!important;filter:saturate(.78) contrast(1.08)!important;transform:scale(1.02)}
body.pc-premium-home .hero-wash{background:radial-gradient(circle at 76% 20%,rgba(56,189,248,.13),transparent 28%),radial-gradient(circle at 60% 85%,rgba(34,197,94,.14),transparent 32%),linear-gradient(90deg,rgba(5,22,29,.99) 0%,rgba(5,22,29,.94) 43%,rgba(5,22,29,.61) 100%)!important}
body.pc-premium-home .hero-content{min-height:590px!important;padding-top:104px!important;padding-bottom:48px!important;position:relative;z-index:2}
body.pc-premium-home .hero-copy{position:relative}
body.pc-premium-home .hero h1{font-size:clamp(3.15rem,5.6vw,5.35rem)!important;line-height:.93!important;letter-spacing:-.062em!important;max-width:760px!important;text-wrap:balance}
body.pc-premium-home .hero h1 span{background:linear-gradient(95deg,#86efac,#5eead4 54%,#7dd3fc);-webkit-background-clip:text;background-clip:text;color:transparent!important}
body.pc-premium-home .hero-copy>p{max-width:620px!important;font-size:1rem!important;line-height:1.62!important;color:#bed0d7!important}
body.pc-premium-home .hero-live{border:1px solid rgba(134,239,172,.22);background:rgba(34,197,94,.08);padding:7px 10px;border-radius:999px;width:max-content}
body.pc-premium-home .search-combo__form{border:1px solid rgba(255,255,255,.7)!important;box-shadow:0 24px 70px rgba(0,0,0,.28),0 0 0 5px rgba(255,255,255,.04)!important}
body.pc-premium-home .hero-insight{border:1px solid rgba(255,255,255,.14)!important;background:linear-gradient(160deg,rgba(13,47,58,.92),rgba(7,30,39,.86))!important;box-shadow:0 35px 90px rgba(0,0,0,.28)!important;transform:perspective(900px) rotateY(-2deg)}
.pc-premium-hero-art{position:absolute;right:-30px;top:96px;width:420px;height:390px;pointer-events:none;z-index:1;opacity:.62;filter:drop-shadow(0 32px 50px rgba(0,0,0,.2))}
.pc-premium-hero-art svg{width:100%;height:100%;overflow:visible}
.pc-premium-hero-art .pv-orbit{fill:none;stroke:rgba(125,211,252,.25);stroke-width:1}.pc-premium-hero-art .pv-chart{fill:none;stroke:#86efac;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.pc-premium-hero-art .pv-dot{fill:#7dd3fc}.pc-premium-hero-art .pv-panel{fill:rgba(255,255,255,.035);stroke:rgba(255,255,255,.12)}

body.pc-premium-home .category-rail{border:1px solid var(--pv-line)!important;border-radius:15px!important;margin-top:14px!important;background:rgba(255,255,255,.84)!important;box-shadow:0 12px 35px rgba(10,40,32,.05)!important}
body.pc-premium-home .section,body.pc-premium-home .featured-products,body.pc-premium-home .professional{padding-top:48px!important;padding-bottom:48px!important}
body.pc-premium-home .section-heading h2{font-size:clamp(1.75rem,2.8vw,2.65rem)!important;letter-spacing:-.045em!important;text-wrap:balance}
body.pc-premium-home .visual-product-card,body.pc-premium-home .store-card,body.pc-premium-home .basket-plan{border-color:var(--pv-line)!important;border-radius:var(--pv-radius)!important;box-shadow:0 10px 30px rgba(7,35,27,.045)!important;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important}
body.pc-premium-home .visual-product-card:hover,body.pc-premium-home .store-card:hover{transform:translateY(-5px)!important;border-color:rgba(34,197,94,.32)!important;box-shadow:0 20px 48px rgba(7,35,27,.1)!important}
body.pc-premium-home .visual-product-image{background:radial-gradient(circle at 50% 42%,#fff 0,#f2f7f4 62%,#e9f1ec 100%)!important}
body.pc-premium-home .visual-product-image img{filter:drop-shadow(0 14px 18px rgba(21,45,34,.14));transition:transform .24s ease!important}
body.pc-premium-home .visual-product-card:hover .visual-product-image img{transform:translateY(-4px) scale(1.035)!important}
body.pc-premium-home #como-funciona{position:relative;overflow:hidden;background:linear-gradient(135deg,#f7fbf8,#edf7f1)!important;border:1px solid var(--pv-line);border-radius:24px;padding:30px!important}
body.pc-premium-home #como-funciona:after{content:"";position:absolute;width:240px;height:240px;border-radius:50%;right:-100px;bottom:-130px;background:radial-gradient(circle,rgba(34,197,94,.14),transparent 68%)}
body.pc-premium-home .step-card{position:relative!important;border-left:2px solid rgba(34,197,94,.28)!important;padding-left:18px!important}
body.pc-premium-home .final-cta{background:radial-gradient(circle at 85% 20%,rgba(56,189,248,.16),transparent 30%),linear-gradient(120deg,#071e28,#0d3340)!important;border-color:rgba(125,211,252,.14)!important;overflow:hidden}
body.pc-premium-home .site-footer{background:linear-gradient(145deg,#04151c,#071f27)!important}
body.pc-premium-home .footer-grid h3{color:#fff!important}.footer-grid a{transition:color .16s ease,transform .16s ease}.footer-grid a:hover{color:#86efac!important;transform:translateX(2px)}

body.pc-premium-auth .auth-page{background:#061b24!important;min-height:100vh}
body.pc-premium-auth .auth-brand-panel{position:relative;overflow:hidden;background:radial-gradient(circle at 30% 20%,rgba(56,189,248,.16),transparent 30%),radial-gradient(circle at 70% 70%,rgba(34,197,94,.17),transparent 35%),linear-gradient(145deg,#061b24,#0b3038)!important}
body.pc-premium-auth .auth-brand-panel:after{content:"";position:absolute;inset:8%;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,black,transparent);transform:perspective(600px) rotateX(55deg) translateY(35%);pointer-events:none}
body.pc-premium-auth .auth-form-wrap{background:linear-gradient(180deg,#fff,#f7faf8)!important}
body.pc-premium-auth .auth-form{max-width:470px!important;padding:30px!important;border:1px solid #dfe8e2;border-radius:22px;background:rgba(255,255,255,.9);box-shadow:0 24px 70px rgba(10,43,32,.11)}
body.pc-premium-auth .auth-form h2{font-size:clamp(1.8rem,4vw,2.55rem)!important;letter-spacing:-.05em!important;margin:.35rem 0 .55rem!important}
body.pc-premium-auth .auth-form label{font-weight:800!important;color:#17332a!important}
body.pc-premium-auth .auth-form input{min-height:52px!important;border-radius:12px!important;border:1px solid #cfddd5!important;background:#f8fbf9!important;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}
body.pc-premium-auth .auth-form input:focus{background:#fff!important;border-color:#22a85a!important;box-shadow:0 0 0 4px rgba(34,197,94,.12)!important;outline:none!important}
body.pc-premium-auth .auth-form .button--primary{min-height:52px!important;border-radius:12px!important;background:linear-gradient(110deg,#16a34a,#22c55e)!important;box-shadow:0 14px 28px rgba(22,163,74,.2)!important;transition:transform .18s ease,box-shadow .18s ease!important}
body.pc-premium-auth .auth-form .button--primary:hover{transform:translateY(-2px)!important;box-shadow:0 18px 34px rgba(22,163,74,.27)!important}
body.pc-premium-auth .center-link{min-height:42px;display:flex;align-items:center;justify-content:center;border-radius:9px!important}

@media(max-width:900px){body.pc-premium-home .hero{min-height:0!important}.pc-premium-hero-art{display:none}body.pc-premium-home .hero-content{min-height:0!important}body.pc-premium-home .hero h1{font-size:clamp(2.55rem,11.5vw,4rem)!important}.desktop-nav{background:transparent!important;border:0!important}body.pc-premium-auth .auth-form{padding:23px!important;border-radius:18px}.auth-brand-panel{min-height:220px!important}}
@media(max-width:560px){body.pc-premium-home .section,body.pc-premium-home .featured-products,body.pc-premium-home .professional{padding-top:36px!important;padding-bottom:36px!important}body.pc-premium-home #como-funciona{margin-inline:12px!important;padding:20px!important;border-radius:18px}body.pc-premium-home .category-rail{margin-inline:10px!important}.auth-form-wrap{padding:16px!important}.auth-form{padding:20px!important}}
@media(prefers-reduced-motion:reduce){body.pc-premium-ui *,body.pc-premium-ui *:before,body.pc-premium-ui *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;document.head.appendChild(style)}

function heroArt(){const node=document.createElement("div");node.className="pc-premium-hero-art";node.setAttribute("aria-hidden","true");node.innerHTML=`<svg viewBox="0 0 420 390"><ellipse class="pv-orbit" cx="220" cy="195" rx="178" ry="116" transform="rotate(-18 220 195)"/><ellipse class="pv-orbit" cx="220" cy="195" rx="130" ry="176" transform="rotate(28 220 195)"/><rect class="pv-panel" x="82" y="104" width="255" height="180" rx="24"/><path class="pv-chart" d="M112 242l48-50 40 25 55-79 48 30"/><circle class="pv-dot" cx="112" cy="242" r="6"/><circle class="pv-dot" cx="160" cy="192" r="6"/><circle class="pv-dot" cx="200" cy="217" r="6"/><circle class="pv-dot" cx="255" cy="138" r="6"/><circle class="pv-dot" cx="303" cy="168" r="6"/><path class="pv-orbit" d="M106 260h197M106 132v128"/></svg>`;return node}

export function PremiumVisualSystem(){const {pathname}=useLocation();useEffect(()=>{installStyles();document.body.classList.add("pc-premium-ui");const home=pathname==="/",auth=["/login","/cadastro","/registrar","/admin-login"].includes(pathname);document.body.classList.toggle("pc-premium-home",home);document.body.classList.toggle("pc-premium-auth",auth);let art:HTMLElement|null=null;if(home){const hero=document.querySelector<HTMLElement>(".hero");if(hero&&!hero.querySelector(".pc-premium-hero-art")){art=heroArt();hero.appendChild(art)}}return()=>{art?.remove();document.body.classList.remove("pc-premium-home","pc-premium-auth")}},[pathname]);return null}

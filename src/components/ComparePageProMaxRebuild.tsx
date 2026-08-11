import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const STYLE_ID = "pc-compare-promax-rebuild";
const BODY_CLASS = "pc-compare-promax";

const styles = `
body.pc-compare-promax{--cmp-bg:#f3f7f6;--cmp-surface:#ffffff;--cmp-surface-2:#f8fbfa;--cmp-text:#102033;--cmp-muted:#52677a;--cmp-line:#d7e2e6;--cmp-brand:#0bb981;--cmp-brand-deep:#08785c;--cmp-navy:#061b2b;background:var(--cmp-bg)!important;color:var(--cmp-text)!important}
body.pc-compare-promax .pc-secondary-hero{display:none!important}
body.pc-compare-promax .search-command{position:relative;isolation:isolate;overflow:hidden;max-width:none!important;margin:0!important;padding:0!important;min-height:390px!important;border:0!important;border-radius:0!important;background:var(--cmp-navy)!important;color:#fff!important;box-shadow:none!important;display:flex!important;align-items:center!important}
body.pc-compare-promax .search-command:before{content:"";position:absolute;inset:0;z-index:-2;background:url('/hero-profissional.png') center 48%/cover no-repeat;filter:saturate(1.02) contrast(1.05) brightness(.82)}
body.pc-compare-promax .search-command:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(2,15,24,.97) 0%,rgba(3,25,36,.91) 50%,rgba(3,25,36,.54) 100%),linear-gradient(180deg,rgba(0,0,0,.04),rgba(1,13,20,.5))}
body.pc-compare-promax .search-command>*{width:min(1160px,calc(100% - 40px));margin-left:auto!important;margin-right:auto!important}
body.pc-compare-promax .search-command__intro{padding-top:44px!important;gap:18px!important;align-items:end!important}
body.pc-compare-promax .search-command .eyebrow{color:#83edc5!important;font-size:12px!important;font-weight:900!important;letter-spacing:.1em!important;text-transform:uppercase!important}
body.pc-compare-promax .search-command h1{max-width:760px!important;margin:8px 0 10px!important;color:#fff!important;font-size:clamp(2.6rem,5vw,4.7rem)!important;line-height:.96!important;letter-spacing:-.055em!important;text-wrap:balance}
body.pc-compare-promax .search-command p{max-width:680px!important;margin:0!important;color:#dce7ec!important;font-size:16px!important;line-height:1.55!important}
body.pc-compare-promax .search-command__trust{background:rgba(8,38,51,.82)!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:16px!important;padding:14px 16px!important;color:#fff!important;box-shadow:0 12px 34px rgba(0,0,0,.16)!important;backdrop-filter:none!important}
body.pc-compare-promax .search-command__trust small{color:#c5d4db!important;font-size:11px!important}
body.pc-compare-promax .search-command__box{margin-top:18px!important;margin-bottom:34px!important}
body.pc-compare-promax .search-command__box form,body.pc-compare-promax .search-command__box .search-combo__form{min-height:58px!important;border-radius:16px!important;background:#fff!important;border:1px solid rgba(255,255,255,.46)!important;box-shadow:0 18px 44px rgba(0,0,0,.25)!important;overflow:hidden!important}
body.pc-compare-promax .search-command__box input{min-height:56px!important;font-size:16px!important;color:#102033!important;background:#fff!important}
body.pc-compare-promax .search-command__box button{min-height:48px!important;border-radius:12px!important;background:#10c58a!important;color:#032d24!important;font-weight:900!important;transition:transform .2s ease,filter .2s ease,box-shadow .2s ease!important}
body.pc-compare-promax .search-command__actions{margin-top:10px!important;gap:8px!important;align-items:center!important}
body.pc-compare-promax .search-command__actions button{min-height:42px!important;padding:0 14px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.17)!important;background:rgba(255,255,255,.08)!important;color:#f2f7f9!important;font-size:12px!important;font-weight:800!important}
body.pc-compare-promax .search-command__actions>span{color:#c2d1d8!important;font-size:12px!important}

body.pc-compare-promax .professional-search-layout{width:min(1160px,calc(100% - 40px))!important;max-width:none!important;margin:32px auto 64px!important;display:grid!important;grid-template-columns:250px minmax(0,1fr)!important;gap:22px!important;align-items:start!important}
body.pc-compare-promax .professional-filters{position:sticky!important;top:84px!important;padding:18px!important;border:1px solid var(--cmp-line)!important;border-radius:20px!important;background:var(--cmp-surface)!important;box-shadow:0 10px 32px rgba(15,23,42,.055)!important;color:var(--cmp-text)!important}
body.pc-compare-promax .professional-filters header{padding-bottom:14px!important;margin-bottom:14px!important;border-bottom:1px solid var(--cmp-line)!important}
body.pc-compare-promax .professional-filters h2,body.pc-compare-promax .professional-filters h3{color:var(--cmp-text)!important;font-size:15px!important;font-weight:900!important;letter-spacing:-.015em!important}
body.pc-compare-promax .professional-filters label{color:var(--cmp-text)!important;font-size:12px!important;font-weight:800!important}
body.pc-compare-promax .professional-filters select,body.pc-compare-promax .professional-filters input{width:100%!important;min-height:44px!important;margin-top:6px!important;border:1px solid var(--cmp-line)!important;border-radius:11px!important;background:var(--cmp-surface-2)!important;color:var(--cmp-text)!important;font-size:13px!important;outline:none!important;transition:border-color .18s ease,box-shadow .18s ease!important}
body.pc-compare-promax .professional-filters :is(select,input):focus{border-color:#49b996!important;box-shadow:0 0 0 3px rgba(16,185,129,.14)!important}
body.pc-compare-promax .professional-filters button{min-height:42px!important;border-radius:11px!important;cursor:pointer!important;transition:transform .18s ease,background-color .18s ease,border-color .18s ease!important}

body.pc-compare-promax .professional-search-results{min-width:0!important}
body.pc-compare-promax .professional-results-head{display:flex!important;align-items:end!important;justify-content:space-between!important;gap:20px!important;padding:0 0 16px!important;margin-bottom:18px!important;border-bottom:1px solid var(--cmp-line)!important}
body.pc-compare-promax .professional-results-head h2{margin:0!important;color:var(--cmp-text)!important;font-size:clamp(1.8rem,3vw,2.5rem)!important;line-height:1.05!important;letter-spacing:-.045em!important}
body.pc-compare-promax .professional-results-head p,body.pc-compare-promax .professional-results-head span{color:var(--cmp-muted)!important;font-size:13px!important}
body.pc-compare-promax .professional-results-head select{min-height:44px!important;border:1px solid var(--cmp-line)!important;border-radius:11px!important;background:var(--cmp-surface)!important;color:var(--cmp-text)!important}
body.pc-compare-promax .professional-results-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
body.pc-compare-promax .professional-results-grid article{position:relative!important;overflow:hidden!important;border:1px solid var(--cmp-line)!important;border-radius:20px!important;background:var(--cmp-surface)!important;color:var(--cmp-text)!important;box-shadow:0 5px 18px rgba(15,23,42,.04)!important;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease!important}
body.pc-compare-promax .professional-results-grid article img{background:linear-gradient(180deg,#fbfdfc,#edf4f2)!important;object-fit:contain!important;transition:transform .22s ease!important}
body.pc-compare-promax .professional-results-grid article h3{color:var(--cmp-text)!important;font-size:16px!important;line-height:1.28!important;letter-spacing:-.018em!important}
body.pc-compare-promax .professional-results-grid article p,body.pc-compare-promax .professional-results-grid article small{color:var(--cmp-muted)!important}
body.pc-compare-promax .professional-results-grid article strong{color:var(--cmp-brand-deep)!important}
body.pc-compare-promax .professional-results-grid article button,body.pc-compare-promax .professional-results-grid article a{min-height:42px!important;border-radius:11px!important;touch-action:manipulation!important;transition:transform .18s ease,background-color .18s ease,color .18s ease,border-color .18s ease!important}
body.pc-compare-promax .empty-state,body.pc-compare-promax .search-empty{padding:34px!important;border:1px dashed var(--cmp-line)!important;border-radius:20px!important;background:var(--cmp-surface)!important;color:var(--cmp-text)!important;text-align:center!important}

@media(hover:hover) and (pointer:fine){
 body.pc-compare-promax .search-command__box button:hover{transform:translateY(-1px)!important;filter:brightness(1.04)!important;box-shadow:0 8px 20px rgba(16,185,129,.24)!important}
 body.pc-compare-promax .search-command__actions button:hover{background:rgba(255,255,255,.14)!important;transform:translateY(-1px)!important}
 body.pc-compare-promax .professional-results-grid article:hover{transform:translateY(-4px)!important;border-color:#8ecdb8!important;box-shadow:0 18px 38px rgba(15,23,42,.10)!important}
 body.pc-compare-promax .professional-results-grid article:hover img{transform:scale(1.035)!important}
 body.pc-compare-promax .professional-results-grid article :is(button,a):hover{transform:translateY(-1px)!important}
}

html[data-theme="dark"] body.pc-compare-promax{--cmp-bg:#07151d;--cmp-surface:#0e222c;--cmp-surface-2:#122a34;--cmp-text:#f1f7f4;--cmp-muted:#b6c6cd;--cmp-line:#2c4854;--cmp-brand:#70e2b7;--cmp-brand-deep:#70e2b7;background:var(--cmp-bg)!important;color:var(--cmp-text)!important}
html[data-theme="dark"] body.pc-compare-promax .professional-filters,html[data-theme="dark"] body.pc-compare-promax .professional-results-grid article,html[data-theme="dark"] body.pc-compare-promax .empty-state,html[data-theme="dark"] body.pc-compare-promax .search-empty{background:var(--cmp-surface)!important;border-color:var(--cmp-line)!important;color:var(--cmp-text)!important}
html[data-theme="dark"] body.pc-compare-promax .professional-results-grid article img{background:linear-gradient(180deg,#17313b,#10242d)!important}
html[data-theme="dark"] body.pc-compare-promax .professional-filters select,html[data-theme="dark"] body.pc-compare-promax .professional-filters input,html[data-theme="dark"] body.pc-compare-promax .professional-results-head select{background:var(--cmp-surface-2)!important;border-color:var(--cmp-line)!important;color:var(--cmp-text)!important}
html[data-theme="dark"] body.pc-compare-promax .professional-results-grid article strong{color:#78e7bd!important}

@media(max-width:980px){body.pc-compare-promax .professional-search-layout{grid-template-columns:1fr!important}body.pc-compare-promax .professional-filters{position:static!important}body.pc-compare-promax .professional-results-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:640px){
 body.pc-compare-promax .search-command{min-height:330px!important}
 body.pc-compare-promax .search-command>*{width:calc(100% - 28px)!important}
 body.pc-compare-promax .search-command__intro{padding-top:30px!important;align-items:start!important}
 body.pc-compare-promax .search-command h1{font-size:clamp(2.25rem,11vw,3.2rem)!important}
 body.pc-compare-promax .search-command p{font-size:14px!important}
 body.pc-compare-promax .search-command__trust{display:none!important}
 body.pc-compare-promax .search-command__box{margin-bottom:26px!important}
 body.pc-compare-promax .professional-search-layout{width:calc(100% - 28px)!important;margin:22px auto 46px!important;gap:14px!important}
 body.pc-compare-promax .professional-results-head{align-items:start!important;flex-direction:column!important;gap:10px!important}
 body.pc-compare-promax .professional-results-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}
 body.pc-compare-promax .professional-results-grid article{border-radius:15px!important}
 body.pc-compare-promax .professional-results-grid article h3{font-size:14px!important}
}
@media(max-width:420px){body.pc-compare-promax .professional-results-grid{grid-template-columns:1fr!important}}
@media(prefers-reduced-motion:reduce){body.pc-compare-promax *,body.pc-compare-promax *:before,body.pc-compare-promax *:after{transition:none!important;animation:none!important;transform:none!important}}
`;

function installStyles(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=styles;
  document.head.appendChild(style);
}

export function ComparePageProMaxRebuild(){
  const { pathname } = useLocation();
  useEffect(()=>{
    installStyles();
    document.body.classList.toggle(BODY_CLASS, pathname === "/buscar");
    return()=>document.body.classList.remove(BODY_CLASS);
  },[pathname]);
  return null;
}

import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getFirestore,doc,onSnapshot,collection} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

export const app=initializeApp(firebaseConfig);
export const db=getFirestore(app);
export {doc,onSnapshot,collection};

export const defaults={heroTitle:"Upgrade Your Kitchen.\nElevate Your Life.",heroSubtitle:"Helpful buying guides, practical product reviews, and kitchen ideas designed to make everyday decisions easier.",aboutTitle:"Making kitchen research easier.",aboutText:"KitchenZen is a modern editorial-style kitchen website focused on useful buying guides, product comparisons and practical recommendations.",contactEmail:"hello@kitchenzen.com",footerText:"Useful kitchen guides, product ideas and practical recommendations.",topBarText:"KitchenZen — Smart Kitchen Picks and Helpful Buying Guides",theme:"sage",font:"modern",social:{},legal:{privacy:"KitchenZen respects your privacy. This page should describe the data, cookies, analytics, advertising and third-party services actually used on this website.",terms:"KitchenZen content is provided for general informational purposes. Product prices, availability and specifications can change, so verify details with the retailer before purchasing.",affiliate:"KitchenZen may earn a commission from qualifying purchases made through affiliate links. Affiliate relationships do not increase the price you pay.",disclaimer:"Product information and opinions are provided for general informational purposes. Always research a product and confirm current information before buying.",cookies:"If KitchenZen uses cookies or similar technologies, this page should explain what they do, why they are used and how visitors can manage them."}};

export const $=id=>document.getElementById(id);
export const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));

export const SOCIAL_ICONS={
facebook:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>',
instagram:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2c2.7 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.16.55.55.9 1.11 1.16 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.42.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.16 1.77 4.9 4.9 0 0 1-1.77 1.16c-.64.25-1.37.42-2.43.47-1.06.05-1.42.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.16 4.9 4.9 0 0 1-1.16-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.7 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.16-1.77A4.9 4.9 0 0 1 5.46 2.53c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.3 2 12 2zm0 1.8c-2.65 0-2.98.01-4.02.06-.87.04-1.34.18-1.65.3-.42.16-.72.36-1.03.67-.31.31-.51.61-.67 1.03-.12.31-.26.78-.3 1.65-.05 1.04-.06 1.37-.06 4.02s.01 2.98.06 4.02c.04.87.18 1.34.3 1.65.16.42.36.72.67 1.03.31.31.61.51 1.03.67.31.12.78.26 1.65.3 1.04.05 1.37.06 4.02.06s2.98-.01 4.02-.06c.87-.04 1.34-.18 1.65-.3.42-.16.72-.36 1.03-.67.31-.31.51-.61.67-1.03.12-.31.26-.78.3-1.65.05-1.04.06-1.37.06-4.02s-.01-2.98-.06-4.02c-.04-.87-.18-1.34-.3-1.65a2.8 2.8 0 0 0-.67-1.03 2.8 2.8 0 0 0-1.03-.67c-.31-.12-.78-.26-1.65-.3C14.98 3.81 14.65 3.8 12 3.8zm0 3.05a5.15 5.15 0 1 1 0 10.3 5.15 5.15 0 0 1 0-10.3zm0 1.8a3.35 3.35 0 1 0 0 6.7 3.35 3.35 0 0 0 0-6.7zm5.35-2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
youtube:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.6-.46-5.3a2.9 2.9 0 0 0-2-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.54.5a2.9 2.9 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.46 5.3a2.9 2.9 0 0 0 2 2c1.64.5 8.54.5 8.54.5s6.9 0 8.54-.5a2.9 2.9 0 0 0 2-2C23 15.6 23 12 23 12zM9.75 15.5v-7l6 3.5-6 3.5z"/></svg>',
tiktok:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16.6 2h-3.2v13.7a3 3 0 1 1-2.1-2.86V9.5a6.2 6.2 0 1 0 5.3 6.14V8.9a7.9 7.9 0 0 0 4.4 1.34V7a4.7 4.7 0 0 1-4.4-5z"/></svg>',
pinterest:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.65 19.3c-.05-.83-.1-2.1.02-3 .11-.8.73-5.1.73-5.1s-.19-.37-.19-.92c0-.86.5-1.5 1.12-1.5.53 0 .78.4.78.87 0 .53-.34 1.32-.51 2.06-.15.62.31 1.13.92 1.13 1.1 0 1.95-1.16 1.95-2.83 0-1.48-1.06-2.51-2.58-2.51-1.75 0-2.78 1.31-2.78 2.67 0 .53.2 1.09.46 1.4a.19.19 0 0 1 .04.18c-.05.2-.16.62-.18.71-.03.12-.1.14-.22.09-.85-.4-1.38-1.63-1.38-2.63 0-2.15 1.56-4.12 4.51-4.12 2.36 0 4.2 1.68 4.2 3.93 0 2.35-1.48 4.24-3.53 4.24-.69 0-1.34-.36-1.56-.78l-.42 1.62c-.15.59-.57 1.33-.85 1.78A10 10 0 1 0 12 2z"/></svg>',
x:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.2 8.2L23 22h-6.8l-5.3-6.9L4.7 22H1.6l7.7-8.8L1 2h6.9l4.8 6.4L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z"/></svg>'
};

function setVar(el,name,val){if(val)el.style.setProperty(name,val);else el.style.removeProperty(name)}

function applyTopBar(d){
  const bar=document.querySelector(".topbar");
  if(!bar)return;
  setVar(bar,"--topbar-bg",d.topBarBg);
  setVar(bar,"--topbar-color",d.topBarColor);
  setVar(bar,"--topbar-font",d.topBarFont);
  setVar(bar,"--topbar-size",d.topBarFontSize?d.topBarFontSize+"px":"");
  setVar(bar,"--topbar-duration",d.topBarSpeed?d.topBarSpeed+"s":"");
  setVar(bar,"--topbar-play",d.topBarAnimation===false?"paused":"");
}

// Applies siteContent (theme, topbar, footer, legal, social) to whatever of these elements exist on the current page.
// Safe to call on any page — every lookup is optional so pages without a given element are unaffected.
export function applyChrome(s){
  const d={...defaults,...s};
  document.body.dataset.theme=d.theme||"sage";
  document.body.dataset.font=d.font||"modern";
  applyTopBar(d);
  if($("topBarText"))$("topBarText").textContent=d.topBarText||defaults.topBarText;
  if($("topBarTextClone"))$("topBarTextClone").textContent=d.topBarText||defaults.topBarText;
  if($("heroTitle"))$("heroTitle").innerHTML=esc(d.heroTitle).replace(/\n/g,"<br>");
  if($("heroSubtitle"))$("heroSubtitle").textContent=d.heroSubtitle||"";
  if($("aboutTitle"))$("aboutTitle").textContent=d.aboutTitle||"";
  if($("aboutText"))$("aboutText").textContent=d.aboutText||"";
  if($("footerText"))$("footerText").textContent=d.footerText||"";
  if($("contactEmail")){
    const email=d.contactEmail||"";
    $("contactEmail").textContent=email;
    $("contactEmail").href=email?`mailto:${encodeURIComponent(email)}`:"#";
  }
  const ai=$("aboutImage");
  if(ai){
    if(d.aboutImage){ai.src=d.aboutImage;ai.hidden=false;ai.style.objectFit=d.aboutImageFit||"cover";ai.style.width=d.aboutImageSize||"100%"}else ai.hidden=true;
  }
  const social=d.social||{};
  const socialHtml=Object.entries(social).filter(([_,u])=>u).map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer nofollow" aria-label="${esc(n)}">${SOCIAL_ICONS[n]||esc(n)}</a>`).join("");
  if($("socialLinks"))$("socialLinks").innerHTML=socialHtml;
  if($("footerSocial"))$("footerSocial").innerHTML=socialHtml;
  const l=d.legal||{};
  ["privacy","terms","affiliate","disclaimer","cookies"].forEach(k=>{if($(k+"Text"))$(k+"Text").textContent=l[k]||defaults.legal[k]});
  return d;
}

export function showModal(){if($("articleModal")){$("articleModal").classList.add("show");$("articleModal").setAttribute("aria-hidden","false")}}
export function closeModal(){if($("articleModal")){$("articleModal").classList.remove("show");$("articleModal").setAttribute("aria-hidden","true")}}

export function openLegal(key){
  const titles={privacy:"Privacy Policy",terms:"Terms & Conditions",affiliate:"Affiliate Disclosure",disclaimer:"Disclaimer",cookies:"Cookie Policy"};
  const el=$(key+"Text");
  if(!el||!$("modalContent"))return;
  $("modalContent").innerHTML=`<p class="eyebrow">KITCHENZEN INFORMATION</p><h2>${esc(titles[key]||"")}</h2><div class="article-content">${esc(el.textContent||"").replace(/\n/g,"<br>")}</div>`;
  showModal();
}

// Wires up the header hamburger menu, modal close button/backdrop, and footer legal links.
// Call once per page after the shared markup (header/footer/modal) has loaded.
export function initChromeInteractions(){
  if($("closeModal"))$("closeModal").onclick=closeModal;
  if($("articleModal"))$("articleModal").onclick=e=>{if(e.target===$("articleModal"))closeModal()};
  if($("menuButton"))$("menuButton").onclick=()=>$("navigation").classList.toggle("open");
  document.querySelectorAll("#navigation a").forEach(a=>a.onclick=()=>$("navigation")?.classList.remove("open"));
  document.querySelectorAll("footer [data-legal]").forEach(a=>a.onclick=e=>{e.preventDefault();openLegal(a.dataset.legal)});
}

export function productImage(p){
  if(!p.image)return `<div class="product-placeholder">${esc(p.category||"Kitchen")}</div>`;
  return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.closest('.product-image,.review-image,.article-product-image')?.classList.add('img-broken');this.style.display='none'">`;
}

export function productBadges(p){
  return `${p.featured?'<span class="badge">Featured</span>':""}${p.topRated?'<span class="badge top">Top Rated</span>':""}`;
}

// Amazon-style fixed image area: scale (zoom) + position controls set from the Admin Panel, independent of the source image's own dimensions.
export function imageAreaStyle(p){
  const pos=p.imagePosition||"center";
  const posMap={center:"center",top:"center top",bottom:"center bottom",left:"left center",right:"right center"};
  return `--image-scale:${(Number(p.imageScale)||100)/100};--image-pos:${posMap[pos]||"center"}`;
}

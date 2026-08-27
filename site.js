import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getFirestore,doc,onSnapshot,collection} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";

const app=initializeApp(firebaseConfig),db=getFirestore(app);
let products=[],articles=[],categories=[];

const defaults={heroTitle:"Upgrade Your Kitchen.\nElevate Your Life.",heroSubtitle:"Helpful buying guides, practical product reviews, and kitchen ideas designed to make everyday decisions easier.",aboutTitle:"Making kitchen research easier.",aboutText:"KitchenZen is a modern editorial-style kitchen website focused on useful buying guides, product comparisons and practical recommendations.",contactEmail:"hello@kitchenzen.com",footerText:"Useful kitchen guides, product ideas and practical recommendations.",topBarText:"KitchenZen — Smart Kitchen Picks and Helpful Buying Guides",theme:"sage",font:"modern",social:{},legal:{privacy:"KitchenZen respects your privacy. This page should describe the data, cookies, analytics, advertising and third-party services actually used on this website.",terms:"KitchenZen content is provided for general informational purposes. Product prices, availability and specifications can change, so verify details with the retailer before purchasing.",affiliate:"KitchenZen may earn a commission from qualifying purchases made through affiliate links. Affiliate relationships do not increase the price you pay.",disclaimer:"Product information and opinions are provided for general informational purposes. Always research a product and confirm current information before buying.",cookies:"If KitchenZen uses cookies or similar technologies, this page should explain what they do, why they are used and how visitors can manage them."}};

const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));

const SOCIAL_ICONS={
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

function settings(s){
  const d={...defaults,...s};
  document.body.dataset.theme=d.theme||"sage";
  document.body.dataset.font=d.font||"modern";
  applyTopBar(d);
  $("topBarText").textContent=d.topBarText||defaults.topBarText;
  $("topBarTextClone").textContent=d.topBarText||defaults.topBarText;
  $("heroTitle").innerHTML=esc(d.heroTitle).replace(/\n/g,"<br>");
  $("heroSubtitle").textContent=d.heroSubtitle||"";
  $("aboutTitle").textContent=d.aboutTitle||"";
  $("aboutText").textContent=d.aboutText||"";
  $("footerText").textContent=d.footerText||"";
  const email=d.contactEmail||"";
  $("contactEmail").textContent=email;
  $("contactEmail").href=email?`mailto:${encodeURIComponent(email)}`:"#";
  const ai=$("aboutImage");
  if(d.aboutImage){ai.src=d.aboutImage;ai.hidden=false;ai.style.objectFit=d.aboutImageFit||"cover";ai.style.width=d.aboutImageSize||"100%"}else ai.hidden=true;
  const social=d.social||{};
  const socialHtml=Object.entries(social).filter(([_,u])=>u).map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer nofollow" aria-label="${esc(n)}">${SOCIAL_ICONS[n]||esc(n)}</a>`).join("");
  $("socialLinks").innerHTML=socialHtml;
  $("footerSocial").innerHTML=socialHtml;
  const l=d.legal||{};
  ["privacy","terms","affiliate","disclaimer","cookies"].forEach(k=>{if($(k+"Text"))$(k+"Text").textContent=l[k]||defaults.legal[k]});
}

function productImage(p){
  if(!p.image)return `<div class="product-placeholder">${esc(p.category||"Kitchen")}</div>`;
  return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`;
}

function productBadges(p){
  return `${p.featured?'<span class="badge">Featured</span>':""}${p.topRated?'<span class="badge top">Top Rated</span>':""}`;
}

function renderCategories(){
  const visible=categories.filter(c=>c.active!==false).sort((a,b)=>(a.order??999)-(b.order??999));
  $("categoriesGrid").innerHTML=visible.map(c=>`<button class="category" data-category="${esc(c.name||c.label)}"><span class="category-icon">${esc(c.icon||"✦")}</span><strong>${esc(c.name||c.label)}</strong></button>`).join("");
  document.querySelectorAll(".category").forEach(b=>b.onclick=()=>{
    location.hash="products";
    renderProducts(products.filter(p=>p.active!==false&&p.category===b.dataset.category));
    document.querySelector("#products")?.scrollIntoView({behavior:"smooth"});
  });
}

function renderProducts(list=products){
  const visible=list.filter(p=>p.active!==false&&p.published!==false).sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)||(a.order??999)-(b.order??999));
  const size=document.body.dataset.productSize||"medium";
  $("productsGrid").innerHTML=visible.map(p=>{
    const stars="★".repeat(Math.max(0,Math.min(5,Math.round(Number(p.rating)||0))));
    return `<article class="product-card size-${esc(p.cardSize||size)} imgsize-${esc(p.imageSize||size)}"><div class="product-image fit-${esc(p.imageFit||"contain")}" style="--image-scale:${Number(p.imageScale)||100}%">${productBadges(p)}${productImage(p)}</div><div class="product-body"><div class="rating">${stars||"☆"} ${esc(p.rating||"")}${p.reviewCount?` <span>(${esc(p.reviewCount)})</span>`:""}</div><h3>${esc(p.name)}</h3>${p.price?`<div class="price">${esc(p.price)} ${p.previousPrice?`<del>${esc(p.previousPrice)}</del>`:""}</div>`:""}<p>${esc(p.description||p.text||"")}</p><div class="pc-actions"><button class="button secondary" data-view-product="${p.id}">View Review</button>${p.affiliateUrl||p.url?`<a class="button primary" href="${esc(p.affiliateUrl||p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.buttonText||"Check Price")}</a>`:""}</div></div></article>`;
  }).join("");
  $("emptyProducts").hidden=visible.length>0;
  document.querySelectorAll("[data-view-product]").forEach(b=>b.onclick=()=>openProduct(b.dataset.viewProduct));
}

function renderArticles(){
  const visible=articles.filter(a=>a.active!==false&&a.published!==false).sort((a,b)=>(a.order??999)-(b.order??999));
  $("guidesGrid").innerHTML=visible.map(a=>`<article class="guide-card"><div class="guide-image">${a.image?`<img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy">`:`<span>✦</span>`}</div><div class="guide-body"><p class="eyebrow">${esc(a.category||"BUYING GUIDE")}</p><h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p><button class="read-button" data-article="${a.id}">Read Article →</button></div></article>`).join("");
  $("emptyArticles").hidden=visible.length>0;
  document.querySelectorAll("[data-article]").forEach(b=>b.onclick=()=>openArticle(b.dataset.article));
}

async function productHtml(id){
  const p=products.find(x=>x.id===id);
  if(!p)return "";
  const pros=(p.pros||[]).filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>No pros added yet.</li>";
  const cons=(p.cons||[]).filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>No cons added yet.</li>";
  return `<article class="review"><div class="review-image">${productImage(p)}</div><div><p class="eyebrow">${esc(p.category||"PRODUCT REVIEW")}</p><h3>${esc(p.name)}</h3><p>${esc(p.description||"")}</p><div class="rating">★★★★★ ${esc(p.rating||"")}</div>${p.price?`<div class="price">${esc(p.price)}</div>`:""}<div class="proscons"><div><h4>Pros</h4><ul>${pros}</ul></div><div><h4>Cons</h4><ul>${cons}</ul></div></div>${p.affiliateUrl||p.url?`<a class="button primary" href="${esc(p.affiliateUrl||p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.buttonText||"Check Price")}</a>`:""}</div></article>`;
}

async function openProduct(id){
  const p=products.find(x=>x.id===id);
  if(!p)return;
  $("modalContent").innerHTML=`<p class="eyebrow">KITCHENZEN PRODUCT REVIEW</p><h2>${esc(p.name)}</h2>${await productHtml(id)}`;
  showModal();
}

async function openArticle(id){
  const a=articles.find(x=>x.id===id);
  if(!a)return;
  const ids=a.productIds||a.products||[];
  const selected=ids.map(x=>typeof x==="string"?products.find(p=>p.id===x):products.find(p=>p.id===x.id)).filter(Boolean);
  $("modalContent").innerHTML=`<p class="eyebrow">${esc(a.category||"KITCHENZEN BUYING GUIDE")}</p><h2>${esc(a.title)}</h2><p>${esc(a.excerpt||"")}</p><div class="article-content">${esc(a.content||"").replace(/\n/g,"<br>")}</div>${selected.length?`<h3>Recommended Products</h3><div class="article-products">${selected.map(p=>`<div class="article-product"><h4>${esc(p.name)}</h4><p>${esc(p.description||"")}</p><div class="rating">★★★★★ ${esc(p.rating||"")}</div><div class="proscons compact"><div><b>Pros</b><ul>${(p.pros||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div><b>Cons</b><ul>${(p.cons||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div>${p.affiliateUrl||p.url?`<a class="button primary" href="${esc(p.affiliateUrl||p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.buttonText||"Check Price")}</a>`:""}</div>`).join("")}</div>`:""}`;
  showModal();
}

function openLegal(key){
  const titles={privacy:"Privacy Policy",terms:"Terms & Conditions",affiliate:"Affiliate Disclosure",disclaimer:"Disclaimer",cookies:"Cookie Policy"};
  const el=$(key+"Text");
  if(!el)return;
  $("modalContent").innerHTML=`<p class="eyebrow">KITCHENZEN INFORMATION</p><h2>${esc(titles[key]||"")}</h2><div class="article-content">${esc(el.textContent||"").replace(/\n/g,"<br>")}</div>`;
  showModal();
}

function showModal(){$("articleModal").classList.add("show");$("articleModal").setAttribute("aria-hidden","false")}
function closeModal(){$("articleModal").classList.remove("show");$("articleModal").setAttribute("aria-hidden","true")}

$("closeModal").onclick=closeModal;
$("articleModal").onclick=e=>{if(e.target===$("articleModal"))closeModal()};
$("menuButton").onclick=()=>$("navigation").classList.toggle("open");
document.querySelectorAll("#navigation a").forEach(a=>a.onclick=()=>$("navigation").classList.remove("open"));
document.querySelectorAll("footer [data-legal]").forEach(a=>a.onclick=e=>{e.preventDefault();openLegal(a.dataset.legal)});

function initCategoryCarousel(){
  const track=$("categoriesGrid");
  if(!track)return;
  let paused=false,resumeTimer;
  const pause=()=>{paused=true;clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{paused=false},2600)};
  ["pointerdown","touchstart","wheel"].forEach(ev=>track.addEventListener(ev,pause,{passive:true}));
  function step(){
    if(!paused&&track.scrollWidth>track.clientWidth+2){
      track.scrollLeft+=0.6;
      if(track.scrollLeft+track.clientWidth>=track.scrollWidth-1)track.scrollLeft=0;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
initCategoryCarousel();

try{
  onSnapshot(doc(db,"siteContent","main"),s=>settings(s.exists()?s.data():{}),e=>console.error("siteContent:",e));
  onSnapshot(collection(db,"categories"),s=>{categories=s.docs.map(x=>({id:x.id,...x.data()}));renderCategories()},e=>console.error("categories:",e));
  onSnapshot(collection(db,"products"),s=>{products=s.docs.map(x=>({id:x.id,...x.data()}));renderProducts()},e=>{console.error("products:",e);products=[];renderProducts()});
  onSnapshot(collection(db,"articles"),s=>{articles=s.docs.map(x=>({id:x.id,...x.data()}));renderArticles()},e=>{console.error("articles:",e);articles=[];renderArticles()});
}catch(e){console.error(e)}

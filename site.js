import {db,doc,onSnapshot,collection,$,esc,applyChrome,initChromeInteractions,productImage,productBadges,imageAreaStyle} from "./common.js";

let products=[],articles=[],categories=[];

initChromeInteractions();

function renderCategories(){
  const visible=categories.filter(c=>c.active!==false).sort((a,b)=>(a.order??999)-(b.order??999));
  $("categoriesGrid").innerHTML=visible.map(c=>`<button class="category" data-category="${esc(c.name||c.label)}"><span class="category-icon">${esc(c.icon||"✦")}</span><strong>${esc(c.name||c.label)}</strong></button>`).join("");
  document.querySelectorAll(".category").forEach(b=>b.onclick=()=>{
    location.href=`products.html?category=${encodeURIComponent(b.dataset.category)}`;
  });
}

// Homepage shows ONLY the exactly-6 products the Admin Panel has selected (showOnHome === true),
// ordered by their Homepage position. This never includes the rest of the catalog — that lives on products.html.
function renderHomeProducts(){
  const visible=products
    .filter(p=>p.active!==false&&p.published!==false&&p.showOnHome===true)
    .sort((a,b)=>(a.homeOrder??999)-(b.homeOrder??999))
    .slice(0,6);
  const size=document.body.dataset.productSize||"medium";
  $("productsGrid").innerHTML=visible.map(p=>{
    const stars="★".repeat(Math.max(0,Math.min(5,Math.round(Number(p.rating)||0))));
    return `<article class="product-card size-${esc(p.cardSize||size)} imgsize-${esc(p.imageSize||size)}"><div class="product-image fit-${esc(p.imageFit||"contain")}" style="${imageAreaStyle(p)}">${productBadges(p)}${productImage(p)}</div><div class="product-body"><div class="rating">${stars||"☆"} ${esc(p.rating||"")}${p.reviewCount?` <span>(${esc(p.reviewCount)})</span>`:""}</div><h3>${esc(p.name)}</h3>${p.price?`<div class="price">${esc(p.price)} ${p.previousPrice?`<del>${esc(p.previousPrice)}</del>`:""}</div>`:""}<p>${esc(p.description||p.text||"")}</p><div class="pc-actions"><a class="button primary" href="products.html?id=${encodeURIComponent(p.id)}">View Details</a></div></div></article>`;
  }).join("");
  $("emptyProducts").hidden=visible.length>0;
}

function renderArticles(){
  const visible=articles.filter(a=>a.active!==false&&a.published!==false).sort((a,b)=>(a.order??999)-(b.order??999));
  $("guidesGrid").innerHTML=visible.map(a=>`<article class="guide-card"><a class="guide-image" href="article.html?id=${encodeURIComponent(a.id)}">${a.image?`<img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy">`:`<span>✦</span>`}</a><div class="guide-body"><p class="eyebrow">${esc(a.category||"BUYING GUIDE")}</p><h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p><a class="read-button" href="article.html?id=${encodeURIComponent(a.id)}">Read Article →</a></div></article>`).join("");
  $("emptyArticles").hidden=visible.length>0;
}

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
  onSnapshot(doc(db,"siteContent","main"),s=>applyChrome(s.exists()?s.data():{}),e=>console.error("siteContent:",e));
  onSnapshot(collection(db,"categories"),s=>{categories=s.docs.map(x=>({id:x.id,...x.data()}));renderCategories()},e=>console.error("categories:",e));
  onSnapshot(collection(db,"products"),s=>{products=s.docs.map(x=>({id:x.id,...x.data()}));renderHomeProducts()},e=>{console.error("products:",e);products=[];renderHomeProducts()});
  onSnapshot(collection(db,"articles"),s=>{articles=s.docs.map(x=>({id:x.id,...x.data()}));renderArticles()},e=>{console.error("articles:",e);articles=[];renderArticles()});
}catch(e){console.error(e)}

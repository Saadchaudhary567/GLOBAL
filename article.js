import {db,doc,onSnapshot,collection,$,esc,applyChrome,initChromeInteractions,productImage} from "./common.js";
const id=new URLSearchParams(location.search).get("id")||"";
let products=[],allArticles=[],currentArticle=null;
initChromeInteractions();

// Turns a field that might be an array OR a newline-separated string (depending on
// how it was entered in the Admin Panel) into a clean array of lines.
function toList(val){
  if(Array.isArray(val))return val.filter(Boolean);
  if(typeof val==="string")return val.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  return [];
}

function starRating(p){
  const n=Math.max(0,Math.min(5,Math.round(Number(p.rating)||0)));
  return "★".repeat(n)+"☆".repeat(5-n);
}

// Renders the products linked to this article as a full one-by-one buying-guide
// review: each product gets its own numbered section with its own image, pulled
// straight from the existing product data (name/image/description/price/rating/
// affiliate link, plus features/pros/cons/why-recommend when that data exists).
// Sections with no data for a given field are simply omitted — nothing fake is shown.
function renderRecommended(a){
  const ids=a.productIds||a.products||[];
  const selected=ids.map(x=>typeof x==="string"?products.find(p=>p.id===x):products.find(p=>p.id===x.id)).filter(Boolean);
  const wrap=$("articleProducts");
  if(!wrap)return;
  if(!selected.length){wrap.innerHTML="";return}
  injectReviewStyles();

  wrap.innerHTML=`
    <div class="section-title centered"><p class="eyebrow">BUYING GUIDE</p><h2>Our Top Picks, Reviewed</h2></div>
    ${selected.map((p,i)=>{
      const features=toList(p.features);
      const pros=toList(p.pros);
      const cons=toList(p.cons);
      return `
      <div class="product-review">
        <div class="product-review-image">${productImage(p)}</div>
        <div class="product-review-body">
          <p class="eyebrow">PRODUCT #${i+1}</p>
          <h3>${esc(p.name)}</h3>
          <div class="rating">${starRating(p)}${p.reviewCount?` <span>(${esc(p.reviewCount)} reviews)</span>`:""}</div>
          ${p.price?`<div class="price">${esc(p.price)}${p.previousPrice?` <del>${esc(p.previousPrice)}</del>`:""}</div>`:""}
          ${p.description?`<p class="product-review-desc">${esc(p.description)}</p>`:""}
          ${features.length?`<div class="review-block"><h4>Key Features</h4><ul>${features.map(f=>`<li>${esc(f)}</li>`).join("")}</ul></div>`:""}
          ${(pros.length||cons.length)?`<div class="pros-cons">${pros.length?`<div class="pros"><h4>Pros</h4><ul>${pros.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}${cons.length?`<div class="cons"><h4>Cons</h4><ul>${cons.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}</div>`:""}
          ${p.whyRecommend?`<p class="why-recommend"><strong>Why we recommend it:</strong> ${esc(p.whyRecommend)}</p>`:""}
          ${p.affiliateUrl||p.url?`<a class="button primary" href="${esc(p.affiliateUrl||p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.buttonText||"Check Price")}</a>`:""}
        </div>
      </div>`;
    }).join("")}
  `;
}

// Self-contained CSS for the review layout — additive only, scoped to .product-review
// classes, so it cannot affect the Home Page or any other existing styling.
function injectReviewStyles(){
  if(document.getElementById("reviewStyles"))return;
  const style=document.createElement("style");
  style.id="reviewStyles";
  style.textContent=`
    .product-review{display:flex;flex-wrap:wrap;gap:28px;padding:32px 0;border-bottom:1px solid var(--line,rgba(0,0,0,.08))}
    .product-review:last-child{border-bottom:none}
    .product-review-image{flex:0 0 260px;max-width:260px;aspect-ratio:4/3;border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--card-bg,#f7f7f5)}
    .product-review-image img{width:100%;height:100%;object-fit:contain}
    .product-review-body{flex:1 1 320px;min-width:260px}
    .product-review-body h3{margin:2px 0 8px}
    .product-review-desc{margin:10px 0}
    .review-block h4,.pros-cons h4{font-size:.95rem;margin:14px 0 6px}
    .review-block ul{margin:0;padding-left:20px}
    .pros-cons{display:flex;flex-wrap:wrap;gap:24px;margin-top:10px}
    .pros-cons .pros,.pros-cons .cons{flex:1 1 200px}
    .pros-cons ul{margin:0;padding-left:20px}
    .pros h4{color:#2e7d32}
    .cons h4{color:#c62828}
    .why-recommend{margin-top:14px;font-size:.95rem}
    @media (max-width:640px){.product-review{flex-direction:column}.product-review-image{max-width:100%}}
  `;
  document.head.appendChild(style);
}

function renderRelated(a){
  const related=allArticles.filter(x=>x.id!==a.id&&x.active!==false&&x.published!==false&&x.category===a.category).slice(0,3);
  if(!related.length){$("relatedWrap").hidden=true;return}
  $("relatedWrap").hidden=false;
  $("relatedGrid").innerHTML=related.map(r=>`<article class="guide-card"><a class="guide-image" href="article.html?id=${encodeURIComponent(r.id)}">${r.image?`<img src="${esc(r.image)}" alt="${esc(r.title)}" loading="lazy">`:`<span>✦</span>`}</a><div class="guide-body"><p class="eyebrow">${esc(r.category||"BUYING GUIDE")}</p><h3>${esc(r.title)}</h3><a class="read-button" href="article.html?id=${encodeURIComponent(r.id)}">Read Article →</a></div></article>`).join("");
}

function renderArticle(a){
  currentArticle=a;
  if(!a||a.active===false||a.published===false){
    $("articleRoot").hidden=true;$("notFound").hidden=false;return;
  }
  $("articleRoot").hidden=false;$("notFound").hidden=true;
  document.title=(a.title||"Article")+" | KitchenZen";
  $("pageTitle").textContent=document.title;
  $("articleCategory").textContent=(a.category||"BUYING GUIDE").toUpperCase();
  $("articleTitle").textContent=a.title||"";
  $("articleMeta").textContent=a.excerpt?"":"";
  $("articleExcerpt").innerHTML=a.excerpt?`<p style="font-size:1.15rem;color:var(--muted);margin:0 0 20px">${esc(a.excerpt)}</p>`:"";
  const img=$("articleImage");
  if(a.image){img.src=a.image;img.alt=a.title||"";img.hidden=false}else img.hidden=true;
  $("articleContent").innerHTML=esc(a.content||"").replace(/\n/g,"<br>");
  renderRecommended(a);
  renderRelated(a);
}

if(!id){
  $("articleRoot").hidden=true;$("notFound").hidden=false;
}else{
  try{
    onSnapshot(doc(db,"siteContent","main"),s=>applyChrome(s.exists()?s.data():{}),e=>console.error("siteContent:",e));
    onSnapshot(collection(db,"products"),s=>{products=s.docs.map(x=>({id:x.id,...x.data()}));if(currentArticle)renderRecommended(currentArticle)},e=>console.error("products:",e));
    onSnapshot(collection(db,"articles"),s=>{
      allArticles=s.docs.map(x=>({id:x.id,...x.data()}));
      const a=allArticles.find(x=>x.id===id);
      renderArticle(a);
    },e=>{console.error("articles:",e);$("articleRoot").hidden=true;$("notFound").hidden=false});
  }catch(e){console.error(e)}
}

import {db,doc,onSnapshot,collection,$,esc,applyChrome,initChromeInteractions,productImage} from "./common.js";

const id=new URLSearchParams(location.search).get("id")||"";
let products=[],allArticles=[],currentArticle=null;

initChromeInteractions();

function renderRecommended(a){
  const ids=a.productIds||a.products||[];
  const selected=ids.map(x=>typeof x==="string"?products.find(p=>p.id===x):products.find(p=>p.id===x.id)).filter(Boolean);
  if(!selected.length){$("articleProducts").innerHTML="";return}
  $("articleProducts").innerHTML=`<h3>Recommended Products</h3><div class="article-products" style="display:grid;grid-template-columns:repeat(2,1fr);gap:14px">${selected.map(p=>`<div class="article-product" style="border:1px solid var(--line);border-radius:12px;padding:16px"><h4>${esc(p.name)}</h4><p>${esc(p.description||"")}</p><div class="rating">★★★★★ ${esc(p.rating||"")}</div>${p.price?`<div class="price">${esc(p.price)}</div>`:""}${p.affiliateUrl||p.url?`<a class="button primary" href="${esc(p.affiliateUrl||p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.buttonText||"Check Price")}</a>`:""}</div>`).join("")}</div>`;
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

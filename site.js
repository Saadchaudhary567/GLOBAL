import {db,doc,onSnapshot,collection,$,esc,applyChrome,initChromeInteractions,productImage,productBadges,imageAreaStyle} from "./common.js";

let products=[],articles=[],categories=[];

initChromeInteractions();
injectPairStyles();
renderSkeletons();

function renderCategories(){
  const visible=categories.filter(c=>c.active!==false).sort((a,b)=>(a.order??999)-(b.order??999));
  $("categoriesGrid").innerHTML=visible.map(c=>`<button class="category" data-category="${esc(c.name||c.label)}"><span class="category-icon">${esc(c.icon||"✦")}</span><strong>${esc(c.name||c.label)}</strong></button>`).join("");
  document.querySelectorAll(".category").forEach(b=>b.onclick=()=>{
    location.href=`products.html?category=${encodeURIComponent(b.dataset.category)}`;
  });
}

function productBlock(p,size){
  const stars="★".repeat(Math.max(0,Math.min(5,Math.round(Number(p.rating)||0))));
  const desc=p.description||p.shortDescription||"";
  return `<article class="product-card size-${esc(p.cardSize||size)} imgsize-${esc(p.imageSize||size)} pair-product"><div class="product-image fit-${esc(p.imageFit||"contain")}" style="${imageAreaStyle(p)}">${productBadges(p)}${productImage(p)}</div><div class="product-body"><div class="rating">${stars||"☆"} ${esc(p.rating||"")}${p.reviewCount?` <span>(${esc(p.reviewCount)})</span>`:""}</div><h3>${esc(p.name)}</h3>${p.price?`<div class="price">${esc(p.price)} ${p.previousPrice?`<del>${esc(p.previousPrice)}</del>`:""}</div>`:""}${desc?`<p class="pair-product-desc">${esc(desc)}</p>`:""}<div class="pc-actions"><a class="button primary" href="products.html?id=${encodeURIComponent(p.id)}">View Details</a></div></div></article>`;
}

function articleBlock(a){
  return `<article class="guide-card pair-article"><a class="guide-image" href="article.html?id=${encodeURIComponent(a.id)}">${a.image?`<img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy">`:`<span>✦</span>`}</a><div class="guide-body"><p class="eyebrow">${esc(a.category||"BUYING GUIDE")}</p><h3>${esc(a.title)}</h3><p>${esc(a.excerpt||"")}</p><a class="read-button" href="article.html?id=${encodeURIComponent(a.id)}">Read Article →</a></div></article>`;
}

// Renders the homepage as: Product 1 -> its matching Article -> Product 2 -> its matching Article ...
// instead of two separate "all products" / "all articles" blocks.
// Matching: same category first (case-insensitive), otherwise the next unused article in order.
// Any articles left over (no product matched them) are still shown, grouped in "More Buying Guides"
// below, so nothing published ever disappears from the homepage.
function renderProductArticleFeed(){
  const visibleProducts=products
    .filter(p=>p.active!==false&&p.published!==false&&p.showOnHome===true)
    .sort((a,b)=>(a.homeOrder??999)-(b.homeOrder??999))
    .slice(0,6);
  const visibleArticles=articles
    .filter(a=>a.active!==false&&a.published!==false)
    .sort((a,b)=>(a.order??999)-(b.order??999));

  const size=document.body.dataset.productSize||"medium";
  const usedArticleIds=new Set();

  function findArticleFor(product){
    let match=visibleArticles.find(a=>!usedArticleIds.has(a.id)&&product.category&&a.category&&String(a.category).toLowerCase()===String(product.category).toLowerCase());
    if(!match)match=visibleArticles.find(a=>!usedArticleIds.has(a.id));
    if(match)usedArticleIds.add(match.id);
    return match||null;
  }

  const feedHtml=visibleProducts.map(p=>{
    const article=findArticleFor(p);
    return `<div class="product-article-pair">${productBlock(p,size)}${article?articleBlock(article):""}</div>`;
  }).join("");

  if($("productArticleFeed"))$("productArticleFeed").innerHTML=feedHtml;
  if($("emptyFeed"))$("emptyFeed").hidden=visibleProducts.length>0;

  const leftover=visibleArticles.filter(a=>!usedArticleIds.has(a.id));
  const wrap=$("moreGuidesWrap");
  if(wrap){
    wrap.hidden=leftover.length===0;
    if($("guidesGrid"))$("guidesGrid").innerHTML=leftover.map(articleBlock).join("");
  }
}

// Lightweight CSS, injected once, that lays the pairs out cleanly and keeps
// article thumbnails from stretching/distorting — additive only, does not
// touch the existing product image sizing rules already controlled from
// the Admin Panel (imageFit / imageScale / imagePosition).
function injectPairStyles(){
  if(document.getElementById("pairStyles"))return;
  const style=document.createElement("style");
  style.id="pairStyles";
  style.textContent=`
    .product-article-pair{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start;margin-bottom:40px;padding-bottom:32px;border-bottom:1px solid rgba(0,0,0,.08)}
    .product-article-pair:last-child{border-bottom:none;margin-bottom:0}
    .product-article-pair>.pair-product,.product-article-pair>.pair-article{flex:1 1 320px;min-width:260px}
    .pair-article .guide-image{aspect-ratio:16/10;overflow:hidden;display:block}
    .pair-article .guide-image img{width:100%;height:100%;object-fit:cover;display:block}
    @media (max-width:700px){.product-article-pair{flex-direction:column}}
  `;
  document.head.appendChild(style);
}

// Shows lightweight pulsing placeholder cards the instant the page loads,
// so visitors see something immediately instead of blank sections while
// Firestore data streams in. Real content overwrites these automatically
// as soon as each onSnapshot listener below fires.
function renderSkeletons(){
  if(!document.getElementById("skeletonStyles")){
    const style=document.createElement("style");
    style.id="skeletonStyles";
    style.textContent=`
      .skel{background:linear-gradient(90deg,#eee 25%,#f5f5f5 37%,#eee 63%);background-size:400% 100%;animation:skel-pulse 1.4s ease infinite;border-radius:10px}
      @keyframes skel-pulse{0%{background-position:100% 50%}100%{background-position:0 50%}}
      .skel-category{height:90px;width:120px;flex:none;display:inline-block;margin-right:12px}
      .skel-card{height:280px}
      .skel-pair{display:flex;gap:24px;margin-bottom:24px}
      .skel-pair .skel{flex:1 1 320px}
    `;
    document.head.appendChild(style);
  }
  const catGrid=$("categoriesGrid");
  if(catGrid&&!catGrid.innerHTML.trim())catGrid.innerHTML=Array(6).fill('<div class="skel skel-category"></div>').join("");
  const feed=$("productArticleFeed");
  if(feed&&!feed.innerHTML.trim())feed.innerHTML=Array(3).fill('<div class="skel-pair"><div class="skel skel-card"></div><div class="skel skel-card"></div></div>').join("");
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
  onSnapshot(collection(db,"products"),s=>{products=s.docs.map(x=>({id:x.id,...x.data()}));renderProductArticleFeed()},e=>{console.error("products:",e);products=[];renderProductArticleFeed()});
  onSnapshot(collection(db,"articles"),s=>{articles=s.docs.map(x=>({id:x.id,...x.data()}));renderProductArticleFeed()},e=>{console.error("articles:",e);articles=[];renderProductArticleFeed()});
}catch(e){console.error(e)}

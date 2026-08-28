import {db,doc,onSnapshot,collection,$,esc,applyChrome,initChromeInteractions,showModal,productImage,productBadges,imageAreaStyle} from "./common.js";

let products=[],categories=[];
let activeCategory=new URLSearchParams(location.search).get("category")||"";
const openIdOnLoad=new URLSearchParams(location.search).get("id")||"";

initChromeInteractions();

function renderFilterBar(){
  const cats=categories.filter(c=>c.active!==false).sort((a,b)=>(a.order??999)-(b.order??999));
  const chips=[{name:""},...cats.map(c=>({name:c.name||c.label}))];
  $("filterBar").innerHTML=chips.map(c=>`<button data-cat="${esc(c.name)}" class="${activeCategory===c.name?"active":""}">${c.name?esc(c.name):"All Products"}</button>`).join("");
  document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{activeCategory=b.dataset.cat;renderFilterBar();renderGrid()});
}

function renderGrid(){
  const visible=products
    .filter(p=>p.active!==false&&p.published!==false)
    .filter(p=>!activeCategory||p.category===activeCategory)
    .sort((a,b)=>(b.featured?1:0)-(a.featured?1:0)||(a.order??999)-(b.order??999));
  const size=document.body.dataset.productSize||"medium";
  $("allProductsGrid").innerHTML=visible.map(p=>{
    const stars="★".repeat(Math.max(0,Math.min(5,Math.round(Number(p.rating)||0))));
    return `<article class="product-card size-${esc(p.cardSize||size)} imgsize-${esc(p.imageSize||size)}"><div class="product-image fit-${esc(p.imageFit||"contain")}" style="${imageAreaStyle(p)}">${productBadges(p)}${productImage(p)}</div><div class="product-body"><div class="rating">${stars||"☆"} ${esc(p.rating||"")}${p.reviewCount?` <span>(${esc(p.reviewCount)})</span>`:""}</div><h3>${esc(p.name)}</h3>${p.price?`<div class="price">${esc(p.price)} ${p.previousPrice?`<del>${esc(p.previousPrice)}</del>`:""}</div>`:""}<div class="pc-actions"><button class="button secondary" data-view-product="${p.id}">View Details</button>${p.affiliateUrl||p.url?`<a class="button primary" href="${esc(p.affiliateUrl||p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.buttonText||"Check Price")}</a>`:""}</div></div></article>`;
  }).join("");
  $("emptyProducts").hidden=visible.length>0;
  document.querySelectorAll("[data-view-product]").forEach(b=>b.onclick=()=>openProduct(b.dataset.viewProduct));
}

// Product detail view — description, rating and price only. Pros & Cons are not shown anywhere on the site.
function productHtml(p){
  return `<article class="review"><div class="review-image">${productImage(p)}</div><div><p class="eyebrow">${esc(p.category||"PRODUCT DETAILS")}</p><h3>${esc(p.name)}</h3><p>${esc(p.description||"")}</p><div class="rating">★★★★★ ${esc(p.rating||"")}</div>${p.price?`<div class="price">${esc(p.price)}</div>`:""}${p.affiliateUrl||p.url?`<a class="button primary" href="${esc(p.affiliateUrl||p.url)}" target="_blank" rel="nofollow sponsored noopener">${esc(p.buttonText||"Check Price")}</a>`:""}</div></article>`;
}

function openProduct(id){
  const p=products.find(x=>x.id===id);
  if(!p)return;
  $("modalContent").innerHTML=`<p class="eyebrow">KITCHENZEN PRODUCT DETAILS</p><h2>${esc(p.name)}</h2>${productHtml(p)}`;
  showModal();
  history.replaceState(null,"","products.html?id="+encodeURIComponent(id));
}

try{
  onSnapshot(doc(db,"siteContent","main"),s=>applyChrome(s.exists()?s.data():{}),e=>console.error("siteContent:",e));
  onSnapshot(collection(db,"categories"),s=>{categories=s.docs.map(x=>({id:x.id,...x.data()}));renderFilterBar()},e=>console.error("categories:",e));
  onSnapshot(collection(db,"products"),s=>{
    products=s.docs.map(x=>({id:x.id,...x.data()}));
    renderGrid();
    if(openIdOnLoad){openProduct(openIdOnLoad);}
  },e=>{console.error("products:",e);products=[];renderGrid()});
}catch(e){console.error(e)}

import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut,EmailAuthProvider,reauthenticateWithCredential,updatePassword} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,updateDoc,collection,onSnapshot,addDoc,deleteDoc} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL,listAll,deleteObject} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import {firebaseConfig} from "./firebase-config.js";
import {createEditor,plainToHtml} from "./richtext.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
let content={},products=[],articles=[],categories=[],started=false;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));

const ICON_PRESETS=["✦","♨","♜","⚔","▱","☕","▣","◉"];
const HOME_LIMIT=12; // max products per homepage section
// Which homepage section a product belongs to: "top", "decor" or "" (none). Older products that only had showOnHome=true count as "top".
const curSection=p=>p.homeSection||(p.showOnHome===true?"top":"");
let articleEditor=null;

function showTab(n){document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("tab-"+n).classList.add("active")}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

$("loginForm").onsubmit=async e=>{
  e.preventDefault();
  try{$("loginMsg").textContent="Logging in…";await signInWithEmailAndPassword(auth,$("username").value.trim(),$("password").value)}
  catch(err){$("loginMsg").textContent=err.message}
};
$("logout").onclick=()=>signOut(auth);

onAuthStateChanged(auth,async u=>{
  if(!u){$("loginView").hidden=false;$("adminView").hidden=true;return}
  try{
    const a=await getDoc(doc(db,"admins",u.uid));
    if(!a.exists())throw new Error("This account is not an admin.");
    $("loginView").hidden=true;$("adminView").hidden=false;
    if(!started){started=true;start()}
  }catch(e){await signOut(auth);$("loginMsg").textContent=e.message}
});

function start(){
  onSnapshot(doc(db,"siteContent","main"),s=>{content=s.data()||{};fillAll()});
  onSnapshot(collection(db,"categories"),s=>{categories=s.docs.map(x=>({id:x.id,...x.data()}));$("categoryCount").textContent=categories.length;renderCategories()});
  onSnapshot(collection(db,"products"),s=>{products=s.docs.map(x=>({id:x.id,...x.data()}));$("productCount").textContent=products.length;renderProducts()});
  onSnapshot(collection(db,"articles"),s=>{articles=s.docs.map(x=>({id:x.id,...x.data()}));$("articleCount").textContent=articles.length;renderArticles()});
  loadGallery();
}

function fillAll(){
  const c=content;
  $('topBarInput').value=c.topBarText||"KitchenZen — Smart Kitchen Picks and Helpful Buying Guides";
  $('heroTitleInput').value=c.heroTitle||"";
  $('heroSubtitleInput').value=c.heroSubtitle||"";
  $('topBarBg').value=c.topBarBg||"#163c21";
  $('topBarColor').value=c.topBarColor||"#ffffff";
  $('topBarFont').value=c.topBarFont||"";
  $('topBarFontSize').value=c.topBarFontSize||13;
  $('topBarSpeed').value=c.topBarSpeed||28;
  $('topBarAnimation').checked=c.topBarAnimation!==false;
  $('homeTopEyebrow').value=c.homeTopEyebrow||"EDITOR'S SELECTION";
  $('homeTopTitle').value=c.homeTopTitle||"Top Rated Products";
  $('homeArticlesBeforeDecor').value=c.homeArticlesBeforeDecor??4;
  $('homeDecorEyebrow').value=c.homeDecorEyebrow||"HOME & DECOR";
  $('homeDecorTitle').value=c.homeDecorTitle||"Home Decor Picks";
  $('homeMoreTitle').value=c.homeMoreTitle||"More Buying Guides";
  $('aboutTitleInput').value=c.aboutTitle||"";
  $('aboutTextInput').value=c.aboutText||"";
  $('aboutImageInput').value=c.aboutImage||"";
  if(c.aboutImage){$('aboutImagePreview').src=c.aboutImage;$('aboutImagePreview').hidden=false;$('aboutImageRemove').hidden=false}
  $('aboutImageSize').value=c.aboutImageSize||"100%";
  $('aboutImageFit').value=c.aboutImageFit||"cover";
  $('contactEmailInput').value=c.contactEmail||"";
  const s=c.social||{};
  ["facebook","instagram","youtube","tiktok","pinterest"].forEach(k=>$(k+"Input").value=s[k]||"");
  $('xInput').value=s.x||"";
  $('footerTextInput').value=c.footerText||"";
  const l=c.legal||{};
  $('privacyInput').value=l.privacy||"";
  $('termsInput').value=l.terms||"";
  $('affiliateInput').value=l.affiliate||"";
  $('disclaimerInput').value=l.disclaimer||"";
  $('cookieInput').value=l.cookies||"";
  $('fontSelect').value=c.font||"inter";
  $('productImageSize').value=c.productImageSize||"medium";
  $('productCardSize').value=c.productCardSize||"medium";
  $('productImageFit').value=c.productImageFit||"contain";
}

async function saveMain(p,msg="Saved."){
  try{await setDoc(doc(db,"siteContent","main"),p,{merge:true});alert(msg)}
  catch(e){alert(e.message)}
}

async function uploadTo(folder,file){
  const clean=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
  const r=ref(storage,folder+"/"+Date.now()+"-"+clean);
  await uploadBytes(r,file);
  return await getDownloadURL(r);
}

$("homeForm").onsubmit=e=>{
  e.preventDefault();
  saveMain({topBarText:$('topBarInput').value,heroTitle:$('heroTitleInput').value,heroSubtitle:$('heroSubtitleInput').value},"Home saved.");
};

$("homeLayoutForm").onsubmit=e=>{
  e.preventDefault();
  const n=Math.max(0,Math.min(12,parseInt($('homeArticlesBeforeDecor').value,10)));
  saveMain({
    homeTopEyebrow:$('homeTopEyebrow').value.trim(),
    homeTopTitle:$('homeTopTitle').value.trim(),
    homeArticlesBeforeDecor:Number.isFinite(n)?n:4,
    homeDecorEyebrow:$('homeDecorEyebrow').value.trim(),
    homeDecorTitle:$('homeDecorTitle').value.trim(),
    homeMoreTitle:$('homeMoreTitle').value.trim()
  },"Homepage layout saved.");
};

$("saveTopBar").onclick=()=>{
  saveMain({
    topBarBg:$('topBarBg').value,
    topBarColor:$('topBarColor').value,
    topBarFont:$('topBarFont').value,
    topBarFontSize:Number($('topBarFontSize').value)||13,
    topBarSpeed:Number($('topBarSpeed').value)||28,
    topBarAnimation:$('topBarAnimation').checked
  },"Top bar style saved.");
};

$('aboutImageFile').onchange=async()=>{
  const f=$('aboutImageFile').files[0];
  if(!f)return;
  try{
    const url=await uploadTo("images/about",f);
    $('aboutImageInput').value=url;
    $('aboutImagePreview').src=url;
    $('aboutImagePreview').hidden=false;
    $('aboutImageRemove').hidden=false;
    $('aboutImageFile').value="";
    loadGallery();
  }catch(e){alert(e.message)}
};
$('aboutImageRemove').onclick=()=>{
  $('aboutImageInput').value="";
  $('aboutImagePreview').hidden=true;
  $('aboutImagePreview').src="";
  $('aboutImageRemove').hidden=true;
};

$("aboutForm").onsubmit=e=>{
  e.preventDefault();
  saveMain({
    aboutTitle:$('aboutTitleInput').value,
    aboutText:$('aboutTextInput').value,
    aboutImage:$('aboutImageInput').value,
    aboutImageSize:$('aboutImageSize').value,
    aboutImageFit:$('aboutImageFit').value,
    contactEmail:$('contactEmailInput').value,
    social:{facebook:$('facebookInput').value,instagram:$('instagramInput').value,youtube:$('youtubeInput').value,tiktok:$('tiktokInput').value,pinterest:$('pinterestInput').value,x:$('xInput').value}
  },"Information saved.");
};

$("footerForm").onsubmit=e=>{
  e.preventDefault();
  saveMain({
    footerText:$('footerTextInput').value,
    legal:{privacy:$('privacyInput').value,terms:$('termsInput').value,affiliate:$('affiliateInput').value,disclaimer:$('disclaimerInput').value,cookies:$('cookieInput').value}
  },"Footer and legal pages saved.");
};

let selectedTheme=content.theme||"sage";
document.querySelectorAll("[data-theme-choice]").forEach(b=>b.onclick=()=>{
  selectedTheme=b.dataset.themeChoice;
  document.querySelectorAll("[data-theme-choice]").forEach(x=>x.classList.remove("selected"));
  b.classList.add("selected");
});
$("saveAppearance").onclick=()=>saveMain({
  theme:selectedTheme||content.theme||"sage",
  font:$('fontSelect').value,
  productImageSize:$('productImageSize').value,
  productCardSize:$('productCardSize').value,
  productImageFit:$('productImageFit').value
},"Appearance saved.");

function categoryForm(c={active:true}){
  return `<h3>${c.id?"Edit":"Add"} Category</h3>
  <label>Name<input id="cname" value="${esc(c.name||c.label||"")}" required></label>
  <label>Icon / Symbol<input id="cicon" value="${esc(c.icon||"✦")}"></label>
  <div class="icon-presets">${ICON_PRESETS.map(ic=>`<button type="button" class="icon-pick" data-icon="${ic}">${ic}</button>`).join("")}</div>
  <label><input id="cactive" type="checkbox" ${c.active!==false?"checked":""}> Show on website</label>
  <button type="button" id="saveCategory">Save Category</button>`;
}

$("newCategory").onclick=()=>{$("categoryEditor").hidden=false;$('categoryEditor').innerHTML=categoryForm();bindCategory()};

function bindCategory(id){
  document.querySelectorAll(".icon-pick").forEach(b=>b.onclick=()=>{$('cicon').value=b.dataset.icon});
  $('saveCategory').onclick=async e=>{
    e.preventDefault();
    const d={name:$('cname').value.trim(),icon:$('cicon').value.trim()||'✦',active:$('cactive').checked};
    if(!d.name)return alert("Category name is required.");
    const btn=$('saveCategory');
    btn.disabled=true;btn.textContent='Saving…';
    try{
      if(id){await updateDoc(doc(db,"categories",id),d)}
      else{await addDoc(collection(db,"categories"),d)}
      $('categoryEditor').hidden=true;
    }catch(err){
      console.error(err);
      alert(err.code==='permission-denied'?"Missing or insufficient permissions. Make sure your deployed Firestore rules allow the signed-in admin to write to categories.":err.message);
      btn.disabled=false;btn.textContent='Save Category';
    }
  };
}

function renderCategories(){
  $('categoryList').innerHTML=[...categories].sort((a,b)=>(a.order??999)-(b.order??999)).map(c=>`<div class="list-item"><div class="thumb">${c.image?`<img src="${esc(c.image)}">`:esc(c.icon||"✦")}</div><div class="info"><h3>${esc(c.name||c.label)}</h3><p>${c.active===false?"Hidden":"Visible"}</p></div><button onclick="editCategory('${c.id}')">Edit</button><button class="danger" onclick="removeCategory('${c.id}')">Delete</button></div>`).join("");
}
window.editCategory=id=>{const c=categories.find(x=>x.id===id);$('categoryEditor').hidden=false;$('categoryEditor').innerHTML=categoryForm(c);bindCategory(id)};
window.removeCategory=async id=>{if(confirm("Delete this category? Products assigned to it will remain; they can be reassigned later."))await deleteDoc(doc(db,"categories",id))};

function productForm(p={active:true}){
  return `<h3>${p.id?"Edit":"Add"} Product</h3>
  <div class="form-grid">
  <label>Name<input id="pname" value="${esc(p.name)}" required></label>
  <label>Category<select id="pcat">${categories.map(c=>`<option value="${esc(c.name||c.label)}" ${p.category===(c.name||c.label)?"selected":""}>${esc(c.name||c.label)}</option>`).join("")}</select></label>
  <label>Description<textarea id="pdesc">${esc(p.description||p.text||"")}</textarea></label>
  <label>Price<input id="pprice" value="${esc(p.price||"")}"></label>
  <label>Previous Price<input id="pprevious" value="${esc(p.previousPrice||"")}"></label>
  <label>Rating<input id="prating" type="number" min="0" max="5" step="0.1" value="${esc(p.rating||"")}"></label>
  <label>Review Count<input id="pcount" value="${esc(p.reviewCount||"")}"></label>
  <label>Affiliate URL<input id="purl" value="${esc(p.affiliateUrl||p.url||"")}"></label>
  <label>Button Text<input id="pbutton" value="${esc(p.buttonText||"Check Price")}"></label>
  <label>Image Size<select id="pimagesize"><option value="small" ${p.imageSize==="small"?"selected":""}>Small</option><option value="medium" ${!p.imageSize||p.imageSize==="medium"?"selected":""}>Medium</option><option value="large" ${p.imageSize==="large"?"selected":""}>Large</option></select></label>
  <label>Card Size<select id="pcardsize"><option value="small" ${p.cardSize==="small"?"selected":""}>Small</option><option value="medium" ${!p.cardSize||p.cardSize==="medium"?"selected":""}>Medium</option><option value="large" ${p.cardSize==="large"?"selected":""}>Large</option></select></label>
  <label>Image Fit<select id="pfit"><option value="contain" ${p.imageFit!=="cover"?"selected":""}>Contain (show whole product, recommended)</option><option value="cover" ${p.imageFit==="cover"?"selected":""}>Cover (fills area, may crop)</option></select></label>
  <label>Image Zoom / Scale (%)<input id="pimagescale" type="range" min="60" max="150" value="${Number(p.imageScale)||100}"></label>
  <label>Image Position<select id="pimageposition"><option value="center" ${(!p.imagePosition||p.imagePosition==="center")?"selected":""}>Center</option><option value="top" ${p.imagePosition==="top"?"selected":""}>Top</option><option value="bottom" ${p.imagePosition==="bottom"?"selected":""}>Bottom</option><option value="left" ${p.imagePosition==="left"?"selected":""}>Left</option><option value="right" ${p.imagePosition==="right"?"selected":""}>Right</option></select></label>
  <label>Order (position on All Products page)<input id="porder" type="number" value="${Number(p.order)||0}"></label>
  </div>
  <label>Product Image URL
  <div class="image-field"><input id="pimage" placeholder="https://..." value="${esc(p.image||"")}"><img id="pimagePreview" class="image-preview" src="${esc(p.image||"")}" ${p.image?"":"hidden"}><button type="button" id="pimageRemove" ${p.image?"":"hidden"}>Remove Image URL</button></div>
  <p class="hint">Paste any image URL (including an Amazon product image URL where technically accessible). It fits automatically inside the fixed, Amazon-style image area — no upload needed.</p>
  </label>
  <label><input id="pactive" type="checkbox" ${p.active!==false?"checked":""}> Show / Publish Product</label>
  <label><input id="ptop" type="checkbox" ${p.topRated?"checked":""}> Mark as Top-Rated</label>
  <label><input id="pfeatured" type="checkbox" ${p.featured?"checked":""}> Mark as Featured</label>
  <label>Homepage Placement<select id="phomesection"><option value="" ${curSection(p)===""?"selected":""}>Not on homepage</option><option value="top" ${curSection(p)==="top"?"selected":""}>Top section (kitchen appliances / top picks)</option><option value="decor" ${curSection(p)==="decor"?"selected":""}>Home Decor section (below the first articles)</option></select></label>
  <p class="hint">You can also manage all homepage placements together from the <b>Homepage Products</b> tab.</p>
  <br><button id="saveProduct">Save Product</button>`;
}

function bindProduct(id){
  $('pimage').oninput=()=>{
    const url=$('pimage').value.trim();
    if(url){$('pimagePreview').src=url;$('pimagePreview').hidden=false;$('pimageRemove').hidden=false}
    else{$('pimagePreview').hidden=true;$('pimagePreview').src="";$('pimageRemove').hidden=true}
  };
  $('pimageRemove').onclick=()=>{
    $('pimage').value="";
    $('pimagePreview').hidden=true;
    $('pimagePreview').src="";
    $('pimageRemove').hidden=true;
  };

  $('saveProduct').onclick=async()=>{
    const d={
      name:$('pname').value.trim(),
      description:$('pdesc').value,
      category:$('pcat').value,
      image:$('pimage').value.trim(),
      price:$('pprice').value,
      previousPrice:$('pprevious').value,
      rating:Number($('prating').value)||0,
      reviewCount:$('pcount').value,
      affiliateUrl:$('purl').value.trim(),
      buttonText:$('pbutton').value.trim()||"Check Price",
      imageSize:$('pimagesize').value,
      cardSize:$('pcardsize').value,
      imageFit:$('pfit').value,
      imageScale:Number($('pimagescale').value)||100,
      imagePosition:$('pimageposition').value,
      order:Number($('porder').value)||0,
      active:$('pactive').checked,
      published:$('pactive').checked,
      topRated:$('ptop').checked,
      featured:$('pfeatured').checked
    };
    if(!d.name)return alert("Product name is required.");
    const section=$('phomesection').value;
    const sameSectionCount=products.filter(x=>x.id!==id&&curSection(x)===section).length;
    if(section&&sameSectionCount>=HOME_LIMIT){
      alert(`This homepage section already has ${HOME_LIMIT} products. Remove one first (here or in the Homepage Products tab) before adding another.`);
      return;
    }
    d.showOnHome=!!section;
    d.homeSection=section||null;
    if(section){
      const existing=id?products.find(x=>x.id===id):null;
      d.homeOrder=(existing&&curSection(existing)===section&&Number(existing.homeOrder))||(sameSectionCount+1);
    }else{
      d.homeOrder=null;
    }
    try{
      id?await setDoc(doc(db,"products",id),d,{merge:true}):await addDoc(collection(db,"products"),d);
      $('productEditor').hidden=true;
    }catch(e){alert(e.message)}
  };
}

$('newProduct').onclick=()=>{
  if(!categories.length)return alert("Add at least one category first.");
  $('productEditor').hidden=false;$('productEditor').innerHTML=productForm();bindProduct();
};

function renderProducts(){
  $('productList').innerHTML=[...products].sort((a,b)=>(a.order??999)-(b.order??999)).map(p=>`<div class="list-item"><div class="thumb">${p.image?`<img src="${esc(p.image)}">`:"✦"}</div><div class="info"><h3>${esc(p.name)}</h3><p>${esc(p.category||"Uncategorized")} · ${p.active===false?"Hidden":"Visible"} · ${esc(p.price||"")}${p.featured?" · Featured":""}${p.topRated?" · Top-Rated":""}${curSection(p)==="top"?" · Homepage: Top":curSection(p)==="decor"?" · Homepage: Home Decor":""}</p></div><button onclick="editProduct('${p.id}')">Edit</button><button class="danger" onclick="removeProduct('${p.id}')">Delete</button></div>`).join("");
  renderHomeProducts();
}

// Homepage Products tab: each product can be placed in the "Top" section (kitchen appliances / top picks),
// the "Home Decor" section (shown below the first few articles), or left off the homepage.
function renderHomeProducts(){
  const list=$('homeProductList');
  if(!list)return;
  const cnt=k=>products.filter(p=>curSection(p)===k).length;
  $('homeTopCount').textContent=cnt("top");
  $('homeDecorCount').textContent=cnt("decor");
  const rank={top:0,decor:1,"":2};
  const sorted=[...products].sort((a,b)=>{
    const sa=curSection(a),sb=curSection(b);
    if(sa!==sb)return rank[sa]-rank[sb];
    return sa?((a.homeOrder??999)-(b.homeOrder??999)):((a.order??999)-(b.order??999));
  });
  list.innerHTML=sorted.map(p=>{
    const sec=curSection(p);
    return `<div class="list-item"><div class="thumb">${p.image?`<img src="${esc(p.image)}">`:"✦"}</div><div class="info"><h3>${esc(p.name)}</h3><p>${esc(p.category||"Uncategorized")}${p.active===false?" · Hidden (won't show even if selected)":""}</p></div>
    <label style="margin:0;display:flex;align-items:center;gap:6px;font-weight:600">Section<select data-home-sec="${p.id}"><option value="" ${sec===""?"selected":""}>Not on homepage</option><option value="top" ${sec==="top"?"selected":""}>Top section</option><option value="decor" ${sec==="decor"?"selected":""}>Home Decor section</option></select></label>
    <label style="margin:0;display:flex;align-items:center;gap:6px">Position<input type="number" data-for="${p.id}" value="${Number(p.homeOrder)||""}" min="1" max="${HOME_LIMIT}" style="width:60px"></label></div>`;
  }).join("");
}
$('saveHomeProducts')?.addEventListener("click",async()=>{
  const picks={};
  document.querySelectorAll('[data-home-sec]').forEach(x=>{picks[x.dataset.homeSec]=x.value});
  const counts={top:0,decor:0};
  Object.values(picks).forEach(v=>{if(v)counts[v]++});
  if(counts.top>HOME_LIMIT||counts.decor>HOME_LIMIT){alert(`Each homepage section can hold at most ${HOME_LIMIT} products (Top: ${counts.top}, Home Decor: ${counts.decor}).`);return}
  const btn=$('saveHomeProducts');
  btn.disabled=true;btn.textContent="Saving…";
  try{
    for(const p of products){
      const sec=picks[p.id]??curSection(p);
      const orderInput=document.querySelector(`[data-for="${p.id}"]`);
      const homeOrder=sec?(Number(orderInput?.value)||0):null;
      if(curSection(p)!==sec||(sec&&p.homeOrder!==homeOrder)||(sec&&!p.homeSection)){
        await updateDoc(doc(db,"products",p.id),{showOnHome:!!sec,homeSection:sec||null,homeOrder});
      }
    }
    alert("Homepage selection saved.");
  }catch(e){alert(e.message)}
  btn.disabled=false;btn.textContent="Save Homepage Selection";
});
window.editProduct=id=>{const p=products.find(x=>x.id===id);$('productEditor').hidden=false;$('productEditor').innerHTML=productForm(p);bindProduct(id)};
window.removeProduct=async id=>{if(confirm("Delete this product?"))await deleteDoc(doc(db,"products",id))};

function articleForm(a={active:true}){
  return `<h3>${a.id?"Edit":"Add"} Article</h3>
  <label>Title<input id="atitle" value="${esc(a.title||"")}" required></label>
  <label>Excerpt / Description<textarea id="aexcerpt">${esc(a.excerpt||"")}</textarea></label>
  <label>Article Content</label>
  <div id="acontentEditor"></div>
  <p class="hint">Select any text, then use the toolbar: change its <b>size</b>, make it <b>bold</b> / <i>italic</i>, or press <b>🔗 Link</b> to turn it into a blue affiliate link that opens another website. Use <b>🖼 Image</b> to place a picture inside the text, with a link underneath it. Click an image to resize, move or remove it.</p>
  <label>Featured Image URL
  <div class="image-field"><input id="aimage" placeholder="https://..." value="${esc(a.image||"")}"><img id="aimagePreview" class="image-preview" src="${esc(a.image||"")}" ${a.image?"":"hidden"}><button type="button" id="aimageRemove" ${a.image?"":"hidden"}>Remove Image URL</button></div>
  <p class="hint">Paste an image URL — it is saved to the article and keeps showing after a page refresh.</p>
  </label>
  <label>Category<input id="acategory" value="${esc(a.category||"Buying Guide")}"></label>
  <label>Order<input id="aorder" type="number" value="${Number(a.order)||0}"></label>
  <h4>Products in this article</h4>
  <div class="product-picker">${products.map(p=>`<label><input type="checkbox" data-article-product value="${p.id}" ${(a.productIds||a.products||[]).some(x=>(typeof x==="string"?x:x.id)===p.id)?"checked":""}> ${esc(p.name)}</label>`).join("")}</div>
  <label><input id="aactive" type="checkbox" ${a.active!==false?"checked":""}> Publish Article</label>
  <p class="hint">Publishing opens this article as a complete, dedicated article page (article.html) — not a small popup — with related articles from the same category shown automatically.</p>
  <button id="saveArticle">Save Article</button>`;
}

$('newArticle').onclick=()=>{$('articleEditor').hidden=false;$('articleEditor').innerHTML=articleForm();bindArticle()};

function bindArticle(id){
  const existing=id?articles.find(x=>x.id===id):null;
  const startHtml=existing?.contentHtml||plainToHtml(existing?.content||"");
  articleEditor=createEditor($('acontentEditor'),startHtml,{uploadImage:async f=>{const u=await uploadTo("images/articles",f);loadGallery();return u}});
  $('aimage').oninput=()=>{
    const url=$('aimage').value.trim();
    if(url){$('aimagePreview').src=url;$('aimagePreview').hidden=false;$('aimageRemove').hidden=false}
    else{$('aimagePreview').hidden=true;$('aimagePreview').src="";$('aimageRemove').hidden=true}
  };
  $('aimageRemove').onclick=()=>{
    $('aimage').value="";
    $('aimagePreview').hidden=true;
    $('aimagePreview').src="";
    $('aimageRemove').hidden=true;
  };
  $('saveArticle').onclick=async()=>{
    const d={
      title:$('atitle').value.trim(),
      excerpt:$('aexcerpt').value,
      contentHtml:articleEditor.getHTML(),
      content:$('acontentEditor').querySelector('.rte-area').innerText,
      image:$('aimage').value,
      category:$('acategory').value.trim()||"Buying Guide",
      order:Number($('aorder').value)||0,
      productIds:[...document.querySelectorAll('[data-article-product]:checked')].map(x=>x.value),
      active:$('aactive').checked,
      published:$('aactive').checked
    };
    if(!d.title)return alert("Article title is required.");
    try{
      id?await setDoc(doc(db,"articles",id),d,{merge:true}):await addDoc(collection(db,"articles"),d);
      $('articleEditor').hidden=true;
    }catch(e){alert(e.message)}
  };
}

function renderArticles(){
  $('articleList').innerHTML=[...articles].sort((a,b)=>(a.order??999)-(b.order??999)).map(a=>`<div class="list-item"><div class="thumb">${a.image?`<img src="${esc(a.image)}">`:"✦"}</div><div class="info"><h3>${esc(a.title)}</h3><p>${esc(a.category||"Buying Guide")} · ${a.active===false?"Hidden":"Published"}</p></div><button onclick="editArticle('${a.id}')">Edit</button><button class="danger" onclick="removeArticle('${a.id}')">Delete</button></div>`).join("");
}
window.editArticle=id=>{const a=articles.find(x=>x.id===id);$('articleEditor').hidden=false;$('articleEditor').innerHTML=articleForm(a);bindArticle(id)};
window.removeArticle=async id=>{if(confirm("Delete this article?"))await deleteDoc(doc(db,"articles",id))};

$('uploadImage').onclick=async()=>{
  const f=$('imageFile').files[0];
  if(!f)return alert("Choose an image first.");
  try{
    $('uploadMsg').textContent="Uploading…";
    const url=await uploadTo("images",f);
    $('uploadMsg').innerHTML=`Uploaded successfully. URL: <input readonly value="${esc(url)}">`;
    $('imageFile').value="";
    loadGallery();
  }catch(e){$('uploadMsg').textContent=e.message}
};

async function loadGallery(){
  try{
    const root=await listAll(ref(storage,"images"));
    let refs=[...root.items];
    const subfolders=await Promise.all(root.prefixes.map(p=>listAll(p)));
    subfolders.forEach(s=>refs.push(...s.items));
    const items=await Promise.all(refs.map(async i=>({path:i.fullPath,name:i.name,url:await getDownloadURL(i)})));
    $('imageCount').textContent=items.length;
    $('imageGallery').innerHTML=items.map(x=>`<div class="gallery-item"><img src="${esc(x.url)}" alt=""><small>${esc(x.name)}</small><button class="danger" onclick="removeImage('${encodeURIComponent(x.path)}')">Delete</button></div>`).join("");
  }catch(e){$('imageCount').textContent="0"}
}
window.removeImage=async path=>{
  if(!confirm("Delete this uploaded image?"))return;
  try{await deleteObject(ref(storage,decodeURIComponent(path)));loadGallery()}
  catch(e){alert(e.message)}
};

$('passwordForm').onsubmit=async e=>{
  e.preventDefault();
  const cur=$('currentPassword').value,neu=$('newPassword').value,conf=$('confirmPassword').value;
  if(neu!==conf)return $('passwordMsg').textContent="New passwords do not match.";
  try{
    const cred=EmailAuthProvider.credential(auth.currentUser.email,cur);
    await reauthenticateWithCredential(auth.currentUser,cred);
    await updatePassword(auth.currentUser,neu);
    $('passwordMsg').textContent="Password updated successfully.";
    $('passwordForm').reset();
  }catch(err){$('passwordMsg').textContent=err.message}
};

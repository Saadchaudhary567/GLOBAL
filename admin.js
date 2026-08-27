import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,onAuthStateChanged,signOut,EmailAuthProvider,reauthenticateWithCredential,updatePassword} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,updateDoc,collection,onSnapshot,addDoc,deleteDoc} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL,listAll,deleteObject} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import {firebaseConfig} from "./firebase-config.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
let content={},products=[],articles=[],categories=[],started=false;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));

const ICON_PRESETS=["✦","♨","♜","⚔","▱","☕","▣","◉"];

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

function rows(arr,label){
  return arr.map((x,i)=>`<div class="array-row"><input value="${esc(x)}" data-${label}="${i}"><button type="button" class="mv" onclick="moveRow(this,-1)">↑</button><button type="button" class="mv" onclick="moveRow(this,1)">↓</button><button type="button" onclick="this.parentElement.remove()">×</button></div>`).join("");
}
window.moveRow=(btn,dir)=>{
  const row=btn.parentElement;
  const sib=dir<0?row.previousElementSibling:row.nextElementSibling;
  if(!sib)return;
  if(dir<0)row.parentElement.insertBefore(row,sib);
  else row.parentElement.insertBefore(sib,row);
};

function productForm(p={active:true}){
  const pros=p.pros||[],cons=p.cons||[];
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
  <label>Image Fit<select id="pfit"><option value="contain" ${p.imageFit!=="cover"?"selected":""}>Contain</option><option value="cover" ${p.imageFit==="cover"?"selected":""}>Cover</option></select></label>
  <label>Image Zoom (%)<input id="pimagescale" type="range" min="60" max="150" value="${Number(p.imageScale)||100}"></label>
  <label>Order<input id="porder" type="number" value="${Number(p.order)||0}"></label>
  </div>
  <label>Product Image
  <div class="image-field"><img id="pimagePreview" class="image-preview" src="${esc(p.image||"")}" ${p.image?"":"hidden"}><input type="file" id="pimageFile" accept="image/*"><input type="hidden" id="pimage" value="${esc(p.image||"")}"><button type="button" id="pimageRemove" ${p.image?"":"hidden"}>Remove Image</button></div>
  </label>
  <label><input id="pactive" type="checkbox" ${p.active!==false?"checked":""}> Show / Publish Product</label>
  <label><input id="ptop" type="checkbox" ${p.topRated?"checked":""}> Mark as Top-Rated</label>
  <label><input id="pfeatured" type="checkbox" ${p.featured?"checked":""}> Mark as Featured</label>
  <h4>Pros</h4><div id="prosRows">${rows(pros,"pros")}</div><button type="button" class="secondary" id="addPro">+ Add Pro</button>
  <h4>Cons</h4><div id="consRows">${rows(cons,"cons")}</div><button type="button" class="secondary" id="addCon">+ Add Con</button>
  <br><button id="saveProduct">Save Product</button>`;
}

function bindProduct(id){
  $('addPro').onclick=()=>{$('prosRows').insertAdjacentHTML('beforeend','<div class="array-row"><input data-pros><button type="button" class="mv" onclick="moveRow(this,-1)">↑</button><button type="button" class="mv" onclick="moveRow(this,1)">↓</button><button type="button" onclick="this.parentElement.remove()">×</button></div>')};
  $('addCon').onclick=()=>{$('consRows').insertAdjacentHTML('beforeend','<div class="array-row"><input data-cons><button type="button" class="mv" onclick="moveRow(this,-1)">↑</button><button type="button" class="mv" onclick="moveRow(this,1)">↓</button><button type="button" onclick="this.parentElement.remove()">×</button></div>')};

  $('pimageFile').onchange=async()=>{
    const f=$('pimageFile').files[0];
    if(!f)return;
    try{
      const url=await uploadTo("images/products",f);
      $('pimage').value=url;
      $('pimagePreview').src=url;
      $('pimagePreview').hidden=false;
      $('pimageRemove').hidden=false;
      $('pimageFile').value="";
      loadGallery();
    }catch(e){alert(e.message)}
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
      image:$('pimage').value,
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
      order:Number($('porder').value)||0,
      active:$('pactive').checked,
      published:$('pactive').checked,
      topRated:$('ptop').checked,
      featured:$('pfeatured').checked,
      pros:[...document.querySelectorAll('[data-pros]')].map(x=>x.value.trim()).filter(Boolean),
      cons:[...document.querySelectorAll('[data-cons]')].map(x=>x.value.trim()).filter(Boolean)
    };
    if(!d.name)return alert("Product name is required.");
    id?await setDoc(doc(db,"products",id),d,{merge:true}):await addDoc(collection(db,"products"),d);
    $('productEditor').hidden=true;
  };
}

$('newProduct').onclick=()=>{
  if(!categories.length)return alert("Add at least one category first.");
  $('productEditor').hidden=false;$('productEditor').innerHTML=productForm();bindProduct();
};

function renderProducts(){
  $('productList').innerHTML=[...products].sort((a,b)=>(a.order??999)-(b.order??999)).map(p=>`<div class="list-item"><div class="thumb">${p.image?`<img src="${esc(p.image)}">`:"✦"}</div><div class="info"><h3>${esc(p.name)}</h3><p>${esc(p.category||"Uncategorized")} · ${p.active===false?"Hidden":"Visible"} · ${esc(p.price||"")}${p.featured?" · Featured":""}${p.topRated?" · Top-Rated":""}</p></div><button onclick="editProduct('${p.id}')">Edit</button><button class="danger" onclick="removeProduct('${p.id}')">Delete</button></div>`).join("");
}
window.editProduct=id=>{const p=products.find(x=>x.id===id);$('productEditor').hidden=false;$('productEditor').innerHTML=productForm(p);bindProduct(id)};
window.removeProduct=async id=>{if(confirm("Delete this product?"))await deleteDoc(doc(db,"products",id))};

function articleForm(a={active:true}){
  return `<h3>${a.id?"Edit":"Add"} Article</h3>
  <label>Title<input id="atitle" value="${esc(a.title||"")}" required></label>
  <label>Excerpt<textarea id="aexcerpt">${esc(a.excerpt||"")}</textarea></label>
  <label>Article Content<textarea id="acontent">${esc(a.content||"")}</textarea></label>
  <label>Featured Image
  <div class="image-field"><img id="aimagePreview" class="image-preview" src="${esc(a.image||"")}" ${a.image?"":"hidden"}><input type="file" id="aimageFile" accept="image/*"><input type="hidden" id="aimage" value="${esc(a.image||"")}"><button type="button" id="aimageRemove" ${a.image?"":"hidden"}>Remove Image</button></div>
  </label>
  <label>Category<input id="acategory" value="${esc(a.category||"Buying Guide")}"></label>
  <label>Order<input id="aorder" type="number" value="${Number(a.order)||0}"></label>
  <h4>Products in this article</h4>
  <div class="product-picker">${products.map(p=>`<label><input type="checkbox" data-article-product value="${p.id}" ${(a.productIds||a.products||[]).some(x=>(typeof x==="string"?x:x.id)===p.id)?"checked":""}> ${esc(p.name)}</label>`).join("")}</div>
  <label><input id="aactive" type="checkbox" ${a.active!==false?"checked":""}> Publish Article</label>
  <button id="saveArticle">Save Article</button>`;
}

$('newArticle').onclick=()=>{$('articleEditor').hidden=false;$('articleEditor').innerHTML=articleForm();bindArticle()};

function bindArticle(id){
  $('aimageFile').onchange=async()=>{
    const f=$('aimageFile').files[0];
    if(!f)return;
    try{
      const url=await uploadTo("images/articles",f);
      $('aimage').value=url;
      $('aimagePreview').src=url;
      $('aimagePreview').hidden=false;
      $('aimageRemove').hidden=false;
      $('aimageFile').value="";
      loadGallery();
    }catch(e){alert(e.message)}
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
      content:$('acontent').value,
      image:$('aimage').value,
      category:$('acategory').value.trim()||"Buying Guide",
      order:Number($('aorder').value)||0,
      productIds:[...document.querySelectorAll('[data-article-product]:checked')].map(x=>x.value),
      active:$('aactive').checked,
      published:$('aactive').checked
    };
    if(!d.title)return alert("Article title is required.");
    id?await setDoc(doc(db,"articles",id),d,{merge:true}):await addDoc(collection(db,"articles"),d);
    $('articleEditor').hidden=true;
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

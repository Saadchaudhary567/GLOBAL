// richtext.js — shared by admin.js (editor) and article.js (safe rendering).
// 1) sanitizeHtml(): only allows a small, safe set of tags/attributes so article HTML can never run scripts.
// 2) createEditor(): a lightweight word-processor style editor (size, bold, italic, links, images…).

const ALLOWED=new Set(["P","BR","STRONG","B","EM","I","U","S","SPAN","H2","H3","H4","UL","OL","LI","A","IMG","FIGURE","FIGCAPTION","BLOCKQUOTE","DIV"]);
const DROP=new Set(["SCRIPT","STYLE","IFRAME","OBJECT","EMBED","LINK","META","FORM","INPUT","BUTTON","TEXTAREA","SELECT","SVG","MATH","NOSCRIPT","TEMPLATE"]);
const FIG_CLASSES=new Set(["ai","ai-left","ai-center","ai-right"]);

const escAttr=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));

function unwrap(n){
  while(n.firstChild)n.parentNode.insertBefore(n.firstChild,n);
  n.remove();
}

function cleanStyle(el,noStyle){
  if(noStyle)return "";
  const out=[];
  (el.getAttribute("style")||"").split(";").forEach(d=>{
    const i=d.indexOf(":");
    if(i<0)return;
    const p=d.slice(0,i).trim().toLowerCase(),v=d.slice(i+1).trim();
    if(p==="font-size"&&/^\d{1,3}(\.\d+)?(px|em|rem|%)$/.test(v))out.push(p+":"+v);
    else if(p==="color"&&/^(#[0-9a-f]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|[a-z]{3,20})$/i.test(v))out.push(p+":"+v);
    else if(p==="text-align"&&/^(left|center|right|justify)$/.test(v))out.push(p+":"+v);
    else if(p==="width"&&/^\d{1,3}(\.\d+)?%$/.test(v))out.push(p+":"+v);
  });
  return out.join(";");
}

function walk(parent,noStyle){
  [...parent.childNodes].forEach(n=>{
    if(n.nodeType===3)return;
    if(n.nodeType!==1){n.remove();return}
    const tag=n.tagName;
    if(DROP.has(tag)){n.remove();return}
    walk(n,noStyle);
    let ok=ALLOWED.has(tag);
    if(tag==="A"&&!/^(https?:\/\/|mailto:)/i.test((n.getAttribute("href")||"").trim()))ok=false;
    if(tag==="IMG"&&!/^https?:\/\//i.test((n.getAttribute("src")||"").trim())){n.remove();return}
    if(!ok){unwrap(n);return}
    const rel=n.getAttribute("rel")||"",href=(n.getAttribute("href")||"").trim(),src=(n.getAttribute("src")||"").trim(),alt=n.getAttribute("alt")||"",cls=n.getAttribute("class")||"";
    const style=cleanStyle(n,noStyle);
    [...n.attributes].forEach(a=>n.removeAttribute(a.name));
    if(style)n.setAttribute("style",style);
    if(tag==="A"){
      n.setAttribute("href",href);
      n.setAttribute("target","_blank");
      n.setAttribute("rel",/sponsored/i.test(rel)?"nofollow sponsored noopener noreferrer":"noopener noreferrer");
    }
    if(tag==="IMG"){n.setAttribute("src",src);n.setAttribute("alt",alt);n.setAttribute("loading","lazy")}
    if(tag==="FIGURE"){const c=cls.split(/\s+/).filter(x=>FIG_CLASSES.has(x));if(c.length)n.setAttribute("class",c.join(" "))}
    if(tag==="SPAN"&&!style)unwrap(n);
  });
}

export function sanitizeHtml(html,opts={}){
  const doc=new DOMParser().parseFromString("<!doctype html><body>"+String(html||""),"text/html");
  walk(doc.body,!!opts.noStyle);
  return doc.body.innerHTML;
}

// Old articles were saved as plain text with line breaks. This turns them into paragraphs for the editor.
export function plainToHtml(text){
  return String(text||"").split(/\n/).map(l=>l.trim()).filter(Boolean).map(l=>`<p>${escAttr(l)}</p>`).join("");
}

const SIZES=[12,14,16,18,20,22,24,28,32,36,42,48];

const TEMPLATE=`
<div class="rte">
  <div class="rte-bar">
    <select data-cmd="block" title="Paragraph / Heading"><option value="">Style</option><option value="p">Paragraph</option><option value="h2">Heading (big)</option><option value="h3">Sub-heading</option><option value="h4">Small heading</option></select>
    <select data-cmd="size" title="Text size (select text first)"><option value="">Text size</option><option value="normal">Normal</option>${SIZES.map(s=>`<option value="${s}">${s}px</option>`).join("")}</select>
    <button type="button" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
    <button type="button" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
    <button type="button" data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
    <button type="button" data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>
    <input type="color" data-cmd="color" value="#222222" title="Text colour">
    <span class="rte-sep"></span>
    <button type="button" data-cmd="justifyLeft" title="Align left">Left</button>
    <button type="button" data-cmd="justifyCenter" title="Align centre">Center</button>
    <button type="button" data-cmd="justifyRight" title="Align right">Right</button>
    <span class="rte-sep"></span>
    <button type="button" data-cmd="insertUnorderedList" title="Bullet list">• List</button>
    <button type="button" data-cmd="insertOrderedList" title="Numbered list">1. List</button>
    <span class="rte-sep"></span>
    <button type="button" data-cmd="link" title="Make selected text a blue link">🔗 Link</button>
    <button type="button" data-cmd="unlink" title="Remove link">Unlink</button>
    <button type="button" data-cmd="image" title="Insert image inside the text">🖼 Image</button>
    <span class="rte-sep"></span>
    <button type="button" data-cmd="undo" title="Undo">↶</button>
    <button type="button" data-cmd="redo" title="Redo">↷</button>
    <button type="button" data-cmd="removeFormat" title="Clear formatting of selected text">Clear</button>
  </div>

  <div class="rte-dialog" data-dialog="link" hidden>
    <strong>Link</strong>
    <input type="url" data-f="url" placeholder="https://… (where the visitor goes after clicking)">
    <label class="rte-check"><input type="checkbox" data-f="affiliate" checked> Affiliate / sponsored link</label>
    <button type="button" data-do="apply-link">Apply</button>
    <button type="button" data-do="cancel">Cancel</button>
  </div>

  <div class="rte-dialog" data-dialog="image" hidden>
    <strong>Insert image</strong>
    <input type="url" data-f="src" placeholder="Image URL https://…">
    <span class="rte-or">or</span>
    <input type="file" data-f="file" accept="image/*">
    <small data-f="status"></small>
    <label>Size <select data-f="width"><option value="25">Small (25%)</option><option value="40">40%</option><option value="60" selected>Medium (60%)</option><option value="80">Large (80%)</option><option value="100">Full width</option></select></label>
    <label>Position <select data-f="align"><option value="center" selected>Center</option><option value="left">Left (text wraps)</option><option value="right">Right (text wraps)</option></select></label>
    <input type="text" data-f="alt" placeholder="Image description (alt text)">
    <input type="text" data-f="captext" placeholder="Link text below image, e.g. Check price on Amazon →">
    <input type="url" data-f="capurl" placeholder="Link URL below image (optional) https://…">
    <label class="rte-check"><input type="checkbox" data-f="imglink" checked> Make the image itself clickable too</label>
    <label class="rte-check"><input type="checkbox" data-f="capaff" checked> Affiliate / sponsored link</label>
    <button type="button" data-do="apply-image">Insert Image</button>
    <button type="button" data-do="cancel">Cancel</button>
  </div>

  <div class="rte-imgbar" hidden>
    <strong>Selected image:</strong>
    <button type="button" data-img="25">25%</button><button type="button" data-img="40">40%</button><button type="button" data-img="60">60%</button><button type="button" data-img="80">80%</button><button type="button" data-img="100">100%</button>
    <button type="button" data-img="left">⬅ Left</button><button type="button" data-img="center">⬌ Center</button><button type="button" data-img="right">Right ➡</button>
    <button type="button" data-img="remove" class="rte-del">✕ Remove</button>
  </div>

  <div class="rte-area" contenteditable="true" spellcheck="true" data-placeholder="Write your article here… select any text to make it bigger, bold, italic, or turn it into a blue affiliate link."></div>
</div>`;

export function createEditor(mount,initialHtml="",opts={}){
  mount.innerHTML=TEMPLATE;
  const root=mount.querySelector(".rte");
  const bar=root.querySelector(".rte-bar");
  const area=root.querySelector(".rte-area");
  const imgbar=root.querySelector(".rte-imgbar");
  const dlgLink=root.querySelector('[data-dialog="link"]');
  const dlgImg=root.querySelector('[data-dialog="image"]');
  const F=(dlg,k)=>dlg.querySelector(`[data-f="${k}"]`);
  let saved=null,selFig=null,editingAnchor=null;

  area.innerHTML=sanitizeHtml(initialHtml);
  try{document.execCommand("defaultParagraphSeparator",false,"p")}catch(e){}

  // Remember the selection so toolbar clicks / dialogs don't lose it.
  const onSel=()=>{
    if(!area.isConnected){document.removeEventListener("selectionchange",onSel);return}
    const s=window.getSelection();
    if(s&&s.rangeCount&&area.contains(s.anchorNode))saved=s.getRangeAt(0).cloneRange();
  };
  document.addEventListener("selectionchange",onSel);

  function restore(){
    area.focus();
    if(saved){const s=window.getSelection();s.removeAllRanges();s.addRange(saved)}
  }
  function exec(cmd,val){restore();document.execCommand(cmd,false,val??null)}
  function hasSelection(){return saved&&!saved.collapsed}
  function anchorOfSelection(){
    if(!saved)return null;
    let n=saved.commonAncestorContainer;
    if(n.nodeType===3)n=n.parentNode;
    return n&&n.closest?n.closest("a"):null;
  }

  function applySize(v){
    if(!v)return;
    if(!hasSelection()){alert("First select (highlight) the text whose size you want to change.");return}
    restore();
    document.execCommand("styleWithCSS",false,false);
    document.execCommand("fontSize",false,"7");
    area.querySelectorAll('font[size="7"]').forEach(f=>{
      const sp=document.createElement("span");
      if(v!=="normal")sp.style.fontSize=v+"px";
      while(f.firstChild)sp.appendChild(f.firstChild);
      sp.querySelectorAll("span").forEach(x=>x.style.removeProperty("font-size"));
      f.replaceWith(sp);
    });
  }

  function closeDialogs(){dlgLink.hidden=true;dlgImg.hidden=true}

  function openLink(){
    const a=anchorOfSelection();
    if(!a&&!hasSelection()){alert("First select (highlight) the text you want to turn into a link.");return}
    editingAnchor=a;
    closeDialogs();
    F(dlgLink,"url").value=a?a.getAttribute("href")||"":"";
    F(dlgLink,"affiliate").checked=a?/sponsored/i.test(a.getAttribute("rel")||""):true;
    dlgLink.hidden=false;
    F(dlgLink,"url").focus();
  }

  function normUrl(u){
    u=String(u||"").trim();
    if(!u)return "";
    if(/^(https?:\/\/|mailto:)/i.test(u))return u;
    if(/^[\w-]+(\.[\w-]+)+/.test(u))return "https://"+u;
    return "";
  }

  function applyLink(){
    const url=normUrl(F(dlgLink,"url").value);
    if(!url){alert("Please enter a valid link, for example https://www.amazon.com/…");return}
    const rel=F(dlgLink,"affiliate").checked?"nofollow sponsored noopener noreferrer":"noopener noreferrer";
    if(editingAnchor&&area.contains(editingAnchor)){
      editingAnchor.setAttribute("href",url);editingAnchor.setAttribute("target","_blank");editingAnchor.setAttribute("rel",rel);
    }else{
      restore();
      document.execCommand("createLink",false,url);
      area.querySelectorAll("a[href]").forEach(a=>{
        if(!a.hasAttribute("target")){a.setAttribute("target","_blank");a.setAttribute("rel",rel)}
      });
    }
    editingAnchor=null;closeDialogs();
  }

  function openImage(){
    closeDialogs();
    ["src","alt","captext","capurl"].forEach(k=>F(dlgImg,k).value="");
    F(dlgImg,"file").value="";F(dlgImg,"status").textContent="";
    dlgImg.hidden=false;
    F(dlgImg,"src").focus();
  }

  F(dlgImg,"file").onchange=async()=>{
    const f=F(dlgImg,"file").files[0];
    if(!f)return;
    if(!opts.uploadImage){F(dlgImg,"status").textContent="Upload is not available — paste an image URL instead.";return}
    try{
      F(dlgImg,"status").textContent="Uploading…";
      F(dlgImg,"src").value=await opts.uploadImage(f);
      F(dlgImg,"status").textContent="Uploaded ✓";
    }catch(e){F(dlgImg,"status").textContent="Upload failed: "+e.message}
  };

  function applyImage(){
    const src=normUrl(F(dlgImg,"src").value);
    if(!src){alert("Please paste an image URL (or upload an image).");return}
    const w=F(dlgImg,"width").value,al=F(dlgImg,"align").value;
    const alt=escAttr(F(dlgImg,"alt").value.trim());
    const capText=F(dlgImg,"captext").value.trim();
    const capUrl=normUrl(F(dlgImg,"capurl").value);
    const rel=F(dlgImg,"capaff").checked?"nofollow sponsored noopener noreferrer":"noopener noreferrer";
    let img=`<img src="${escAttr(src)}" alt="${alt}">`;
    if(capUrl&&F(dlgImg,"imglink").checked)img=`<a href="${escAttr(capUrl)}" target="_blank" rel="${rel}">${img}</a>`;
    let cap="";
    if(capUrl)cap=`<figcaption><a href="${escAttr(capUrl)}" target="_blank" rel="${rel}">${escAttr(capText||"View here →")}</a></figcaption>`;
    else if(capText)cap=`<figcaption>${escAttr(capText)}</figcaption>`;
    restore();
    document.execCommand("insertHTML",false,`<figure class="ai ai-${al}" style="width:${w}%">${img}${cap}</figure><p><br></p>`);
    closeDialogs();
  }

  // Toolbar events
  bar.addEventListener("mousedown",e=>{if(!e.target.closest("select,input"))e.preventDefault()});
  bar.addEventListener("click",e=>{
    const b=e.target.closest("button[data-cmd]");
    if(!b)return;
    const c=b.dataset.cmd;
    if(c==="link")return openLink();
    if(c==="image")return openImage();
    exec(c);
  });
  bar.addEventListener("change",e=>{
    const t=e.target,c=t.dataset.cmd;
    if(c==="size"){applySize(t.value);t.value=""}
    else if(c==="block"){if(t.value)exec("formatBlock",t.value);t.value=""}
  });
  bar.addEventListener("input",e=>{if(e.target.dataset.cmd==="color")exec("foreColor",e.target.value)});

  root.addEventListener("click",e=>{
    const d=e.target.closest("[data-do]");
    if(!d)return;
    if(d.dataset.do==="apply-link")applyLink();
    else if(d.dataset.do==="apply-image")applyImage();
    else closeDialogs();
  });

  // Click an image inside the text to resize / move / remove it.
  area.addEventListener("click",e=>{
    area.querySelectorAll("figure.ai-sel").forEach(f=>f.classList.remove("ai-sel"));
    const img=e.target.closest&&e.target.closest("img");
    if(img&&area.contains(img)){
      e.preventDefault();
      selFig=img.closest("figure");
      if(selFig){selFig.classList.add("ai-sel");imgbar.hidden=false;return}
    }
    selFig=null;imgbar.hidden=true;
  });
  imgbar.addEventListener("mousedown",e=>e.preventDefault());
  imgbar.addEventListener("click",e=>{
    const b=e.target.closest("[data-img]");
    if(!b||!selFig)return;
    const v=b.dataset.img;
    if(v==="remove"){selFig.remove();selFig=null;imgbar.hidden=true;return}
    if(/^\d+$/.test(v))selFig.style.width=v+"%";
    else{selFig.classList.remove("ai-left","ai-center","ai-right");selFig.classList.add("ai-"+v)}
  });

  // Paste: keep structure (paragraphs, bold, links) but drop foreign fonts / colours / sizes.
  area.addEventListener("paste",e=>{
    e.preventDefault();
    const h=e.clipboardData.getData("text/html"),t=e.clipboardData.getData("text/plain");
    if(h)document.execCommand("insertHTML",false,sanitizeHtml(h,{noStyle:true}));
    else document.execCommand("insertText",false,t);
  });

  return {
    getHTML(){
      const clone=area.cloneNode(true);
      clone.querySelectorAll("figure.ai-sel").forEach(f=>f.classList.remove("ai-sel"));
      return sanitizeHtml(clone.innerHTML);
    },
    isEmpty(){return !area.textContent.trim()&&!area.querySelector("img")}
  };
}

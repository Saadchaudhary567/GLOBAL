const products = [
  {name:"CrispHome 5.8 QT Air Fryer", icon:"♨", rating:"4.8", category:"Air Fryer", text:"A spacious demo air fryer for everyday cooking.", url:"https://www.amazon.com/"},
  {name:"FreshBlend Professional Blender", icon:"♜", rating:"4.7", category:"Blender", text:"A powerful demo pick for smoothies and sauces.", url:"https://www.amazon.com/"},
  {name:"ProEdge 15-Piece Knife Set", icon:"⚔", rating:"4.8", category:"Knives", text:"A complete knife-set style recommendation.", url:"https://www.amazon.com/"},
  {name:"EverPan Ultimate Cookware Set", icon:"▱", rating:"4.8", category:"Cookware", text:"A versatile set for everyday home cooking.", url:"https://www.amazon.com/"},
  {name:"MorningCup Single Serve Maker", icon:"☕", rating:"4.6", category:"Coffee", text:"A compact demo coffee maker for quick mornings.", url:"https://www.amazon.com/"},
  {name:"ToastPro 2-Slice Toaster", icon:"▣", rating:"4.5", category:"Toaster", text:"A simple countertop toaster for daily use.", url:"https://www.amazon.com/"}
];

const guides = [
  {
    title:"Best Air Fryer Features for Everyday Cooking",
    icon:"♨", excerpt:"Learn which capacity, controls and cleaning features matter before choosing an air fryer.",
    intro:"Air fryers can be useful for busy kitchens, but the best model depends on how much food you cook and how much counter space you have. A larger basket can help with family meals, while a compact design may be better for smaller kitchens.",
    points:["Choose basket size based on your normal portions.","Look for controls you can understand quickly.","Consider cleaning requirements before buying."],
    picks:[0,0]
  },
  {
    title:"How to Choose a Blender for Your Kitchen",
    icon:"♜", excerpt:"A practical guide to capacity, speed settings and everyday blending needs.",
    intro:"A good blender should match the recipes you actually make. Smoothies, sauces and frozen ingredients may require different power levels, blade designs and container sizes.",
    points:["Think about smoothies, sauces and other regular recipes.","Choose a capacity that fits your household.","Check whether the container and lid are easy to clean."],
    picks:[1,1]
  },
  {
    title:"Best Kitchen Knife Types for Home Cooks",
    icon:"⚔", excerpt:"Understand blade shapes, comfortable handles and basic knife care.",
    intro:"You do not need dozens of knives to build a useful kitchen. A comfortable chef knife, a smaller utility knife and a suitable serrated knife can cover many everyday tasks.",
    points:["Prioritize comfortable handling.","Buy useful blade shapes instead of unnecessary extras.","Maintain knives with safe storage and regular sharpening."],
    picks:[2,2]
  },
  {
    title:"What to Look for in a Cookware Set",
    icon:"▱", excerpt:"Compare materials, handles and cooking compatibility before choosing.",
    intro:"Cookware is usually a longer-term purchase, so it helps to consider your stove type, cooking style and storage space before selecting a complete set.",
    points:["Check compatibility with your cooktop.","Consider the number of pieces you truly need.","Look for comfortable handles and manageable weight."],
    picks:[3,3]
  },
  {
    title:"Coffee Maker Features That Make Mornings Easier",
    icon:"☕", excerpt:"A simple guide to capacity, convenience and home coffee routines.",
    intro:"The best coffee maker for your home is usually the one that matches your daily routine. Consider how many cups you prepare and whether programmable features will actually be useful.",
    points:["Match capacity to your household.","Consider how much automation you want.","Choose a machine that is easy to clean and maintain."],
    picks:[4,4]
  }
];

const productGrid = document.getElementById("productsGrid");
const guidesGrid = document.getElementById("guidesGrid");

function renderProducts(list=products){
  productGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image">${p.icon}</div>
      <div class="product-body">
        <div class="rating">★★★★★ ${p.rating}</div>
        <h3>${p.name}</h3>
        <p>${p.text}</p>
        <a class="button primary" href="${p.url}" target="_blank" rel="nofollow sponsored noopener">Check Price on Amazon</a>
      </div>
    </article>
  `).join("");
}

function renderGuides(list=guides){
  guidesGrid.innerHTML = list.map((g, index) => `
    <article class="guide-card">
      <div class="guide-image">${g.icon}<span class="guide-badge">Buying Guide</span></div>
      <div class="guide-body">
        <h3>${g.title}</h3>
        <p>${g.excerpt}</p>
        <button class="read-button" onclick="openGuide(${guides.indexOf(g)})">Read Article →</button>
      </div>
    </article>
  `).join("");
}

function openGuide(index){
  const g = guides[index];
  const selected = g.picks.map(i => products[i]);
  document.getElementById("modalContent").innerHTML = `
    <p class="eyebrow">KITCHENZEN BUYING GUIDE</p>
    <h2>${g.title}</h2>
    <p>${g.intro}</p>
    <h3>What to consider</h3>
    <ul>${g.points.map(point => `<li>${point}</li>`).join("")}</ul>
    <h3>Recommended demo products</h3>
    <div class="article-products">
      ${selected.map(p => `
        <div class="article-product">
          <h4>${p.icon} ${p.name}</h4>
          <p>${p.text}</p>
          <div class="rating">★★★★★ ${p.rating}</div>
          <br>
          <a class="button primary" href="${p.url}" target="_blank" rel="nofollow sponsored noopener">Check Price</a>
        </div>
      `).join("")}
    </div>
    <p><strong>Editor's note:</strong> This is original demo content for the starter website. Replace product facts, links and recommendations with your own researched information before publishing.</p>
  `;
  document.getElementById("guideModal").classList.add("show");
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("guideModal").classList.remove("show");
});

document.getElementById("guideModal").addEventListener("click", e => {
  if(e.target.id === "guideModal") document.getElementById("guideModal").classList.remove("show");
});

document.getElementById("menuButton").addEventListener("click", () => {
  document.getElementById("navigation").classList.toggle("open");
});

document.getElementById("searchInput").addEventListener("input", e => {
  const q = e.target.value.toLowerCase().trim();
  renderProducts(products.filter(p => `${p.name} ${p.category} ${p.text}`.toLowerCase().includes(q)));
  renderGuides(guides.filter(g => `${g.title} ${g.excerpt}`.toLowerCase().includes(q)));
});

renderProducts();
renderGuides();

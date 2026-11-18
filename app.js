import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SITE } from "./config.js";

const $ = id => document.getElementById(id);
const configured = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let projects = [], adminProjects = [], activeFilter = "All", currentDetail = null, lightboxItems = [], lightboxIndex = 0;

const HOME_DEFAULTS={heroEyebrow:"Selected works",heroTitle:"Neil",heroIntro:"A visual practice exploring the tension between the organic and the artificial — through image, identity, motion and atmosphere.",heroButton:"Explore the archive",aboutHeading:"Between form and feeling.",aboutLead:"Building visual languages at the intersection of design, atmosphere and storytelling.",aboutParagraph1:"I work across graphic design, visual identity and digital imagery. Drawn to cinematic contrast, botanical structures, tactile surfaces and details that reward a closer look.",aboutParagraph2:"This portfolio is a living archive of selected commissions, self-initiated studies and ongoing experiments.",worksHeading:"Selected works",contactEyebrow:"Have a project?",contactText:"Available for selected freelance projects, collaborations and creative opportunities.",font:"Montserrat",scale:"1",textColor:"#ece9e3",mutedColor:"#999999"};
const HOME_INPUTS={homeEyebrowInput:"heroEyebrow",homeTitleInput:"heroTitle",homeIntroInput:"heroIntro",homeButtonInput:"heroButton",aboutHeadingInput:"aboutHeading",aboutLeadInput:"aboutLead",aboutParagraph1Input:"aboutParagraph1",aboutParagraph2Input:"aboutParagraph2",worksHeadingInput:"worksHeading",contactEyebrowInput:"contactEyebrow",contactTextInput:"contactText"};
let currentLang=localStorage.getItem("neil-language")==="vi"?"vi":"en";
const LANG={
en:{about:"About",works:"Works",contact:"Contact",graphicDesigner:"Graphic Designer",brandIdentity:"Brand Identity Design",marketingAdvertising:"Marketing & Advertising Design",packaging:"Packaging Design",publication:"Publication Design",commercialIllustration:"Commercial Illustration",heroTop:"Independent designer / Visual storyteller",heroButton:"Explore the archive",scroll:"Scroll to discover",aboutIndex:"About the practice",aboutHeading:"Between form and feeling.",aboutLead:"Building visual languages at the intersection of design, atmosphere and storytelling.",aboutP1:"I work across graphic design, visual identity and digital imagery. Drawn to cinematic contrast, botanical structures, tactile surfaces and details that reward a closer look.",aboutP2:"This portfolio is a living archive of selected commissions, self-initiated studies and ongoing experiments.",worksIndex:"Selected archive",worksHeading:"Selected works",all:"All",contactIndex:"Correspondence",contactEyebrow:"Have a project?",contactText:"Available for selected freelance projects, collaborations and creative opportunities.",contactHeading:"Let's make it matter.",footer:"Designed with intention.",back:"← Back to selected works",projectOpen:"Open project details ↗",projectExplore:"Explore project ↗",empty:"Selected works will appear here.",none:"No projects in this category yet.",gallery:"Visual archive",galleryHint:"IMAGES · CLICK TO EXPAND",external:"Visit external project ↗"},
vi:{about:"Giới thiệu",works:"Dự án",contact:"Liên hệ",graphicDesigner:"Thiết kế đồ họa",brandIdentity:"Thiết kế nhận diện thương hiệu",marketingAdvertising:"Thiết kế marketing & quảng cáo",packaging:"Thiết kế bao bì",publication:"Thiết kế ấn phẩm",commercialIllustration:"Minh họa thương mại",heroTop:"Nhà thiết kế độc lập / Kể chuyện bằng hình ảnh",heroButton:"Khám phá dự án",scroll:"Cuộn để khám phá",aboutIndex:"Về định hướng sáng tạo",aboutHeading:"Giao thoa giữa hình thái và cảm xúc.",aboutLead:"Xây dựng ngôn ngữ thị giác tại điểm giao thoa giữa thiết kế, bầu không khí và nghệ thuật kể chuyện.",aboutP1:"Tôi thực hiện các dự án thiết kế đồ họa, nhận diện thương hiệu và hình ảnh kỹ thuật số. Tôi bị thu hút bởi tương phản điện ảnh, cấu trúc thực vật, bề mặt giàu chất liệu và những chi tiết cần được quan sát kỹ hơn.",aboutP2:"Portfolio này là kho lưu trữ sống gồm các dự án thương mại được tuyển chọn, nghiên cứu cá nhân và những thử nghiệm đang tiếp diễn.",worksIndex:"Tuyển tập dự án",worksHeading:"Dự án tiêu biểu",all:"Tất cả",contactIndex:"Kết nối",contactEyebrow:"Bạn có dự án?",contactText:"Tôi sẵn sàng nhận một số dự án freelance, hợp tác sáng tạo và cơ hội nghề nghiệp phù hợp.",contactHeading:"Cùng tạo nên điều ý nghĩa.",footer:"Được thiết kế với chủ đích.",back:"← Quay lại danh sách dự án",projectOpen:"Xem chi tiết dự án ↗",projectExplore:"Khám phá dự án ↗",empty:"Các dự án tiêu biểu sẽ được hiển thị tại đây.",none:"Chưa có dự án trong danh mục này.",gallery:"Thư viện hình ảnh",galleryHint:"HÌNH ẢNH · NHẤN ĐỂ PHÓNG TO",external:"Xem dự án bên ngoài ↗"}
};
function tr(key){return LANG[currentLang][key]||LANG.en[key]||key;}
function applyLanguage(){
 document.documentElement.lang=currentLang;
 const text=(selector,key)=>{const el=document.querySelector(selector);if(el)el.textContent=tr(key);};
 text(".main-nav a[href='#about']","about");text(".main-nav a[href='#works']","works");text(".main-nav a[href='#contact']","contact");
 text(".hero-topline span:first-child","heroTop");text(".text-link span:first-child","heroButton");
 const scroll=document.querySelector(".scroll-cue");if(scroll)scroll.innerHTML=tr("scroll")+' <i></i>';
 text("#about .section-index span:last-child","aboutIndex");text("#aboutHeading","aboutHeading");text("#aboutLead","aboutLead");text("#aboutParagraph1","aboutP1");text("#aboutParagraph2","aboutP2");
 text("#works .section-index span:last-child","worksIndex");text("#worksHeading","worksHeading");text("#filters [data-filter='All']","all");
 text("#contact .section-index span:last-child","contactIndex");text("#contactEyebrow","contactEyebrow");text("#contactText","contactText");
 const ch=document.querySelector("#contact h2");if(ch)ch.innerHTML=currentLang==="vi"?"Cùng tạo nên<br><em>điều ý nghĩa.</em>":"Let's make<br><em>it matter.</em>";
 const ft=document.querySelector(".site-footer > span:last-child");if(ft)ft.textContent=tr("footer");
 const toggle=$("languageToggle");if(toggle){toggle.textContent=currentLang==="en"?"VI":"EN";toggle.setAttribute("aria-label",currentLang==="en"?"Chuyển sang tiếng Việt":"Switch to English");}
 document.querySelectorAll(".filter").forEach(b=>{if(b.dataset.filter==="All")b.textContent=tr("all");else b.textContent=currentLang==="vi"?({"Graphic Designer":tr("graphicDesigner"),"Brand Identity Design":tr("brandIdentity"),"Marketing & Advertising Design":tr("marketingAdvertising"),"Packaging Design":tr("packaging"),"Publication Design":tr("publication"),"Commercial Illustration":tr("commercialIllustration"),"Graphic Design":"Thiết kế đồ họa","Visual Identity":"Nhận diện thương hiệu","3D / CGI":"3D / CGI","Motion":"Chuyển động"}[b.dataset.filter]||b.dataset.filter):b.dataset.filter;});
 const homeLabels={heroEyebrow:["#homeEyebrow","heroEyebrow"],heroIntro:["#homeIntro","heroIntro"],heroButton:[".text-link span:first-child","heroButton"],aboutHeading:["#aboutHeading","aboutHeading"],aboutLead:["#aboutLead","aboutLead"],aboutParagraph1:["#aboutParagraph1","aboutParagraph1"],aboutParagraph2:["#aboutParagraph2","aboutParagraph2"],worksHeading:["#worksHeading","worksHeading"],contactEyebrow:["#contactEyebrow","contactEyebrow"],contactText:["#contactText","contactText"]};
 const viHome={heroEyebrow:"Dự án tiêu biểu",heroIntro:"Thực hành sáng tạo thị giác khai thác sự tương phản giữa tự nhiên và nhân tạo thông qua hình ảnh, nhận diện, chuyển động và không gian cảm xúc.",heroButton:"Khám phá dự án",aboutHeading:"Giao thoa giữa hình thái và cảm xúc.",aboutLead:"Xây dựng ngôn ngữ thị giác tại điểm giao thoa giữa thiết kế, bầu không khí và nghệ thuật kể chuyện.",aboutParagraph1:"Tôi thực hiện các dự án thiết kế đồ họa, nhận diện thương hiệu và hình ảnh kỹ thuật số. Tôi bị thu hút bởi tương phản điện ảnh, cấu trúc thực vật, bề mặt giàu chất liệu và những chi tiết cần được quan sát kỹ hơn.",aboutParagraph2:"Portfolio này là kho lưu trữ sống gồm các dự án thương mại được tuyển chọn, nghiên cứu cá nhân và những thử nghiệm đang tiếp diễn.",worksHeading:"Dự án tiêu biểu",contactEyebrow:"Bạn có dự án?",contactText:"Tôi sẵn sàng nhận một số dự án freelance, hợp tác sáng tạo và cơ hội nghề nghiệp phù hợp."};
 Object.entries(homeLabels).forEach(([key,[selector]])=>{const el=document.querySelector(selector);if(!el)return;const value=homeSettings[key];el.textContent=value===HOME_DEFAULTS[key]?(currentLang==="vi"?viHome[key]:HOME_DEFAULTS[key]):(value||"");});
 if(projects.length)renderProjects();
 document.querySelectorAll(".filter").forEach(b=>{const labels={"Graphic Designer":"graphicDesigner","Brand Identity Design":"brandIdentity","Marketing & Advertising Design":"marketingAdvertising","Packaging Design":"packaging","Publication Design":"publication","Commercial Illustration":"commercialIllustration"};if(labels[b.dataset.filter])b.textContent=tr(labels[b.dataset.filter]);});
 if(currentDetail)openProject(currentDetail.id,false);
}

let homeSettings={...HOME_DEFAULTS};
function applyElementStyles(s){
  const targets={heroTitle:"#homeTitle",heroEyebrow:"#homeEyebrow",sectionHeadings:".about h2,.works h2,.contact h2,.detail-top h1",sectionIndex:".section-index",navigation:".main-nav a",projectTitle:".project-title",bodyCopy:".hero-intro,.about-copy p,.contact-copy p,.project-description,.detail-top p"};
  let css="";
  Object.entries(s.elementStyles||{}).forEach(([key,v])=>{
    const selector=targets[key];if(!selector||!v)return;
    const rules=[];
    if(v.font)rules.push("font-family:"+JSON.stringify(v.font)+",sans-serif");
    if(v.size)rules.push("font-size:"+Math.max(8,Math.min(180,Number(v.size)))+"px");
    if(v.gradient)rules.push("background-image:linear-gradient(90deg,"+v.gradientStart+","+v.gradientEnd+");background-clip:text;-webkit-background-clip:text;color:transparent");
    else if(v.color)rules.push("color:"+v.color);
    if(rules.length)css+=selector+"{"+rules.join(";")+"}";
  });
  let tag=$("elementStyleOverrides");if(!tag){tag=document.createElement("style");tag.id="elementStyleOverrides";document.head.appendChild(tag);}tag.textContent=css;
  const root=document.documentElement;
  root.style.setProperty("--bg",s.backgroundGradient?"linear-gradient(135deg,"+(s.backgroundColor||"#080808")+","+(s.backgroundEnd||"#17120f")+")":(s.backgroundColor||"#080808"));
  document.body.style.background=s.backgroundGradient?"linear-gradient(135deg,"+(s.backgroundColor||"#080808")+","+(s.backgroundEnd||"#17120f")+") fixed":(s.backgroundColor||"#080808");
}
function applyHome(s){s={...HOME_DEFAULTS,...s};const put=(id,v)=>{const el=$(id);if(el)el.textContent=v||"";};Object.entries({homeEyebrow:"heroEyebrow",homeTitle:"heroTitle",homeIntro:"heroIntro",homeButtonText:"heroButton",aboutHeading:"aboutHeading",aboutLead:"aboutLead",aboutParagraph1:"aboutParagraph1",aboutParagraph2:"aboutParagraph2",worksHeading:"worksHeading",contactEyebrow:"contactEyebrow",contactText:"contactText"}).forEach(([id,key])=>put(id,s[key]));document.documentElement.style.setProperty("--site-font",s.font==="Arial"?"Arial, sans-serif":'"'+s.font+'", sans-serif');document.documentElement.style.setProperty("--type-scale",String(Number(s.scale)||1));document.documentElement.style.setProperty("--text-color",s.textColor||"#ece9e3");document.documentElement.style.setProperty("--muted-text-color",s.mutedColor||"#999999");applyElementStyles(s);homeSettings=s;applyLanguage();}
async function loadHome(){if(!supabase){applyHome(HOME_DEFAULTS);return;}const {data,error}=await supabase.from("site_settings").select("settings").eq("id","homepage").maybeSingle();if(error){console.warn("Homepage settings unavailable",error);applyHome(HOME_DEFAULTS);return;}applyHome(data?.settings||HOME_DEFAULTS);}
function fillHomeForm(){Object.entries(HOME_INPUTS).forEach(([id,key])=>$(id).value=homeSettings[key]||"");$("siteFontInput").value=homeSettings.font||"Montserrat";$("siteScaleInput").value=homeSettings.scale||"1";$("siteTextColorInput").value=homeSettings.textColor||"#ece9e3";$("siteMutedColorInput").value=homeSettings.mutedColor||"#999999";$("siteBackgroundInput").value=homeSettings.backgroundColor||"#080808";$("siteBackgroundEndInput").value=homeSettings.backgroundEnd||"#17120f";$("siteBackgroundGradientInput").checked=!!homeSettings.backgroundGradient;loadElementStyleInputs();}
function loadElementStyleInputs(){
  const v=(homeSettings.elementStyles||{})[$("styleTargetInput").value]||{};
  $("elementFontInput").value=v.font||"";$("elementSizeInput").value=v.size||"";
  $("elementColorInput").value=v.color||"#ece9e3";$("elementGradientStartInput").value=v.gradientStart||"#ece9e3";$("elementGradientEndInput").value=v.gradientEnd||"#777777";$("elementGradientEnabledInput").checked=!!v.gradient;
}
function updateSelectedElementStyle(reset=false){
  const styles={...(homeSettings.elementStyles||{})},key=$("styleTargetInput").value;
  if(reset)delete styles[key];
  else styles[key]={font:$("elementFontInput").value,size:$("elementSizeInput").value,color:$("elementColorInput").value,gradientStart:$("elementGradientStartInput").value,gradientEnd:$("elementGradientEndInput").value,gradient:$("elementGradientEnabledInput").checked};
  homeSettings={...homeSettings,elementStyles:styles};applyElementStyles(homeSettings);
}
async function saveHome(e){e.preventDefault();const settings={...homeSettings};Object.entries(HOME_INPUTS).forEach(([id,key])=>settings[key]=$(id).value.trim());settings.font=$("siteFontInput").value;settings.scale=$("siteScaleInput").value;settings.textColor=$("siteTextColorInput").value;settings.mutedColor=$("siteMutedColorInput").value;settings.backgroundColor=$("siteBackgroundInput").value;settings.backgroundEnd=$("siteBackgroundEndInput").value;settings.backgroundGradient=$("siteBackgroundGradientInput").checked;settings.elementStyles=homeSettings.elementStyles||{};$("saveHomepage").disabled=true;$("homepageMessage").textContent="Saving…";try{const {error}=await supabase.from("site_settings").upsert({id:"homepage",settings,updated_at:new Date().toISOString()},{onConflict:"id"});if(error)throw error;applyHome(settings);fillHomeForm();$("homepageMessage").textContent="Homepage updated successfully.";toast("Homepage updated.");}catch(err){$("homepageMessage").textContent=err.message||"Unable to save homepage.";}finally{$("saveHomepage").disabled=false;}}
function resetHome(){applyHome(HOME_DEFAULTS);fillHomeForm();$("homepageMessage").textContent="Default content loaded. Press Save homepage to publish.";}

const localSessionKey = "moth_orchid_session_id";
const sessionId = getSessionId();

function getSessionId(){
  let id = sessionStorage.getItem(localSessionKey);
  if(!id){ id = crypto.randomUUID(); sessionStorage.setItem(localSessionKey,id); }
  return id;
}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function safeUrl(v=""){try{const u=new URL(v);return ["http:","https:"].includes(u.protocol)?u.href:"";}catch{return "";}}
function toast(message){const el=$("toast");el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,2800);}
function setPublicView(show){$("publicView").hidden=!show;$("adminView").hidden=show;document.querySelector(".site-footer").hidden=!show;}
function openAdmin(){setPublicView(false);history.replaceState(null,"",location.pathname+location.search+"#studio");checkSession();window.scrollTo(0,0);}
function closeAdmin(){setPublicView(true);$("projectDetail").hidden=true;history.replaceState(null,"",location.pathname+location.search);window.scrollTo(0,0);}
$("adminEntry").addEventListener("click",openAdmin);$("closeAdmin").addEventListener("click",closeAdmin);
$("languageToggle").addEventListener("click",()=>{currentLang=currentLang==="en"?"vi":"en";localStorage.setItem("neil-language",currentLang);applyLanguage();});
$("menuToggle").addEventListener("click",()=>{const n=document.querySelector(".main-nav");n.classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",n.classList.contains("open")?"true":"false");});
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".main-nav").classList.remove("open")));
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;renderProjects();});
$("loginForm").addEventListener("submit",signIn);$("logoutButton").addEventListener("click",signOut);
$("projectForm").addEventListener("submit",saveProject);$("resetForm").addEventListener("click",resetEditor);
$("homepageForm").addEventListener("submit",saveHome);$("resetHomepage").addEventListener("click",resetHome);
$("styleTargetInput").addEventListener("change",loadElementStyleInputs);
$("previewElementStyle").addEventListener("click",()=>updateSelectedElementStyle(false));
$("resetElementStyle").addEventListener("click",()=>{updateSelectedElementStyle(true);loadElementStyleInputs();});
["elementFontInput","elementSizeInput","elementColorInput","elementGradientStartInput","elementGradientEndInput","elementGradientEnabledInput"].forEach(id=>$(id).addEventListener("input",()=>updateSelectedElementStyle(false)));
["siteBackgroundInput","siteBackgroundEndInput","siteBackgroundGradientInput"].forEach(id=>$(id).addEventListener("input",()=>{homeSettings={...homeSettings,backgroundColor:$("siteBackgroundInput").value,backgroundEnd:$("siteBackgroundEndInput").value,backgroundGradient:$("siteBackgroundGradientInput").checked};applyElementStyles(homeSettings);}));
$("backToWorks").addEventListener("click",()=>navigateToWorks());
document.querySelectorAll("[data-social]").forEach(a=>{const k=a.dataset.social;if(SITE[k])a.href=SITE[k];});
$("emailLink")?.setAttribute("href",`mailto:${SITE.email}`);
const emailLink=document.querySelector(".email-link");emailLink.href=`mailto:${SITE.email}`;emailLink.textContent=SITE.email.toUpperCase()+" ↗";
$("yearNow").textContent=new Date().getFullYear();
$("projectGrid").addEventListener("click",e=>{const card=e.target.closest("[data-project-id]");if(card && !e.target.closest("a"))openProject(card.dataset.projectId);});
$("projectGrid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-project-id]")){e.preventDefault();openProject(e.target.dataset.projectId);}});
$("adminProjectList").addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(edit)editProject(adminProjects.find(p=>p.id===edit.dataset.edit));if(del)deleteProject(del.dataset.delete);});
$("backToWorks").addEventListener("click",navigateToWorks);
$("closeLightbox").addEventListener("click",closeLightbox);
$("lightboxPrev").addEventListener("click",()=>stepLightbox(-1));
$("lightboxNext").addEventListener("click",()=>stepLightbox(1));
$("lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox")closeLightbox();});
document.addEventListener("keydown",e=>{if($("lightbox")&&!$("lightbox").hidden){if(e.key==="Escape")closeLightbox();if(e.key==="ArrowLeft")stepLightbox(-1);if(e.key==="ArrowRight")stepLightbox(1);}});
window.addEventListener("hashchange",routeFromHash);
if(location.hash==="#studio")openAdmin();else routeFromHash();
loadHome();
loadProjects();

function routeFromHash(){
  if(location.hash==="#studio"){openAdmin();return;}
  const match=location.hash.match(/^#project\/([a-f0-9-]+)$/i);
  if(match){if(projects.length)openProject(match[1],false);return;}
  $("projectDetail").hidden=true;
  $("about").hidden=false;$("works").hidden=false;$("contact").hidden=false;
}
async function loadProjects(){
  if(!supabase){$("projectGrid").innerHTML='<div class="empty-state">Connect Supabase to publish your archive.</div>';$("projectCount").textContent="0 PROJECTS";return;}
  $("projectGrid").innerHTML='<div class="loading-state"><span class="moon-loader" aria-hidden="true"></span></div>';
  try{
    const {data,error}=await supabase.from("projects").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
    if(error)throw error;
    projects=data||[];
    const ids=projects.map(p=>p.id);
    if(ids.length){
      const {data:images,error:imageError}=await supabase.from("project_images").select("*").in("project_id",ids).order("sort_order",{ascending:true});
      if(!imageError){
        const grouped={};(images||[]).forEach(img=>(grouped[img.project_id]??=[]).push(img));
        projects=projects.map(p=>({...p,project_images:grouped[p.id]||[]}));
      }else projects=projects.map(p=>({...p,project_images:[]}));
    }else projects=[];
    renderProjects();routeFromHash();
  }catch(error){
    $("projectGrid").innerHTML='<div class="empty-state">Unable to load projects. Check database permissions and setup.</div>';
    $("projectCount").textContent="0 PROJECTS";console.error("Public projects query failed:",error);
  }
}
function renderProjects(){
  const graphicCategories=["Graphic Design","Brand Identity Design","Marketing & Advertising Design","Packaging Design","Publication Design","Commercial Illustration"];
  const shown=activeFilter==="All"?projects:activeFilter==="Graphic Designer"?projects.filter(p=>graphicCategories.includes(p.category)):projects.filter(p=>p.category===activeFilter);
  const subfilters=$("graphicSubfilters");if(subfilters)subfilters.hidden=activeFilter!=="Graphic Designer"&&!graphicCategories.includes(activeFilter);
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===activeFilter));
  $("projectCount").textContent=`${String(projects.length).padStart(2,"0")} PROJECTS`;
  if(!shown.length){$("projectGrid").innerHTML=`<div class="empty-state">${projects.length?tr("none"):tr("empty")}</div>`;return;}
  $("projectGrid").innerHTML=shown.map(p=>{
    const img=p.thumbnail_url||p.image_url||"";
    const cover=img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy">`:'<div class="cover-placeholder">M / O</div>';
    const link=safeUrl(p.external_url||"");
    return `<article class="project-card" data-project-id="${escapeHtml(p.id)}" tabindex="0" role="link" aria-label="Open ${escapeHtml(p.title)}">
      <div class="project-cover">${cover}</div><div class="project-meta"><span>${escapeHtml(p.category||"Selected work")}</span><span>${escapeHtml(p.year||"")}</span></div>
      <h3 class="project-title">${escapeHtml(p.title)}</h3><p class="project-description">${escapeHtml(p.description||"")}</p>
      ${link?`<span class="project-open">${tr("projectOpen")}</span>`:`<span class="project-open">${tr("projectExplore")}</span>`}
    </article>`;
  }).join("");
}
async function trackEvent(eventType,projectId=null){
  if(!supabase)return;
  try{await supabase.from("portfolio_analytics").insert({event_type:eventType,project_id:projectId,session_id:sessionId,referrer:document.referrer||null,page_path:location.pathname+location.hash});}catch(e){console.debug("Analytics event not recorded",e);}
}
function openProject(id,updateHash=true){
  const p=projects.find(x=>x.id===id);if(!p)return;
  currentDetail=p;$("projectDetail").hidden=false;
  $("about").hidden=true;$("works").hidden=true;$("contact").hidden=true;
  const images=(p.project_images||[]).map(x=>x.image_url).filter(Boolean);
  const cover=p.thumbnail_url||p.image_url||images[0]||"";
  const gallery=images.length?images:(cover?[cover]:[]);
  const video=videoEmbed(p.video_url||"");
  const layout=["editorial","full-bleed","gallery-first","split"].includes(p.layout_style)?p.layout_style:"editorial";
  const detailText=(p.detail_content||"").trim();
  const detailCopy=detailText?`<div class="project-story">${detailText.split(/\\n\\s*\\n/).map(paragraph=>`<p>${escapeHtml(paragraph).replace(/\\n/g,"<br>")}</p>`).join("")}</div>`:"";
  const top=`<div class="detail-top"><div><div class="section-index"><span>PROJECT</span><span>${escapeHtml(p.category||"Selected work")} / ${escapeHtml(p.year||"")}</span></div><h1>${escapeHtml(p.title)}</h1></div><p>${escapeHtml(p.description||"")}</p></div>`;
  const hero=cover?`<img class="detail-hero" src="${escapeHtml(cover)}" alt="${escapeHtml(p.title)}">`:"";
  const media=video?`<div class="detail-video">${video}</div>`:"";
  const galleryBlock=gallery.length?`<div class="gallery-heading"><h3>${tr("gallery")}</h3><span class="mono">${String(gallery.length).padStart(2,"0")} ${tr("galleryHint")}</span></div><div class="detail-gallery">${gallery.map((src,i)=>`<button class="gallery-thumb" data-gallery-index="${i}" aria-label="View image ${i+1}"><img src="${escapeHtml(src)}" alt="${escapeHtml(p.title)} — image ${i+1}" loading="lazy"></button>`).join("")}</div>`:"";
  $("detailContent").className="detail-content layout-"+layout;
  $("detailContent").innerHTML=layout==="full-bleed"?`${hero}${top}${detailCopy}${media}${galleryBlock}`:
    layout==="gallery-first"?`${top}${galleryBlock}${hero}${detailCopy}${media}`:
    layout==="split"?`<div class="detail-split">${top}${hero}</div>${detailCopy}${media}${galleryBlock}`:
    `${top}${hero}${detailCopy}${media}${galleryBlock}`;
  if(safeUrl(p.external_url||""))$("detailContent").insertAdjacentHTML("beforeend",`<a class="project-open" href="${escapeHtml(safeUrl(p.external_url))}" target="_blank" rel="noopener noreferrer">${tr("external")}</a>`);
  $("detailContent").querySelectorAll("[data-gallery-index]").forEach(b=>b.addEventListener("click",()=>openLightbox(gallery,Number(b.dataset.galleryIndex),p.title)));
  if(updateHash)history.pushState(null,"",`#project/${p.id}`);
  trackEvent("project_view",p.id);
  window.scrollTo({top:0,behavior:"smooth"});
}
function videoEmbed(url){
  if(!url)return "";
  const safe=safeUrl(url);if(!safe)return "";
  let u;
  try{u=new URL(safe);}catch{return "";}
  let embed="";
  if(u.hostname.includes("youtube.com")){const id=u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop();if(id)embed=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;}
  else if(u.hostname==="youtu.be"){embed=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(u.pathname.slice(1))}`;}
  else if(u.hostname.includes("vimeo.com")){const id=u.pathname.split("/").filter(Boolean).pop();if(id)embed=`https://player.vimeo.com/video/${encodeURIComponent(id)}`;}
  if(embed)return `<iframe src="${embed}" title="Project showreel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  if(/\.(mp4|webm|ogg)(\?.*)?$/i.test(safe))return `<video controls playsinline preload="metadata"><source src="${escapeHtml(safe)}"></video>`;
  return "";
}
function navigateToWorks(){
  $("projectDetail").hidden=true;$("about").hidden=false;$("works").hidden=false;$("contact").hidden=false;
  history.pushState(null,"",location.pathname+location.search+"#works");$("works").scrollIntoView({behavior:"smooth"});
}
function openLightbox(items,index,title){
  lightboxItems=items;lightboxIndex=index;$("lightboxTitle").textContent=title||"Gallery";$("lightbox").hidden=false;document.body.style.overflow="hidden";renderLightbox();
}
function renderLightbox(){
  $("lightboxImage").src=lightboxItems[lightboxIndex];$("lightboxCounter").textContent=`${String(lightboxIndex+1).padStart(2,"0")} / ${String(lightboxItems.length).padStart(2,"0")}`;
}
function stepLightbox(delta){lightboxIndex=(lightboxIndex+delta+lightboxItems.length)%lightboxItems.length;renderLightbox();}
function closeLightbox(){$("lightbox").hidden=true;document.body.style.overflow="";}
async function checkSession(){
  if(!supabase){$("authMessage").textContent="Chưa cấu hình Supabase. Điền URL và anon key trong config.js, sau đó chạy supabase-schema.sql.";return;}
  const {data}=await supabase.auth.getSession();if(data.session)await showDashboard();else{$("authPanel").hidden=false;$("dashboard").hidden=true;}
}
async function signIn(e){
  e.preventDefault();if(!supabase)return toast("Configure Supabase first.");
  $("authMessage").textContent="Signing in…";
  const {error}=await supabase.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});
  if(error){$("authMessage").textContent="Sign-in failed. Check your credentials.";return;}
  $("adminPassword").value="";await showDashboard();
}
async function signOut(){if(supabase)await supabase.auth.signOut();$("dashboard").hidden=true;$("authPanel").hidden=false;toast("Signed out.");}
async function showDashboard(){
  const {data:{user}}=await supabase.auth.getUser();if(!user)return;
  const {data:role,error}=await supabase.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
  if(error||!role){await supabase.auth.signOut();$("authMessage").textContent="This account is not authorized as an administrator.";$("authPanel").hidden=false;$("dashboard").hidden=true;return;}
  $("authPanel").hidden=true;$("dashboard").hidden=false;await loadHome();fillHomeForm();await loadAdminProjects();await loadAnalytics();
}
async function loadAdminProjects(){
  const container=$("adminProjectList");
  container.innerHTML='<div class="loading-state admin-loading"><span class="moon-loader" aria-hidden="true"></span></div>';
  try{
    const {data,error}=await supabase.from("projects").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
    if(error)throw error;
    const list=data||[];adminProjects=list.map(p=>({...p,project_images:[]}));
    const ids=list.map(p=>p.id);
    if(ids.length){
      const {data:images,error:imageError}=await supabase.from("project_images").select("project_id").in("project_id",ids);
      if(!imageError){
        const counts={};(images||[]).forEach(img=>counts[img.project_id]=(counts[img.project_id]||0)+1);
        adminProjects=adminProjects.map(p=>({...p,gallery_count:counts[p.id]||0}));
      }
    }
    $("adminCount").textContent=`${list.length} ITEMS`;
    container.innerHTML=list.map(p=>{
      const count=(adminProjects.find(x=>x.id===p.id)||{}).gallery_count||0;
      return `<div class="admin-project">
        ${p.thumbnail_url||p.image_url?`<img class="admin-thumb" src="${escapeHtml(p.thumbnail_url||p.image_url)}" alt="">`:'<div class="admin-thumb"></div>'}
        <div class="admin-project-info"><strong>${escapeHtml(p.title||"Untitled project")}</strong><span>${escapeHtml(p.category||"Uncategorized")} · ${escapeHtml(p.year||"")} · ORDER ${p.sort_order||0}</span></div>
        <div class="admin-actions"><button type="button" data-edit="${p.id}">Edit</button><button type="button" data-delete="${p.id}">Delete</button></div>
        <div class="admin-project-extra">${count} gallery images ${p.video_url?"· SHOWREEL":""}</div>
      </div>`;
    }).join("")||'<p class="form-message">No projects published yet.</p>';
  }catch(error){
    container.innerHTML='<p class="form-message admin-error">Could not load published projects. '+escapeHtml(error.message||"Check the projects table permissions.")+'</p>';
    $("adminCount").textContent="—";console.error("Studio projects query failed:",error);
  }
}
function editProject(p){
  if(!p)return;$("projectId").value=p.id;$("title").value=p.title;$("category").value=p.category;$("year").value=p.year||"";
  $("externalUrl").value=p.external_url||"";$("description").value=p.description||"";
  $("detailContentInput").value=p.detail_content||"";$("layoutStyleInput").value=p.layout_style||"editorial";
  $("sortOrder").value=p.sort_order||0;$("videoUrl").value=p.video_url||"";$("coverImage").value="";$("galleryImages").value="";
  $("saveProject").textContent="Update project ↗";$("editorMessage").textContent="Editing project. Upload a new thumbnail to replace the current one; existing gallery images are retained.";
  window.scrollTo({top:0,behavior:"smooth"});
}
function resetEditor(){
  $("projectForm").reset();$("projectId").value="";$("year").value="2026";$("sortOrder").value="0";
  $("saveProject").textContent="Publish project ↗";$("editorMessage").textContent="";
}
async function uploadImage(file,folder){
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>8*1024*1024)throw new Error("Images must be JPG, PNG or WebP and under 8 MB each.");
  const ext=file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
  const path=`${folder}/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from("portfolio-covers").upload(path,file,{upsert:false,contentType:file.type});
  if(error)throw error;
  const {data:{publicUrl}}=supabase.storage.from("portfolio-covers").getPublicUrl(path);
  return {image_url:publicUrl,image_path:path};
}
async function saveProject(e){
  e.preventDefault();if(!supabase)return;
  $("saveProject").disabled=true;$("editorMessage").textContent="Uploading and saving…";
  try{
    const id=$("projectId").value;
    const payload={title:$("title").value.trim(),category:$("category").value,year:$("year").value.trim(),external_url:safeUrl($("externalUrl").value.trim())||null,description:$("description").value.trim(),detail_content:$("detailContentInput").value.trim(),layout_style:$("layoutStyleInput").value,sort_order:Number($("sortOrder").value)||0,video_url:safeUrl($("videoUrl").value.trim())||null};
    const cover=$("coverImage").files[0];if(cover){const img=await uploadImage(cover,"thumbnails");payload.thumbnail_url=img.image_url;payload.thumbnail_path=img.image_path;}
    let saved;
    if(id){const {data,error}=await supabase.from("projects").update(payload).eq("id",id).select().single();if(error)throw error;saved=data;}
    else{const {data,error}=await supabase.from("projects").insert(payload).select().single();if(error)throw error;saved=data;}
    const galleryFiles=[...$("galleryImages").files];
    for(let i=0;i<galleryFiles.length;i++){const img=await uploadImage(galleryFiles[i],`gallery/${saved.id}`);const {error}=await supabase.from("project_images").insert({project_id:saved.id,image_url:img.image_url,image_path:img.image_path,sort_order:i});if(error)throw error;}
    resetEditor();$("editorMessage").textContent="Project saved.";await loadProjects();await loadAdminProjects();toast("Project published.");
  }catch(err){$("editorMessage").textContent=err.message||"Unable to save project.";}
  finally{$("saveProject").disabled=false;}
}
async function deleteProject(id){
  if(!confirm("Delete this project and its gallery records?"))return;
  const {error}=await supabase.from("projects").delete().eq("id",id);if(error)return toast("Delete failed.");
  await loadProjects();await loadAdminProjects();toast("Project deleted.");
}
async function loadAnalytics(){
  const since=new Date(Date.now()-30*86400000).toISOString();
  const {data,error}=await supabase.from("portfolio_analytics").select("event_type,project_id,session_id,created_at").gte("created_at",since).order("created_at",{ascending:false}).limit(5000);
  if(error){$("analyticsSummary").innerHTML='<div class="analytics-card"><span>Analytics setup required</span></div>';return;}
  const rows=data||[],views=rows.filter(x=>x.event_type==="page_view").length,projectViews=rows.filter(x=>x.event_type==="project_view").length,unique=new Set(rows.map(x=>x.session_id).filter(Boolean)).size;
  $("analyticsSummary").innerHTML=`<div class="analytics-card"><strong>${views}</strong><span>Page views / 30d</span></div><div class="analytics-card"><strong>${projectViews}</strong><span>Project views / 30d</span></div><div class="analytics-card"><strong>${unique}</strong><span>Sessions / 30d*</span></div>`;
  const counts={};rows.filter(x=>x.event_type==="project_view").forEach(x=>counts[x.project_id]=(counts[x.project_id]||0)+1);
  $("analyticsList").innerHTML=adminProjects.map(p=>`<div class="analytics-row"><span>${escapeHtml(p.title)}</span><strong>${counts[p.id]||0} views</strong></div>`).join("")||'<p class="form-message">No traffic data yet.</p>';
}
trackEvent("page_view");

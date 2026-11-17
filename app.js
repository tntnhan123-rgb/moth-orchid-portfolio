import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SITE } from "./config.js";

const $ = id => document.getElementById(id);
const configured = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
let projects = [], activeFilter = "All", currentDetail = null, lightboxItems = [], lightboxIndex = 0;

const HOME_DEFAULTS={heroEyebrow:"Selected works",heroTitle:"MOTH / ORCHID",heroIntro:"A visual practice exploring the tension between the organic and the artificial — through image, identity, motion and atmosphere.",heroButton:"Explore the archive",aboutHeading:"Between form and feeling.",aboutLead:"Building visual languages at the intersection of design, atmosphere and storytelling.",aboutParagraph1:"I work across graphic design, visual identity and digital imagery. Drawn to cinematic contrast, botanical structures, tactile surfaces and details that reward a closer look.",aboutParagraph2:"This portfolio is a living archive of selected commissions, self-initiated studies and ongoing experiments.",worksHeading:"Selected works",contactEyebrow:"Have a project?",contactText:"Available for selected freelance projects, collaborations and creative opportunities.",font:"Montserrat",scale:"1",textColor:"#ece9e3",mutedColor:"#999999"};
const HOME_INPUTS={homeEyebrowInput:"heroEyebrow",homeTitleInput:"heroTitle",homeIntroInput:"heroIntro",homeButtonInput:"heroButton",aboutHeadingInput:"aboutHeading",aboutLeadInput:"aboutLead",aboutParagraph1Input:"aboutParagraph1",aboutParagraph2Input:"aboutParagraph2",worksHeadingInput:"worksHeading",contactEyebrowInput:"contactEyebrow",contactTextInput:"contactText"};
let homeSettings={...HOME_DEFAULTS};
function applyHome(s){s={...HOME_DEFAULTS,...s};const put=(id,v)=>{const el=$(id);if(el)el.textContent=v||"";};Object.entries({homeEyebrow:"heroEyebrow",homeTitle:"heroTitle",homeIntro:"heroIntro",homeButtonText:"heroButton",aboutHeading:"aboutHeading",aboutLead:"aboutLead",aboutParagraph1:"aboutParagraph1",aboutParagraph2:"aboutParagraph2",worksHeading:"worksHeading",contactEyebrow:"contactEyebrow",contactText:"contactText"}).forEach(([id,key])=>put(id,s[key]));document.documentElement.style.setProperty("--site-font",s.font==="Arial"?"Arial, sans-serif":'"'+s.font+'", sans-serif');document.documentElement.style.setProperty("--type-scale",String(Number(s.scale)||1));document.documentElement.style.setProperty("--text-color",s.textColor||"#ece9e3");document.documentElement.style.setProperty("--muted-text-color",s.mutedColor||"#999999");homeSettings=s;}
async function loadHome(){if(!supabase){applyHome(HOME_DEFAULTS);return;}const {data,error}=await supabase.from("site_settings").select("settings").eq("id","homepage").maybeSingle();if(error){console.warn("Homepage settings unavailable",error);applyHome(HOME_DEFAULTS);return;}applyHome(data?.settings||HOME_DEFAULTS);}
function fillHomeForm(){Object.entries(HOME_INPUTS).forEach(([id,key])=>$(id).value=homeSettings[key]||"");$("siteFontInput").value=homeSettings.font||"Montserrat";$("siteScaleInput").value=homeSettings.scale||"1";$("siteTextColorInput").value=homeSettings.textColor||"#ece9e3";$("siteMutedColorInput").value=homeSettings.mutedColor||"#999999";}
async function saveHome(e){e.preventDefault();const settings={};Object.entries(HOME_INPUTS).forEach(([id,key])=>settings[key]=$(id).value.trim());settings.font=$("siteFontInput").value;settings.scale=$("siteScaleInput").value;settings.textColor=$("siteTextColorInput").value;settings.mutedColor=$("siteMutedColorInput").value;$("saveHomepage").disabled=true;$("homepageMessage").textContent="Saving…";try{const {error}=await supabase.from("site_settings").upsert({id:"homepage",settings,updated_at:new Date().toISOString()},{onConflict:"id"});if(error)throw error;applyHome(settings);$("homepageMessage").textContent="Homepage updated successfully.";toast("Homepage updated.");}catch(err){$("homepageMessage").textContent=err.message||"Unable to save homepage.";}finally{$("saveHomepage").disabled=false;}}
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
$("menuToggle").addEventListener("click",()=>{const n=document.querySelector(".main-nav");n.classList.toggle("open");$("menuToggle").setAttribute("aria-expanded",n.classList.contains("open")?"true":"false");});
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".main-nav").classList.remove("open")));
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProjects();});
$("loginForm").addEventListener("submit",signIn);$("logoutButton").addEventListener("click",signOut);
$("projectForm").addEventListener("submit",saveProject);$("resetForm").addEventListener("click",resetEditor);
$("homepageForm").addEventListener("submit",saveHome);$("resetHomepage").addEventListener("click",resetHome);
$("backToWorks").addEventListener("click",()=>navigateToWorks());
document.querySelectorAll("[data-social]").forEach(a=>{const k=a.dataset.social;if(SITE[k])a.href=SITE[k];});
$("emailLink")?.setAttribute("href",`mailto:${SITE.email}`);
const emailLink=document.querySelector(".email-link");emailLink.href=`mailto:${SITE.email}`;emailLink.textContent=SITE.email.toUpperCase()+" ↗";
$("yearNow").textContent=new Date().getFullYear();
$("projectGrid").addEventListener("click",e=>{const card=e.target.closest("[data-project-id]");if(card && !e.target.closest("a"))openProject(card.dataset.projectId);});
$("projectGrid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-project-id]")){e.preventDefault();openProject(e.target.dataset.projectId);}});
$("adminProjectList").addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(edit)editProject(projects.find(p=>p.id===edit.dataset.edit));if(del)deleteProject(del.dataset.delete);});
$("backToWorks").addEventListener("click",navigateToWorks);
$("closeLightbox").addEventListener("click",closeLightbox);
$("lightboxPrev").addEventListener("click",()=>stepLightbox(-1));
$("lightboxNext").addEventListener("click",()=>stepLightbox(1));
$("lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox")closeLightbox();});
document.addEventListener("keydown",e=>{if($("lightbox")&&!$("lightbox").hidden){if(e.key==="Escape")closeLightbox();if(e.key==="ArrowLeft")stepLightbox(-1);if(e.key==="ArrowRight")stepLightbox(1);}});
window.addEventListener("hashchange",routeFromHash);
if(location.hash==="#studio")openAdmin();else routeFromHash();
loadHome();

function routeFromHash(){
  if(location.hash==="#studio"){openAdmin();return;}
  const match=location.hash.match(/^#project\/([a-f0-9-]+)$/i);
  if(match && projects.length)openProject(match[1],false);
}
async function loadProjects(){
  if(!supabase){$("projectGrid").innerHTML='<div class="empty-state">Connect Supabase to publish your archive.</div>';$("projectCount").textContent="0 PROJECTS";return;}
  const {data,error}=await supabase.from("projects").select("*,project_images(*)").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(error){$("projectGrid").innerHTML='<div class="empty-state">Unable to load projects. Check database setup.</div>';console.error(error);return;}
  projects=(data||[]).map(p=>({...p,project_images:(p.project_images||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))}));
  renderProjects();
  routeFromHash();
}
function renderProjects(){
  const shown=activeFilter==="All"?projects:projects.filter(p=>p.category===activeFilter);
  $("projectCount").textContent=`${String(projects.length).padStart(2,"0")} PROJECTS`;
  if(!shown.length){$("projectGrid").innerHTML=`<div class="empty-state">${projects.length?"No projects in this category yet.":"Selected works will appear here."}</div>`;return;}
  $("projectGrid").innerHTML=shown.map(p=>{
    const img=p.thumbnail_url||p.image_url||"";
    const cover=img?`<img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy">`:'<div class="cover-placeholder">M / O</div>';
    const link=safeUrl(p.external_url||"");
    return `<article class="project-card" data-project-id="${escapeHtml(p.id)}" tabindex="0" role="link" aria-label="Open ${escapeHtml(p.title)}">
      <div class="project-cover">${cover}</div><div class="project-meta"><span>${escapeHtml(p.category||"Selected work")}</span><span>${escapeHtml(p.year||"")}</span></div>
      <h3 class="project-title">${escapeHtml(p.title)}</h3><p class="project-description">${escapeHtml(p.description||"")}</p>
      ${link?`<span class="project-open">Open project details ↗</span>`:`<span class="project-open">Explore project ↗</span>`}
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
  $("detailContent").innerHTML=`
    <div class="detail-top"><div><div class="section-index"><span>PROJECT</span><span>${escapeHtml(p.category||"Selected work")} / ${escapeHtml(p.year||"")}</span></div><h1>${escapeHtml(p.title)}</h1></div><p>${escapeHtml(p.description||"")}</p></div>
    ${cover?`<img class="detail-hero" src="${escapeHtml(cover)}" alt="${escapeHtml(p.title)}">`:""}
    ${video?`<div class="detail-video">${video}</div>`:""}
    ${gallery.length?`<div class="gallery-heading"><h3>Visual archive</h3><span class="mono">${String(gallery.length).padStart(2,"0")} IMAGES · CLICK TO EXPAND</span></div><div class="detail-gallery">${gallery.map((src,i)=>`<button class="gallery-thumb" data-gallery-index="${i}" aria-label="View image ${i+1}"><img src="${escapeHtml(src)}" alt="${escapeHtml(p.title)} — image ${i+1}" loading="lazy"></button>`).join("")}</div>`:""}
    ${safeUrl(p.external_url||"")?`<a class="project-open" href="${escapeHtml(safeUrl(p.external_url))}" target="_blank" rel="noopener noreferrer">Visit external project ↗</a>`:""}`;
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
  const {data,error}=await supabase.from("projects").select("*,project_images(*)").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(error){$("adminProjectList").textContent="Could not load projects.";return;}
  const list=data||[];$("adminCount").textContent=`${list.length} ITEMS`;
  $("adminProjectList").innerHTML=list.map(p=>`<div class="admin-project">
    ${p.thumbnail_url||p.image_url?`<img class="admin-thumb" src="${escapeHtml(p.thumbnail_url||p.image_url)}" alt="">`:'<div class="admin-thumb"></div>'}
    <div class="admin-project-info"><strong>${escapeHtml(p.title)}</strong><span>${escapeHtml(p.category)} · ${escapeHtml(p.year||"")} · ORDER ${p.sort_order||0}</span></div>
    <div class="admin-actions"><button data-edit="${p.id}">Edit</button><button data-delete="${p.id}">Delete</button></div>
    <div class="admin-project-extra">${(p.project_images||[]).length} gallery images ${p.video_url?"· SHOWREEL":""}</div>
  </div>`).join("")||'<p class="form-message">No projects published yet.</p>';
}
function editProject(p){
  if(!p)return;$("projectId").value=p.id;$("title").value=p.title;$("category").value=p.category;$("year").value=p.year||"";
  $("externalUrl").value=p.external_url||"";$("description").value=p.description||"";
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
    const payload={title:$("title").value.trim(),category:$("category").value,year:$("year").value.trim(),external_url:safeUrl($("externalUrl").value.trim())||null,description:$("description").value.trim(),sort_order:Number($("sortOrder").value)||0,video_url:safeUrl($("videoUrl").value.trim())||null};
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
  $("analyticsList").innerHTML=projects.map(p=>`<div class="analytics-row"><span>${escapeHtml(p.title)}</span><strong>${counts[p.id]||0} views</strong></div>`).join("")||'<p class="form-message">No traffic data yet.</p>';
}
trackEvent("page_view");

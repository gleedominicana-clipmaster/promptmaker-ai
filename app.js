const $=id=>document.getElementById(id);
const categoryNames={imagen:"creación de imágenes",video:"creación de videos",chatgpt:"asistente de inteligencia artificial",marketing:"marketing y publicidad",redes:"contenido para redes sociales",negocio:"negocios y emprendimiento",diseno:"diseño gráfico y logos",educacion:"educación y aprendizaje",fotografia:"fotografía profesional",otro:"una tarea personalizada"};
let lastPrompt="";
$("apiUrl").value=localStorage.getItem("promptmaker_api_url")||"";
$("apiUrl").addEventListener("change",()=>localStorage.setItem("promptmaker_api_url",$("apiUrl").value.trim()));
async function buildPrompt(){
 const cat=$("category").value, idea=$("idea").value.trim(), style=$("style").value, detail=$("detail").value, aspect=$("aspect").value, endpoint=$("apiUrl").value.trim().replace(/\/+$/,"");
 if(!idea){$("idea").focus();$("notice").textContent="Primero escribe tu idea.";return;}
 if(!endpoint){$("notice").textContent="Para usar Gemini, primero configura la URL de tu servicio seguro siguiendo INSTRUCCIONES_GEMINI.txt.";return;}
 $("generate").disabled=true;$("generate").textContent="Gemini está creando tu prompt…";$("notice").textContent="Conectando con Gemini. Espera un momento.";
 try{
  const res=await fetch(endpoint+"/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idea,category:categoryNames[cat],style,detail,aspect})});
  const data=await res.json();if(!res.ok)throw new Error(data.error||"No se pudo completar la solicitud.");
  lastPrompt=data.prompt||"";if(!lastPrompt)throw new Error("Gemini no devolvió un prompt.");
  $("result").value=lastPrompt;$("resultWrap").classList.remove("hidden");$("notice").textContent="✓ Prompt creado con Gemini."; $("resultWrap").scrollIntoView({behavior:"smooth",block:"start"});
 }catch(e){$("notice").textContent="Error: "+e.message+" Revisa la URL del Worker y que esté publicado.";}
 finally{$("generate").disabled=false;$("generate").textContent="✦ Crear con inteligencia artificial";}
}
$("generate").addEventListener("click",buildPrompt);
$("category").addEventListener("change",()=>{$("imageOptions").classList.toggle("hidden",!["imagen","video","fotografia","diseno"].includes($("category").value));});
$("copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(lastPrompt);$("notice").textContent="✓ Prompt copiado.";}catch(e){$("result").select();document.execCommand("copy");$("notice").textContent="✓ Prompt copiado.";}});
function getSaved(){try{return JSON.parse(localStorage.getItem("promptmaker_saved")||"[]")}catch(e){return []}}
function setSaved(a){localStorage.setItem("promptmaker_saved",JSON.stringify(a));renderSaved()}
$("save").addEventListener("click",()=>{if(!lastPrompt)return;let a=getSaved();if(a.some(x=>x.text===lastPrompt)){$("notice").textContent="Este prompt ya está guardado.";return;}a.unshift({id:Date.now(),cat:categoryNames[$("category").value],text:lastPrompt});setSaved(a);$("notice").textContent="♡ Prompt guardado en este dispositivo."});
function renderSaved(){const a=getSaved();$("savedCount").textContent=a.length;$("savedList").innerHTML="";if(!a.length){$("savedList").innerHTML='<p class="empty">Todavía no has guardado prompts.</p>';return;}a.forEach(item=>{const el=document.createElement("article");el.className="savedItem";const h=document.createElement("strong");h.textContent=item.cat;const p=document.createElement("p");p.textContent=item.text;const row=document.createElement("div");row.className="mini";const c=document.createElement("button");c.textContent="Copiar";c.onclick=async()=>{try{await navigator.clipboard.writeText(item.text);c.textContent="Copiado ✓";}catch(e){p.textContent=item.text;}};const d=document.createElement("button");d.textContent="Eliminar";d.onclick=()=>setSaved(getSaved().filter(x=>x.id!==item.id));row.append(c,d);el.append(h,p,row);$("savedList").append(el);})}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));$("crear").classList.toggle("hidden",b.dataset.tab!=="crear");$("guardados").classList.toggle("hidden",b.dataset.tab!=="guardados");if(b.dataset.tab==="guardados")renderSaved()}));
$("clearSaved").addEventListener("click",()=>{if(confirm("¿Borrar todos los prompts guardados?"))setSaved([])});
renderSaved();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

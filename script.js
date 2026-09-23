const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(Math.max(0,n||0));

/* Mobile menu */
$("#menuToggle").addEventListener("click",()=>{
  const open=$("#navLinks").classList.toggle("show");
  $("#menuToggle").setAttribute("aria-expanded",open);
});
$$(".nav-links a").forEach(a=>a.addEventListener("click",()=>$("#navLinks").classList.remove("show")));

/* Reading progress + back to top */
function scrollUI(){
  const max=document.documentElement.scrollHeight-innerHeight;
  $("#progressBar").style.width=(max>0?(scrollY/max)*100:0)+"%";
  $("#backTop").classList.toggle("show",scrollY>600);
}
addEventListener("scroll",scrollUI,{passive:true}); scrollUI();
$("#backTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});

/* Timeline accordion */
$$(".day-trigger").forEach(btn=>btn.addEventListener("click",()=>{
  const card=btn.closest(".day-card"), isOpen=card.classList.contains("open");
  $$(".day-card").forEach(c=>{c.classList.remove("open");c.querySelector(".day-trigger").setAttribute("aria-expanded","false")});
  if(!isOpen){card.classList.add("open");btn.setAttribute("aria-expanded","true")}
}));

/* Reveal animations */
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12});
$$(".reveal").forEach(e=>observer.observe(e));

/* Gallery lightbox */
const items=$$(".gallery-item"), lb=$("#lightbox"), lbImg=$("#lbImage"), lbCaption=$("#lbCaption");
let current=0;
function showLightbox(i){
  current=(i+items.length)%items.length;
  const img=items[current].querySelector("img");
  lbImg.src=img.src;lbImg.alt=img.alt;lbCaption.textContent=items[current].querySelector("span").textContent;
  lb.classList.add("show");lb.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}
function closeLightbox(){lb.classList.remove("show");lb.setAttribute("aria-hidden","true");document.body.style.overflow=""}
items.forEach((it,i)=>it.addEventListener("click",()=>showLightbox(i)));
$("#lbClose").onclick=closeLightbox;$("#lbPrev").onclick=()=>showLightbox(current-1);$("#lbNext").onclick=()=>showLightbox(current+1);
addEventListener("keydown",e=>{if(!lb.classList.contains("show"))return;if(e.key==="Escape")closeLightbox();if(e.key==="ArrowLeft")showLightbox(current-1);if(e.key==="ArrowRight")showLightbox(current+1)});

/* Budget calculator */
const val=id=>Number($("#"+id)?.value)||0;
function calcBudget(){
  const people=val("adults")+val("kids");
  const hotel=val("hotelPrice");
  const flights=val("flightPrice");
  const activities=$$(".activity:checked").reduce((s,x)=>s+Number(x.dataset.price||0),0);
  /* Guatapé: cada valor (data-pp) es por persona y se multiplica por los viajeros */
  const guatape=$$(".guatape:checked").reduce((s,x)=>s+Number(x.dataset.pp||0)*people,0);
  const transport=val("transportCost"), food=val("foodPrice");
  const total=hotel+flights+activities+guatape+transport+food;
  $("#hotelTotal").textContent=money(hotel);$("#flightTotal").textContent=money(flights);
  $("#activityTotal").textContent=money(activities);$("#guatapeTotal").textContent=money(guatape);
  $("#transportTotal").textContent=money(transport);
  $("#foodTotal").textContent=money(food);$("#grandTotal").textContent=money(total);
  $("#perPerson").textContent=money(people?total/people:0);
}
$$(".budget-form input").forEach(el=>el.addEventListener("input",calcBudget));
calcBudget();

/* Clima: mes a mes */
const rainLabel=["Menos lluvia","Lluvia moderada","Más lluvia"];
const rainPlan=[
  "buen momento para Comuna 13, el Jardín Botánico y la subida a la Piedra. Aun así, lleva una chaqueta fina.",
  "deja lo de aire libre para la mañana y las visitas bajo techo (Museo de Antioquia, Parque Explora) para la tarde.",
  "lleva paraguas compacto e impermeable, usa Parque Explora y el Museo de Antioquia como plan B y sube la Piedra a primera hora."
];
const months=[
  {n:"Enero",l:0,t:"Temporada seca: días soleados y noches más frescas. Es uno de los mejores momentos del año para visitar."},
  {n:"Febrero",l:0,t:"Continúa la temporada seca, con buena probabilidad de cielos despejados por la mañana."},
  {n:"Marzo",l:1,t:"Mes de transición: empiezan a subir los aguaceros, pero todavía hay muchos días soleados."},
  {n:"Abril",l:2,t:"Primera temporada fuerte de lluvias. Las tardes lluviosas son frecuentes; las mañanas suelen dar tregua."},
  {n:"Mayo",l:2,t:"Uno de los meses más lluviosos del año. Los paisajes se ven muy verdes, pero conviene ir preparado."},
  {n:"Junio",l:1,t:"Baja la intensidad de las lluvias frente a mayo. Suele haber buenos días para salir."},
  {n:"Julio",l:0,t:"Época más seca del segundo semestre: días soleados y buena visibilidad de la ciudad."},
  {n:"Agosto",l:0,t:"Se mantiene seco y soleado, con buena visibilidad desde miradores como el Pueblito Paisa."},
  {n:"Septiembre",l:1,t:"Las lluvias regresan poco a poco. Empieza el camino hacia la segunda temporada de lluvias."},
  {n:"Octubre",l:2,t:"Junto con mayo, uno de los meses más lluviosos. Los aguaceros de la tarde son la norma."},
  {n:"Noviembre",l:2,t:"Sigue la segunda temporada de lluvias, con humedad alta, sobre todo en zonas de montaña."},
  {n:"Diciembre",l:0,t:"Vuelve la temporada seca. Es temporada alta de turismo: reserva con tiempo."}
];
function showMonth(i){
  const m=months[i];
  $$("#monthChips .month-chip").forEach((b,k)=>{b.classList.toggle("active",k===i);b.setAttribute("aria-pressed",k===i)});
  $("#monthDetail").innerHTML=`<div class="md-top"><h4>${m.n}</h4><span class="rain-badge rain-${m.l}">${rainLabel[m.l]}</span></div><div class="meter rain-${m.l}" aria-hidden="true">${[0,1,2].map(k=>`<i class="${k<=m.l?"on":""}"></i>`).join("")}</div><p>${m.t}</p><p class="md-plan"><b>Para tu itinerario:</b> ${rainPlan[m.l]}</p>`;
}
const monthChips=$("#monthChips");
if(monthChips){
  months.forEach((m,i)=>{
    const b=document.createElement("button");
    b.type="button";b.className="month-chip rain-"+m.l;b.textContent=m.n.slice(0,3);b.setAttribute("aria-label",m.n);
    b.addEventListener("click",()=>showMonth(i));
    monthChips.appendChild(b);
  });
  showMonth(new Date().getMonth());
}

/* Modal */
const modal=$("#modal");
$$("[data-modal]").forEach(b=>b.addEventListener("click",()=>{modal.classList.add("show");modal.setAttribute("aria-hidden","false")}));
function closeModal(){modal.classList.remove("show");modal.setAttribute("aria-hidden","true")}
$("#modalClose").onclick=closeModal;modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

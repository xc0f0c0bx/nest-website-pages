(function(){
  "use strict";
  var root=document.documentElement; root.classList.add("js");
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp=function(v,a,b){return Math.min(b===undefined?1:b,Math.max(a===undefined?0:a,v));};
  var ease=function(t){return t<=0?0:t>=1?1:1-Math.pow(2,-10*t);};
  var seg=function(p,a,b){return clamp((p-a)/(b-a));};

  /* ---- Menü ---- */
  var nav=document.getElementById("nav"), kn=document.getElementById("menue");
  if(kn&&nav){
    kn.addEventListener("click",function(){var o=nav.classList.toggle("offen");kn.setAttribute("aria-expanded",String(o));});
    nav.addEventListener("click",function(e){if(e.target.tagName==="A"){nav.classList.remove("offen");kn.setAttribute("aria-expanded","false");}});
  }

  /* ---- Projektmappe und Rechtstexte als Dialog (aus dem Onepager) ---- */
  var nn=function(i){return (i<10?"0":"")+i;};
  var ersetzeHash=function(h){try{history.replaceState(null,"",location.pathname+location.search+(h||""));}catch(e){}};
  function oeffneDialog(d){
    [].forEach.call(document.querySelectorAll("dialog[open]"),function(o){if(o!==d)o.close();});
    if(!d.open){if(d.showModal)d.showModal();else d.setAttribute("open","");root.classList.add("gesperrt");}
    d.scrollTop=0;
  }
  [].forEach.call(document.querySelectorAll("dialog.mappe"),function(d){
    d.addEventListener("close",function(){if(!document.querySelector("dialog[open]")){root.classList.remove("gesperrt");ersetzeHash("");}});
    [].forEach.call(d.querySelectorAll("[data-zu]"),function(b){b.addEventListener("click",function(){d.close();});});
  });

  function zeigeBild(d,i){
    var g=d.querySelector(".galerie"),ds=g?[].slice.call(g.querySelectorAll(".daumen button")):[],n=ds.length;
    if(!n)return;
    i=((i%n)+n)%n;var b=ds[i],img=g.querySelector(".buehne-bild img"),cap=g.querySelector("figcaption>span:first-child");
    img.src=b.dataset.src;img.width=+b.dataset.w;img.height=+b.dataset.h;img.alt=b.dataset.cap;
    cap.textContent="";var ab=document.createElement("span");ab.className="mono";ab.textContent=g.dataset.abb+" "+nn(i+1);cap.appendChild(ab);cap.appendChild(document.createTextNode(" "+b.dataset.cap));
    g.querySelector(".zaehler").textContent=nn(i+1)+" / "+nn(n);
    ds.forEach(function(x,k){x.setAttribute("aria-current",k===i?"true":"false");});
    g.dataset.nr=i;
  }
  [].forEach.call(document.querySelectorAll("dialog.mappe .galerie"),function(g){
    var d=g.closest("dialog");
    [].forEach.call(g.querySelectorAll(".daumen button"),function(b){b.addEventListener("click",function(){zeigeBild(d,+b.dataset.nr);});});
    var z=g.querySelector(".blaettern.zurueck"),v=g.querySelector(".blaettern.vor");
    if(z)z.addEventListener("click",function(){zeigeBild(d,(+g.dataset.nr||0)-1);});
    if(v)v.addEventListener("click",function(){zeigeBild(d,(+g.dataset.nr||0)+1);});
    d.addEventListener("keydown",function(e){if(e.key==="ArrowRight")zeigeBild(d,(+g.dataset.nr||0)+1);if(e.key==="ArrowLeft")zeigeBild(d,(+g.dataset.nr||0)-1);});
  });

  function oeffneProjekt(id){
    var d=document.getElementById("projekt-"+id);if(!d||d.tagName!=="DIALOG")return;
    oeffneDialog(d);zeigeBild(d,0);ersetzeHash("#projekt-"+id);
    var zu=d.querySelector("[data-zu]");if(zu)zu.focus();
  }
  var rdlg=document.getElementById("recht");
  function zeigeReiter(id){
    [].forEach.call(rdlg.querySelectorAll("[data-reiter]"),function(b){var an=b.dataset.reiter===id;b.setAttribute("aria-selected",String(an));b.tabIndex=an?0:-1;document.getElementById("blatt-"+b.dataset.reiter).hidden=!an;});
  }
  function oeffneRecht(id){
    if(!rdlg||!document.getElementById("blatt-"+id))return;
    oeffneDialog(rdlg);zeigeReiter(id);ersetzeHash("#"+id);
    var b=rdlg.querySelector('[data-reiter="'+id+'"]');if(b)b.focus();
  }
  if(rdlg){
    [].forEach.call(rdlg.querySelectorAll("[data-reiter]"),function(b){b.addEventListener("click",function(){zeigeReiter(b.dataset.reiter);ersetzeHash("#"+b.dataset.reiter);rdlg.scrollTop=0;});});
    rdlg.querySelector("[role=tablist]").addEventListener("keydown",function(e){
      if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;
      var bs=[].slice.call(rdlg.querySelectorAll("[data-reiter]")),k=bs.indexOf(document.activeElement);if(k<0)return;
      var n=bs[(k+(e.key==="ArrowRight"?1:-1)+bs.length)%bs.length];n.click();n.focus();
    });
  }
  document.addEventListener("click",function(e){
    if(!e.target.closest)return;
    var p=e.target.closest("[data-projekt]");if(p){e.preventDefault();oeffneProjekt(p.dataset.projekt);return;}
    var r=e.target.closest("[data-recht]");if(r&&rdlg){e.preventDefault();oeffneRecht(r.dataset.recht);}
  });
  function ausHash(){
    var m=/^#projekt-([a-z0-9-]+)$/.exec(location.hash);if(m){oeffneProjekt(m[1]);return;}
    var r=/^#(impressum|agb|datenschutz)$/.exec(location.hash);if(r)oeffneRecht(r[1]);
  }
  addEventListener("hashchange",ausHash);ausHash();

  /* ---- Methode: Weg füllt sich ---- */
  var weg=document.getElementById("weg");
  if(weg){
    var knoten=[].slice.call(weg.children);
    var up=function(){var r=weg.getBoundingClientRect(),h=innerHeight;var p=clamp((h*.78-r.top)/(r.height+h*.1));
      weg.style.setProperty("--p",reduce?1:p.toFixed(3));
      knoten.forEach(function(li,i){li.classList.toggle("erreicht",reduce||p>=(i/ knoten.length)+.04);});};
    up();var tt=false;addEventListener("scroll",function(){if(!tt){tt=true;requestAnimationFrame(function(){up();tt=false;});}},{passive:true});addEventListener("resize",up);
  }

  /* ---- Einblenden ---- */
  var rv=[].slice.call(document.querySelectorAll(".rv"));
  if("IntersectionObserver" in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("sicht");io.unobserve(e.target);}});},{rootMargin:"0px 0px -8% 0px",threshold:.06});
    rv.forEach(function(el){io.observe(el);});
    setTimeout(function(){rv.forEach(function(el){el.classList.add("sicht");});},4500);
  }else{rv.forEach(function(el){el.classList.add("sicht");});}

  /* ---- Werkzeuge: immer nur eines offen ---- */
  var ws=[].slice.call(document.querySelectorAll(".werkzeuge details"));
  ws.forEach(function(d){d.addEventListener("toggle",function(){if(d.open)ws.forEach(function(o){if(o!==d)o.open=false;});});});

  /* ---- Matterport erst nach Klick laden ---- */
  [].slice.call(document.querySelectorAll(".scan")).forEach(function(box){
    var kn=box.querySelector(".scan-knopf");if(!kn)return;
    kn.addEventListener("click",function(){
      var f=document.createElement("iframe");f.src=box.dataset.src;f.title=box.dataset.titel;f.allowFullscreen=true;
      f.setAttribute("allow","autoplay; fullscreen; web-share; xr-spatial-tracking");f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
      box.insertBefore(f,kn);box.classList.add("geladen");f.focus();
    });
  });

  /* ---- Rolle aus Link ins Formular ---- */
  [].slice.call(document.querySelectorAll("[data-rolle]")).forEach(function(a){a.addEventListener("click",function(){var s=document.getElementById("rolle");if(s)s.value=a.dataset.rolle;});});
})();

/* Regler-Panel nur lokal mit ?tweak */
if(/[?&]tweak\b/.test(location.search)){var tw=document.createElement("script");tw.src="/tweak/tweak.js";document.head.appendChild(tw);}

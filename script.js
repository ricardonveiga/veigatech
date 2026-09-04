/* ==========================================================================
   VEIGATECH — cinematic interactions
   ========================================================================== */
(function(){
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover:none), (max-width:900px)").matches;

  gsap.registerPlugin(ScrollTrigger);

  var navEl = document.querySelector("[data-nav]");
  gsap.set(navEl, { yPercent: -140 });

  /* ---------------------------------------------------------------------
     SEAL RINGS — circular text generator
     ------------------------------------------------------------------- */
  function buildSeal(el){
    var text = el.getAttribute("data-seal-text") || "VEIGATECH • ";
    var size = parseInt(el.getAttribute("data-seal-size"), 10) || 200;
    var ring = document.createElement("div");
    ring.className = "seal-ring";
    ring.style.width = size + "px";
    ring.style.height = size + "px";

    var chars = text.split("");
    var step = 360 / chars.length;
    var radius = size / 2 - (size * 0.11);

    chars.forEach(function(ch, i){
      var span = document.createElement("span");
      span.className = "seal-ring__char";
      span.textContent = ch;
      var deg = step * i;
      span.style.transform =
        "translate(-50%,-50%) rotate(" + deg + "deg) translateY(-" + radius + "px)";
      span.style.fontSize = Math.max(9, size * 0.052) + "px";
      ring.appendChild(span);
    });

    el.appendChild(ring);
    if(getComputedStyle(el).position === "static"){
      el.style.position = "relative";
    }

    if(!el.hasAttribute("data-stamp-hover") && !reduced){
      gsap.to(ring, { rotate: 360, duration: size > 400 ? 90 : 40, ease:"none", repeat:-1 });
    }
  }
  document.querySelectorAll("[data-seal]").forEach(buildSeal);

  /* ---------------------------------------------------------------------
     PRELOADER
     ------------------------------------------------------------------- */
  var pctEl = document.querySelector("[data-preloader-pct]");
  var fillEl = document.querySelector("[data-preloader-fill]");
  var counter = { v: 0 };

  var preTl = gsap.timeline({
    onComplete: function(){
      document.body.classList.add("is-loaded");
      startHero();
    }
  });

  preTl.to(counter, {
    v: 100, duration: reduced ? 0.1 : 1.7, ease:"power2.inOut",
    onUpdate: function(){
      var val = Math.round(counter.v);
      if(pctEl) pctEl.textContent = val + "%";
      if(fillEl) fillEl.style.width = val + "%";
    }
  })
  .to("[data-stampmark]", {
    y: 0, rotate: -8, scale: 1, opacity: 1, duration: 0.5, ease:"back.out(3)"
  }, "-=0.35")
  .to("[data-stampmark]", { opacity: 0, duration: 0.25 }, "+=0.25")
  .to(".preloader__word, .preloader__bar, .preloader__pct, .preloader__seal", {
    opacity: 0, y: -14, duration: 0.4, ease:"power2.in"
  }, "-=0.05")
  .to(".preloader__curtain--l", { xPercent: -100, duration: 0.9, ease:"expo.inOut" }, "curtain")
  .to(".preloader__curtain--r", { xPercent: 100, duration: 0.9, ease:"expo.inOut" }, "curtain")
  .set(".preloader", { display:"none" });

  /* ---------------------------------------------------------------------
     MAGNETIC BUTTONS
     ------------------------------------------------------------------- */
  if(!isTouch){
    document.querySelectorAll("[data-magnetic]").forEach(function(el){
      var strength = 0.35;
      el.addEventListener("mousemove", function(e){
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * strength;
        var y = (e.clientY - r.top - r.height/2) * strength;
        gsap.to(el, { x:x, y:y, duration:0.5, ease:"power3.out" });
      });
      el.addEventListener("mouseleave", function(){
        gsap.to(el, { x:0, y:0, duration:0.6, ease:"elastic.out(1,0.4)" });
      });
    });
  }

  /* ---------------------------------------------------------------------
     LENIS SMOOTH SCROLL
     ------------------------------------------------------------------- */
  var lenis;
  if(!reduced && window.Lenis){
    lenis = new Lenis({ duration: 1.1, smoothWheel:true, easing: function(t){ return 1 - Math.pow(1-t, 3); } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function(time){ lenis.raf(time*1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------------------------------------------------------------
     NAV — reveal on load, hide/show on scroll, mobile menu
     ------------------------------------------------------------------- */
  var lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function(self){
      if(self.scroll() < 40){ gsap.to(navEl,{ yPercent:0, duration:0.4 }); lastY = self.scroll(); return; }
      if(self.direction === -1){ gsap.to(navEl,{ yPercent:0, duration:0.4 }); }
      else { gsap.to(navEl,{ yPercent:-120, duration:0.4 }); }
    }
  });

  var burger = document.querySelector("[data-burger]");
  var mnav = document.querySelector("[data-mnav]");
  if(burger){
    burger.addEventListener("click", function(){
      var open = mnav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll("[data-mnav-link]").forEach(function(a){
      a.addEventListener("click", function(){ mnav.classList.remove("is-open"); });
    });
  }

  /* ---------------------------------------------------------------------
     HERO entrance timeline (fires after preloader)
     ------------------------------------------------------------------- */
  function startHero(){
    gsap.to("[data-nav]", { yPercent: 0, duration: 0.8, ease:"power3.out" });

    var tl = gsap.timeline({ delay:0.1 });
    tl.from("[data-split-line]", {
      yPercent: 120, rotate: 4, opacity:0, duration: 1, ease:"expo.out", stagger:0.09
    })
    .from(".hero__eyebrow", { opacity:0, y:14, duration:0.6, ease:"power2.out" }, "-=0.7")
    .from(".hero__sub", { opacity:0, y:14, duration:0.6, ease:"power2.out" }, "-=0.5")
    .from(".hero__actions", { opacity:0, y:14, duration:0.6, ease:"power2.out" }, "-=0.4")
    .from(".hero__seal-deco", { opacity:0, scale:0.85, duration:1.2, ease:"power2.out" }, "-=1");
  }

  /* ---------------------------------------------------------------------
     GENERIC SCROLL REVEALS
     ------------------------------------------------------------------- */
  document.querySelectorAll("[data-reveal]").forEach(function(el){
    gsap.from(el, {
      opacity:0, y:36, duration:0.9, ease:"power3.out",
      scrollTrigger:{ trigger: el, start:"top 85%" }
    });
  });

  document.querySelectorAll("[data-reveal-line]").forEach(function(el){
    gsap.from(el, {
      opacity:0, y:24, duration:0.8, ease:"power3.out",
      scrollTrigger:{ trigger: el, start:"top 88%" }
    });
  });

  document.querySelectorAll("[data-reveal-words]").forEach(function(el){
    var html = el.innerHTML;
    var lines = html.split("<br>");
    el.innerHTML = lines.map(function(l){ return '<span class="wline"><span class="wline-in">'+l+'</span></span>'; }).join("");
    el.querySelectorAll(".wline").forEach(function(w){ w.style.display="block"; w.style.overflow="hidden"; });
    gsap.from(el.querySelectorAll(".wline-in"), {
      yPercent:110, opacity:0, duration:0.9, ease:"expo.out", stagger:0.08,
      scrollTrigger:{ trigger: el, start:"top 85%" }
    });
  });

  document.querySelectorAll("[data-reveal-stagger]").forEach(function(group){
    var items = group.children;
    gsap.from(items, {
      opacity:0, y:40, duration:0.8, ease:"power3.out", stagger:0.12,
      scrollTrigger:{ trigger: group, start:"top 82%" }
    });
  });

  /* ---------------------------------------------------------------------
     COUNTERS
     ------------------------------------------------------------------- */
  document.querySelectorAll("[data-counter]").forEach(function(el){
    var to = parseFloat(el.getAttribute("data-counter-to"));
    var prefix = el.getAttribute("data-counter-prefix") || "";
    var suffix = el.getAttribute("data-counter-suffix") || "";
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start:"top 90%", once:true,
      onEnter: function(){
        gsap.to(obj, {
          v: to, duration: 1.4, ease:"power2.out",
          onUpdate: function(){ el.textContent = prefix + Math.round(obj.v) + suffix; }
        });
      }
    });
  });

  /* ---------------------------------------------------------------------
     COMPARE STAMP (before/after)
     ------------------------------------------------------------------- */
  var afterCard = document.querySelector(".compare__card--after");
  if(afterCard){
    ScrollTrigger.create({
      trigger: afterCard, start:"top 75%", once:true,
      onEnter: function(){ afterCard.classList.add("is-in"); }
    });
  }

  /* ---------------------------------------------------------------------
     MARQUEE — speed up slightly on scroll velocity
     ------------------------------------------------------------------- */
  var marqueeTrack = document.querySelector("[data-marquee-track]");
  if(marqueeTrack){
    ScrollTrigger.create({
      trigger: ".marquee", start:"top bottom", end:"bottom top",
      onUpdate: function(self){
        gsap.to(marqueeTrack, { timeScale: 1 + Math.min(Math.abs(self.getVelocity())/2500, 2.5), duration:0.3 });
      }
    });
  }

  /* ---------------------------------------------------------------------
     ESCADA — horizontal pin (desktop only)
     ------------------------------------------------------------------- */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", function(){
    var track = document.querySelector("[data-escada-track]");
    var pin = document.querySelector("[data-escada-pin]");
    var current = document.querySelector("[data-escada-current]");
    var progress = document.querySelector("[data-escada-progress]");
    if(!track) return;

    var st = gsap.to(track, {
      xPercent: -66.666,
      ease:"none",
      scrollTrigger:{
        trigger: "[data-escada]",
        start:"top top",
        end: "+=200%",
        pin: true,
        scrub: 0.6,
        onUpdate: function(self){
          var step = Math.min(3, Math.floor(self.progress*3)+1);
          if(current) current.textContent = String(step).padStart(2,"0");
          if(progress) progress.style.width = (self.progress*100)+"%";
        }
      }
    });
    return function(){ st.kill(); };
  });

  /* ---------------------------------------------------------------------
     PLAN CARD TILT
     ------------------------------------------------------------------- */
  if(!isTouch){
    document.querySelectorAll("[data-tilt]").forEach(function(card){
      card.addEventListener("mousemove", function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - 0.5;
        var py = (e.clientY - r.top)/r.height - 0.5;
        gsap.to(card, { rotateY: px*10, rotateX: -py*10, duration:0.4, ease:"power2.out", transformPerspective:800 });
      });
      card.addEventListener("mouseleave", function(){
        gsap.to(card, { rotateY:0, rotateX:0, duration:0.6, ease:"power3.out" });
      });
    });
  }

  /* ---------------------------------------------------------------------
     TIMELINE — draw line on scroll
     ------------------------------------------------------------------- */
  var timelinePath = document.querySelector("[data-timeline-path]");
  if(timelinePath){
    var len = timelinePath.getTotalLength();
    timelinePath.setAttribute("data-timeline-progress","");
    timelinePath.style.strokeDasharray = len;
    timelinePath.style.strokeDashoffset = len;
    gsap.to(timelinePath, {
      strokeDashoffset: 0, ease:"none",
      scrollTrigger:{ trigger:"[data-timeline]", start:"top 70%", end:"bottom 80%", scrub:0.5 }
    });
  }

  /* ---------------------------------------------------------------------
     CTA FINAL — cinematic zoom title
     ------------------------------------------------------------------- */
  gsap.from(".cta-final__title", {
    scale:0.7, opacity:0, duration:1.2, ease:"power3.out",
    scrollTrigger:{ trigger:".cta-final", start:"top 60%" }
  });

  /* ---------------------------------------------------------------------
     PARALLAX SEALS
     ------------------------------------------------------------------- */
  if(!reduced){
    document.querySelectorAll("[data-parallax]").forEach(function(el){
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      gsap.to(el, {
        yPercent: speed*100, ease:"none",
        scrollTrigger:{ trigger: el.closest("section") || el, start:"top bottom", end:"bottom top", scrub:true }
      });
    });
  }

  /* ---------------------------------------------------------------------
     FOOTER YEAR
     ------------------------------------------------------------------- */
  var yearEl = document.querySelector("[data-year]");
  if(yearEl) yearEl.textContent = "© " + new Date().getFullYear() + " VeigaTech";

  /* ---------------------------------------------------------------------
     SAFETY: if preloader assets never fire (edge cases), unlock scroll
     ------------------------------------------------------------------- */
  window.addEventListener("load", function(){
    ScrollTrigger.refresh();
  });

})();

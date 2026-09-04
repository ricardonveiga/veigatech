/* ==========================================================================
   PORTFOLIO — icons draw themselves in on scroll
   ========================================================================== */
(function(){
  "use strict";
  if(!window.gsap || !window.ScrollTrigger) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-draw-icon]").forEach(function(icon){
    var shapes = Array.prototype.slice.call(icon.querySelectorAll("path,line,circle,ellipse,rect"))
      .filter(function(s){ return s.getAttribute("stroke") === "currentColor"; });

    if(!reduced){
      shapes.forEach(function(shape){
        var len = 200;
        try { len = shape.getTotalLength(); } catch(e){}
        shape.style.strokeDasharray = len;
        shape.style.strokeDashoffset = len;
      });
    }

    gsap.from(icon, {
      opacity:0, scale:0.7, duration:0.6, ease:"back.out(2)",
      scrollTrigger:{ trigger: icon, start:"top 85%", once:true }
    });

    if(!reduced && shapes.length){
      ScrollTrigger.create({
        trigger: icon, start:"top 85%", once:true,
        onEnter: function(){
          gsap.to(shapes, { strokeDashoffset:0, duration:1, ease:"power2.inOut", stagger:0.07, delay:0.1 });
        }
      });
    }
  });
})();

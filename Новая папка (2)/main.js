(function () {
  'use strict';

  const isMobile = () => window.innerWidth <= 768;

  /* ══════════════════════════════
     BG CANVAS
  ══════════════════════════════ */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, animId, t = 0;
    const GOLD = 'rgba(200,150,12,';
    const DIM  = 'rgba(240,236,224,';

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    /* ── Общая сетка ── */
    function drawGrid(alpha) {
      const STEP = isMobile() ? 48 : 72;
      ctx.strokeStyle = 'rgba(200,150,12,' + alpha + ')';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let x = 0; x <= W; x += STEP) { ctx.moveTo(x,0); ctx.lineTo(x,H); }
      for (let y = 0; y <= H; y += STEP) { ctx.moveTo(0,y); ctx.lineTo(W,y); }
      ctx.stroke();
    }

    function drawDiagonals(alpha) {
      ctx.strokeStyle = 'rgba(200,150,12,' + alpha + ')';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      const STEP = isMobile() ? 96 : 140;
      for (let x = -H; x < W + H; x += STEP) {
        ctx.moveTo(x, 0); ctx.lineTo(x + H, H);
      }
      ctx.stroke();
    }

    /* ── Мобильное здание: то же что на десктопе, но занимает весь экран ── */
    function drawMobilePattern() {
      // Здание растянуто на весь экран: от левого края до правого
      const bx = W * 0.04, by = H * 0.04;
      const bw = W * 0.92,  bh = H * 0.88;
      const progress = Math.min(t / 160, 1);
      const total = 2 * (bw + bh);
      const drawn = total * progress;

      ctx.save();
      ctx.strokeStyle = GOLD + '0.55)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -t * 0.35;
      ctx.beginPath();
      ctx.moveTo(bx, by + bh);
      let rem = drawn;
      if (rem > 0) { const s = Math.min(rem, bw); ctx.lineTo(bx+s, by+bh); rem -= s; }
      if (rem > 0) { const s = Math.min(rem, bh); ctx.lineTo(bx+bw, by+bh-s); rem -= s; }
      if (rem > 0) { const s = Math.min(rem, bw); ctx.lineTo(bx+bw-s, by); rem -= s; }
      if (rem > 0) { const s = Math.min(rem, bh); ctx.lineTo(bx, by+s); }
      ctx.stroke();
      ctx.setLineDash([]);

      if (progress < 0.4) { ctx.restore(); return; }
      const p2 = (progress - 0.4) / 0.6;
      const floors = 14, floorH = bh / floors;

      // Горизонтальные линии этажей
      ctx.strokeStyle = DIM + (0.07 * p2) + ')';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 1; i < floors; i++) {
        const fy = by + i * floorH;
        ctx.moveTo(bx, fy); ctx.lineTo(bx + bw * p2, fy);
      }
      ctx.stroke();

      // Окна
      const cols = 8, ww = bw / (cols * 2.2), wh = floorH * 0.5;
      for (let row = 1; row < floors; row++) {
        for (let col = 0; col < cols; col++) {
          const wx = bx + col * (bw / cols) + ww * 0.35;
          const wy = by + row * floorH + floorH * 0.2;
          const lit = (row + col) % 3 !== 0;
          ctx.fillStyle = GOLD + (lit ? 0.12 : 0.04) * p2 + ')';
          ctx.fillRect(wx, wy, ww, wh);
        }
      }

      // Вертикальные колонны
      ctx.strokeStyle = DIM + (0.07 * p2) + ')';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let col = 1; col < cols; col++) {
        const lx = bx + col * (bw / cols);
        ctx.moveTo(lx, by); ctx.lineTo(lx, by + bh * p2);
      }
      ctx.stroke();

      // Размерные линии
      const mp = Math.min((t - 50) / 100, 1);
      if (mp > 0) {
        ctx.strokeStyle = GOLD + (0.18 * mp) + ')';
        ctx.lineWidth = 0.6;
        ctx.fillStyle  = GOLD + (0.32 * mp) + ')';
        ctx.font = '8px Raleway, sans-serif';
        ctx.textAlign = 'left';
        // Горизонтальная
        const mx = bx, my = by + bh + H*0.03, mw = bw;
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + mw*mp, my); ctx.stroke();
        if (mp > 0.85) {
          ctx.beginPath();
          ctx.moveTo(mx,my-4); ctx.lineTo(mx,my+4);
          ctx.moveTo(mx+mw,my-4); ctx.lineTo(mx+mw,my+4);
          ctx.stroke();
          ctx.textAlign = 'center';
          ctx.fillText('38.50 м', mx + mw/2, my - 6);
        }
        // Вертикальная слева
        const vx = bx - W*0.02, vy = by, vh = bh;
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx, vy + vh*mp); ctx.stroke();
        if (mp > 0.9) {
          ctx.textAlign = 'right';
          ctx.fillText('72.00 м', vx - 4, vy + vh/2);
        }
      }

      // Точки-узлы
      const dp = Math.min((t-30)/80, 1);
      if (dp > 0) {
        const marks = [
          [bx/W, by/H],[(bx+bw*0.25)/W, (by+bh*0.3)/H],
          [(bx+bw*0.5)/W, (by+bh*0.1)/H],[(bx+bw*0.75)/W,(by+bh*0.5)/H],
          [(bx+bw)/W, by/H],[(bx+bw)/W,(by+bh)/H],[bx/W,(by+bh)/H]
        ];
        marks.forEach(([rx,ry], i) => {
          const ip = Math.min(Math.max((dp*marks.length-i),0),1);
          if (ip <= 0) return;
          ctx.fillStyle = GOLD+(0.5*ip)+')';
          ctx.beginPath(); ctx.arc(rx*W, ry*H, 2, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = GOLD+(0.2*ip)+')'; ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(rx*W-8,ry*H); ctx.lineTo(rx*W+8,ry*H);
          ctx.moveTo(rx*W,ry*H-8); ctx.lineTo(rx*W,ry*H+8);
          ctx.stroke();
        });
      }

      // Компас
      const cp = Math.min((t-80)/60,1);
      if (cp > 0) {
        const ccx = bx+bw*0.88, ccy = by+bh*0.92, r = 22*cp;
        ctx.save(); ctx.globalAlpha = 0.3*cp;
        ctx.strokeStyle = GOLD+'1)'; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(ccx,ccy,r,0,Math.PI*2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ccx-r,ccy); ctx.lineTo(ccx+r,ccy);
        ctx.moveTo(ccx,ccy-r); ctx.lineTo(ccx,ccy+r);
        ctx.stroke();
        ctx.fillStyle = GOLD+'1)';
        ctx.font = 'bold 7px Raleway,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('С',ccx,ccy-r-4);
        ctx.restore();
      }

      ctx.restore();
    }

    /* ── Десктопный узор: здание ── */
    function drawBuilding() {
      const bx = W * 0.56, by = H * 0.06;
      const bw = W * 0.40, bh = H * 0.85;
      const progress = Math.min(t / 160, 1);
      const total = 2 * (bw + bh);
      const drawn = total * progress;
      ctx.save();
      ctx.strokeStyle = GOLD + '0.55)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -t * 0.35;
      ctx.beginPath();
      ctx.moveTo(bx, by + bh);
      let rem = drawn;
      if (rem > 0) { const s = Math.min(rem, bw); ctx.lineTo(bx+s, by+bh); rem -= s; }
      if (rem > 0) { const s = Math.min(rem, bh); ctx.lineTo(bx+bw, by+bh-s); rem -= s; }
      if (rem > 0) { const s = Math.min(rem, bw); ctx.lineTo(bx+bw-s, by); rem -= s; }
      if (rem > 0) { const s = Math.min(rem, bh); ctx.lineTo(bx, by+s); }
      ctx.stroke(); ctx.setLineDash([]);
      if (progress < 0.4) { ctx.restore(); return; }
      const p2 = (progress - 0.4) / 0.6;
      const floors = 14, floorH = bh / floors;
      ctx.strokeStyle = DIM + (0.07 * p2) + ')';
      ctx.lineWidth = 0.5; ctx.beginPath();
      for (let i = 1; i < floors; i++) {
        const fy = by + i * floorH;
        ctx.moveTo(bx, fy); ctx.lineTo(bx + bw * p2, fy);
      }
      ctx.stroke();
      const cols = 6, ww = bw / (cols * 2.2), wh = floorH * 0.5;
      for (let row = 1; row < floors; row++) {
        for (let col = 0; col < cols; col++) {
          const wx = bx + col * (bw/cols) + ww*0.35;
          const wy = by + row * floorH + floorH * 0.2;
          const lit = (row + col) % 3 !== 0;
          ctx.fillStyle = GOLD + (lit ? 0.12 : 0.04) * p2 + ')';
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
      ctx.strokeStyle = DIM + (0.07 * p2) + ')';
      ctx.lineWidth = 0.5; ctx.beginPath();
      for (let col = 1; col < cols; col++) {
        const lx = bx + col * (bw/cols);
        ctx.moveTo(lx, by); ctx.lineTo(lx, by + bh * p2);
      }
      ctx.stroke(); ctx.restore();
    }

    function drawMeasurements() {
      if (isMobile()) return;
      const p = Math.min((t-50)/100, 1); if (p <= 0) return;
      ctx.strokeStyle = GOLD + (0.18*p) + ')'; ctx.lineWidth = 0.6;
      ctx.fillStyle = GOLD + (0.32*p) + ')';
      ctx.font = '9px Raleway, sans-serif';
      const mx = W*0.08, my = H*0.68, mw = W*0.26;
      ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx+mw*p,my); ctx.stroke();
      if (p > 0.85) {
        ctx.beginPath();
        ctx.moveTo(mx,my-5); ctx.lineTo(mx,my+5);
        ctx.moveTo(mx+mw,my-5); ctx.lineTo(mx+mw,my+5);
        ctx.stroke();
        ctx.fillText('38.50 м', mx+mw/2-18, my-10);
      }
      const vx=W*0.53, vy=H*0.07, vh=H*0.82;
      ctx.beginPath(); ctx.moveTo(vx,vy); ctx.lineTo(vx,vy+vh*p); ctx.stroke();
      if (p > 0.9) ctx.fillText('72.00 м', vx+8, vy+vh/2);
    }

    function drawDots() {
      if (isMobile()) return;
      const marks = [[0.1,0.2],[0.2,0.42],[0.07,0.58],[0.32,0.22],[0.4,0.52],[0.28,0.72]];
      const p = Math.min((t-30)/80, 1);
      marks.forEach(([rx,ry], i) => {
        const ip = Math.min(Math.max((p*marks.length-i),0),1);
        if (ip <= 0) return;
        ctx.fillStyle = GOLD+(0.45*ip)+')';
        ctx.beginPath(); ctx.arc(rx*W, ry*H, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = GOLD+(0.2*ip)+')'; ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(rx*W-10,ry*H); ctx.lineTo(rx*W+10,ry*H);
        ctx.moveTo(rx*W,ry*H-10); ctx.lineTo(rx*W,ry*H+10);
        ctx.stroke();
      });
    }

    function drawCompass() {
      if (isMobile()) return;
      const p = Math.min((t-80)/60,1); if (p<=0) return;
      const cx=W*0.91, cy=H*0.87, r=30*p;
      ctx.save(); ctx.globalAlpha=0.28*p;
      ctx.strokeStyle=GOLD+'1)'; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx-r,cy); ctx.lineTo(cx+r,cy);
      ctx.moveTo(cx,cy-r); ctx.lineTo(cx,cy+r);
      ctx.stroke();
      ctx.fillStyle=GOLD+'1)';
      ctx.font='bold 9px Raleway,sans-serif';
      ctx.textAlign='center';
      ctx.fillText('С',cx,cy-r-6);
      ctx.globalAlpha=1; ctx.restore();
    }

    /* флаттер */
    const F  = { grid:[0.023,0.071,0.013], diag:[0.041,0.019,0.057], build:[0.017,0.061,0.031], meas:[0.053,0.011,0.043], dots:[0.037,0.083,0.029], comp:[0.067,0.027,0.049], mob:[0.019,0.053,0.037] };
    const PH = { grid:[0.0,1.13,2.71],     diag:[1.57,0.44,3.14],    build:[0.88,2.22,0.33],   meas:[2.09,0.77,1.88],    dots:[3.14,1.44,0.66],   comp:[0.55,2.88,1.22],   mob:[1.0,2.5,0.7] };
    function flicker(key, base, amp) {
      const f=F[key], ph=PH[key];
      const v=0.333*Math.sin(t*f[0]+ph[0])+0.333*Math.sin(t*f[1]+ph[1])+0.333*Math.sin(t*f[2]+ph[2]);
      return base + amp*(0.5+0.5*v);
    }

    function render() {
      ctx.clearRect(0,0,W,H);
      const mob = isMobile();

      ctx.save(); ctx.globalAlpha = 1; drawGrid(mob ? 0.06 : 0.08); ctx.restore();


      if (mob) {
        ctx.save(); ctx.globalAlpha = flicker('mob', 0.60, 0.35); drawMobilePattern(); ctx.restore();
      } else {
        ctx.save(); ctx.globalAlpha = flicker('build',0.55,0.45); drawBuilding(); ctx.restore();
        ctx.save(); ctx.globalAlpha = flicker('meas', 0.30,0.55); drawMeasurements(); ctx.restore();
        ctx.save(); ctx.globalAlpha = flicker('dots', 0.40,0.55); drawDots(); ctx.restore();
        ctx.save(); ctx.globalAlpha = flicker('comp', 0.30,0.60); drawCompass(); ctx.restore();
      }

      t++;
      animId = requestAnimationFrame(render);
    }

    resize(); render();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animId); animId=null;
      resize(); t=0; render();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(animId); animId=null; }
      else if (!animId) { resize(); render(); }
    });
  }

  /* ══════════ MOBILE NAV CANVAS ══════════ */
  // Живой canvas в боковом меню
  function initNavCanvas() {
    const nav = document.getElementById('mobile-nav');
    if (!nav) return;

    const nc = document.createElement('canvas');
    nc.id = 'nav-canvas';
    nc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.9;';
    nav.insertBefore(nc, nav.firstChild);

    const ctx2 = nc.getContext('2d');
    let W2, H2, t2=0, aid2=null;

    function resizeNav() {
      W2 = nc.width  = nav.offsetWidth  || 240;
      H2 = nc.height = nav.offsetHeight || window.innerHeight;
    }

    function renderNav() {
      ctx2.clearRect(0,0,W2,H2);

      // Тонкая сетка
      const pulse = 0.4 + 0.3*Math.sin(t2*0.022);
      ctx2.strokeStyle = 'rgba(200,150,12,'+(pulse*0.18)+')';
      ctx2.lineWidth = 0.5;
      ctx2.beginPath();
      const ST = 36;
      for (let x=0; x<=W2; x+=ST) { ctx2.moveTo(x,0); ctx2.lineTo(x,H2); }
      for (let y=0; y<=H2; y+=ST) { ctx2.moveTo(0,y); ctx2.lineTo(W2,y); }
      ctx2.stroke();

      // Центральный акцент — вертикальная золотая линия слева
      const lp = 0.5 + 0.5*Math.sin(t2*0.018 + 1.2);
      ctx2.strokeStyle = 'rgba(200,150,12,'+(0.5+0.4*lp)+')';
      ctx2.lineWidth = 1.5;
      ctx2.beginPath();
      ctx2.moveTo(0, 0); ctx2.lineTo(0, H2);
      ctx2.stroke();

      // Мерцающие точки-узлы в пересечениях
      const dotPulse = 0.5 + 0.5*Math.sin(t2*0.035);
      for (let gx=ST; gx<W2; gx+=ST*2) {
        for (let gy=ST; gy<H2; gy+=ST*2) {
          const d = Math.sin(t2*0.02 + gx*0.07 + gy*0.05);
          if (d > 0.3) {
            ctx2.fillStyle = 'rgba(200,150,12,'+(d*0.35*dotPulse)+')';
            ctx2.beginPath();
            ctx2.arc(gx, gy, 1.2, 0, Math.PI*2);
            ctx2.fill();
          }
        }
      }

      // Горизонтальный акцент под заголовком
      const hp = 0.5 + 0.5*Math.sin(t2*0.025 + 0.8);
      ctx2.strokeStyle = 'rgba(200,150,12,'+(0.3+0.25*hp)+')';
      ctx2.lineWidth = 0.6;
      ctx2.beginPath();
      ctx2.moveTo(0, 56); ctx2.lineTo(W2, 56);
      ctx2.stroke();

      // Угловые декоративные уголки
      const cp = 0.4 + 0.3*Math.sin(t2*0.019 + 2.0);
      ctx2.strokeStyle = 'rgba(200,150,12,'+(cp*0.6)+')';
      ctx2.lineWidth = 0.8;
      const cs = 12;
      // верх-лево (пропуск — там логотип)
      // верх-право
      ctx2.beginPath();
      ctx2.moveTo(W2-cs, 8); ctx2.lineTo(W2-2, 8);
      ctx2.lineTo(W2-2, 8+cs);
      ctx2.stroke();
      // низ-лево
      ctx2.beginPath();
      ctx2.moveTo(2, H2-8-cs); ctx2.lineTo(2, H2-8);
      ctx2.lineTo(2+cs, H2-8);
      ctx2.stroke();
      // низ-право
      ctx2.beginPath();
      ctx2.moveTo(W2-cs, H2-8); ctx2.lineTo(W2-2, H2-8);
      ctx2.lineTo(W2-2, H2-8-cs);
      ctx2.stroke();

      t2++;
      aid2 = requestAnimationFrame(renderNav);
    }

    // Запускать только когда меню открыто
    const burger = document.getElementById('burger');
    burger?.addEventListener('click', () => {
      resizeNav();
      if (!aid2) renderNav();
    });

    document.getElementById('mobile-close')?.addEventListener('click', () => {
      cancelAnimationFrame(aid2); aid2 = null;
    });
    document.getElementById('mobile-overlay')?.addEventListener('click', () => {
      cancelAnimationFrame(aid2); aid2 = null;
    });
  }

  initNavCanvas();

  /* ══════════ HEADER SCROLL ══════════ */
  const header = document.getElementById('site-header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 30);
  }
  if (header) { window.addEventListener('scroll', updateHeader, {passive:true}); updateHeader(); }

  /* ══════════ MOBILE MENU ══════════ */
  const burger    = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay   = document.getElementById('mobile-overlay');
  const closeBtn  = document.getElementById('mobile-close');

  function openMenu()  { mobileNav?.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeMenu() { mobileNav?.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow=''; }

  burger?.addEventListener('click', openMenu);
  overlay?.addEventListener('click', closeMenu);
  closeBtn?.addEventListener('click', closeMenu);

  // Пометить активную ссылку
  const curPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.mobile-nav-link').forEach(l => {
    const href = l.getAttribute('href');
    if (href === curPage || (curPage === '' && href === 'index.html')) {
      l.classList.add('active');
    }
    l.addEventListener('click', closeMenu);
  });

  /* ══════════ SCROLL TOP ══════════ */
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    }, {passive:true});
    scrollBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  /* ══════════ FADE-IN ══════════ */
  const fadeEls = document.querySelectorAll(
    '.service-card, .gallery-card, .about-col, .contact-block, .principles-list li, .intro-grid > *, .two-col > *'
  );
  if (fadeEls.length && 'IntersectionObserver' in window) {
    fadeEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = `opacity .6s ${(i%4)*0.07}s, transform .6s ${(i%4)*0.07}s`;
    });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='none'; }
      });
    }, {threshold:0.07});
    fadeEls.forEach(el => io.observe(el));
  }

})();

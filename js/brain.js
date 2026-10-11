/* Zombie Brain Lab: brain drawings and region highlighting.
   Drawing adapted from Front Lawn Design Draft 4 (AI-drawn; not yet checked by an expert).
   Code: MIT License. Without JavaScript, the page still shows the image descriptions and region guide as text. */
(function () {
  'use strict';

  var PFC = 'M64,122 C56,84 80,50 122,37 C112,62 106,92 102,124 C100,138 97,150 92,157 L88,159 C75,154 65,142 64,122 Z';
  // The prefrontal cortex's outer edge (part of the brain's outline) and its back edge
  // (where it meets the rest of the cortex), both drawn top to bottom.
  var FRONT = 'M122,37 C80,50 56,84 64,122 C65,142 75,154 88,159';
  var BACK = 'M122,37 C112,62 106,92 102,124 C100,138 97,150 92,157 L88,159';
  var N = 64, F, B;

  // Sample both edges at matching points so a smaller prefrontal cortex can be drawn
  // by pulling the brain's front edge back toward the back edge.
  function sample(d) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); svg.appendChild(p); document.body.appendChild(svg);
    var L = p.getTotalLength(), pts = [];
    for (var i = 0; i <= N; i++) { var q = p.getPointAtLength(L * i / N); pts.push([q.x, q.y]); }
    document.body.removeChild(svg);
    return pts;
  }
  // A point a fraction k of the way from the back edge to the typical front edge.
  function at(i, k) { return [B[i][0] + k * (F[i][0] - B[i][0]), B[i][1] + k * (F[i][1] - B[i][1])]; }
  function edge(k) { var a = []; for (var i = 0; i <= N; i++) a.push(at(i, k)); return a; }
  function poly(pts) { return pts.map(function (p, j) { return (j ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }

  // Size multipliers (1 = control) and damaged regions for each zombie.
  var ZOMBIES = {
    basic: { mod: { pfc: .5, amy: .75, cord: 1.9 }, dmg: ['pfc', 'amy'], strong: true },
    news:  { mod: { pfc: .5, hip: .55, amy: 1.45, cord: 1.9 }, dmg: ['pfc', 'hip', 'amy'], strong: true }
  };

  function cordSVG(w, strong) {
    var L = 213 - w, R = 213 + w;
    var base = '<path class="rg cord outline" data-r="cord" d="M' + L + ',222 L' + R + ',222 L' + (213 + w * 0.9) + ',275 L' + (213 - w * 0.9) + ',275 Z"/>';
    if (!strong) return base;
    // Braided cable: diagonal strands plus two bands.
    var t = '';
    for (var y = 226; y < 272; y += 6) t += 'M' + (L + 1) + ',' + y + ' L' + (R - 1) + ',' + (y + 7) + ' ';
    return base + '<path class="strand" d="' + t + '"/>' +
      '<rect class="band" x="' + (L - 2) + '" y="232" width="' + (2 * w + 4) + '" height="6" rx="2"/>' +
      '<rect class="band" x="' + (L - 2) + '" y="256" width="' + (2 * w + 4) + '" height="6" rx="2"/>';
  }

  var uid = 0;
  function brain(m, label, dmg, strong) {
    m = m || {}; dmg = dmg || [];
    var id = 'b' + (++uid);
    function D(k) { return dmg.indexOf(k) !== -1; }
    function rot(k) { return D(k) ? 'filter="url(#rot-' + id + ')" style="fill:url(#mot-' + id + ')"' : ''; }
    function s(k) { return m[k] || 1; }
    function sc(k, cx, cy) { return 'transform="translate(' + cx + ' ' + cy + ') scale(' + s(k) + ') translate(' + (-cx) + ' ' + (-cy) + ')"'; }
    var p = s('pfc');
    var hipD = 'M140,150 C156,166 196,170 214,146 C226,128 230,116 224,108';

    // Prefrontal cortex. When it is smaller, the brain's front edge pulls back (the rest of
    // the brain is unchanged) and a dashed line marks where a typical brain's edge would be.
    var pfcSVG, clip = '', clipAttr = '';
    if (p < 1) {
      if (!F) { F = sample(FRONT); B = sample(BACK); }
      var front = edge(p);
      var shape = poly(front) + ' ' + poly(B.slice().reverse()).replace(/^M/, 'L') + ' Z';
      // Cut away the cortex in front of the new edge (with a margin past the old outline).
      var gap = poly(edge(1.35)) + ' ' + poly(front.slice().reverse()).replace(/^M/, 'L') + ' Z';
      clip = '<clipPath id="cut-' + id + '"><path clip-rule="evenodd" d="M0,0 H400 V300 H0 Z ' + gap + '"/></clipPath>';
      clipAttr = ' clip-path="url(#cut-' + id + ')"';
      var cracks = '';
      if (D('pfc')) {
        [[10, 1], [22, -1], [36, 1], [50, -1]].forEach(function (c) {
          var a = at(c[0], .18 * p), b = at(c[0], .82 * p);
          var nx = a[1] - b[1], ny = b[0] - a[0], nl = Math.sqrt(nx * nx + ny * ny) || 1;
          nx /= nl; ny /= nl;
          var pts = [a];
          [.3, .55, .8].forEach(function (f, j) {
            var off = (j % 2 ? -3 : 3) * c[1];
            pts.push([a[0] + f * (b[0] - a[0]) + nx * off, a[1] + f * (b[1] - a[1]) + ny * off]);
          });
          pts.push(b);
          cracks += poly(pts) + ' ';
        });
        cracks = '<path class="crack" d="' + cracks + '"/>' +
          '<path class="drip" d="M84,157 C84,165 80,171 80,176 C80,182 88,182 88,176 C88,171 84,165 84,157 Z M94,155 C94,160 92,163 92,166 C92,170 97,170 97,166 C97,163 94,160 94,155 Z"/>';
      }
      pfcSVG = '<path class="ghost" d="' + FRONT + '"/>' +
        '<path class="rg pfc outline" data-r="pfc" d="' + shape + '" ' + rot('pfc') + '/>' + cracks;
    } else {
      pfcSVG = '<path class="rg pfc outline" data-r="pfc" d="' + PFC + '"/>';
    }
    return '<svg viewBox="40 20 300 260" role="img" aria-label="' + label.replace(/"/g, '&quot;') + '" focusable="false">' +
      '<defs>' + clip +
      '<filter id="rot-' + id + '" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<pattern id="mot-' + id + '" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#B9C595"/><circle cx="4" cy="5" r="2.4" fill="#8F9E68"/><circle cx="11" cy="10" r="1.6" fill="#8F9E68"/><circle cx="10" cy="2" r="1" fill="#7C8B57"/></pattern>' +
      '</defs>' +
      cordSVG(6.5 * s('cord'), strong) +
      '<ellipse class="rg cbl outline" data-r="cbl" cx="255" cy="190" rx="38" ry="23"/>' +
      '<path class="folia" d="M224,181 C245,177 268,177 288,182 M220,190 C245,186 270,186 292,191 M222,199 C245,196 268,196 289,200 M230,207 C248,205 266,205 282,208"/>' +
      '<g' + clipAttr + '>' +
      '<path class="cortex outline" d="M62,122 C52,72 102,32 177,31 C252,30 306,68 306,118 C307,158 291,175 262,173 C243,171 229,166 216,160 L190,160 C172,174 152,184 131,182 C111,180 100,168 88,159 C74,154 63,142 62,122 Z"/>' +
      '<path class="gyri" d="M110,52 C122,62 128,60 140,52 M150,40 C160,55 172,55 182,42 M200,38 C206,52 222,54 230,44 M248,52 C252,66 268,70 276,62 M286,88 C278,100 284,112 296,116 M286,142 C276,140 270,150 276,160 M96,96 C108,94 112,104 104,114 M232,76 C240,88 256,90 262,82"/>' +
      '</g>' +
      pfcSVG +
      '<path class="rg cc outline" d="M116,98 C128,66 222,58 254,92 C258,98 252,104 246,100 C218,76 140,80 126,104 C122,108 114,104 116,98 Z"/>' +
      '<path class="rg bg outline" data-r="bg" d="M142,104 C140,90 160,84 172,90 C164,92 154,98 156,110 C157,120 150,122 146,118 Z M150,124 C150,114 170,112 176,120 C178,130 160,134 150,124 Z"/>' +
      '<path class="rg hipline" data-r="hip" d="' + hipD + '" style="stroke-width:' + (3 + 10 * s('hip')) + (D('hip') ? ';stroke-dasharray:16 5' : '') + '" ' + (D('hip') ? 'filter="url(#rot-' + id + ')"' : '') + '/>' +
      '<path class="rg hip" data-r="hip" d="' + hipD + '" style="stroke-width:' + (7 * s('hip')) + (D('hip') ? ';stroke:#9FAE78;stroke-dasharray:16 5' : '') + '" ' + (D('hip') ? 'filter="url(#rot-' + id + ')"' : '') + '/>' +
      '<g ' + sc('amy', 138, 147) + '>' +
        '<ellipse class="rg amy outline" data-r="amy" cx="138" cy="147" rx="8" ry="6.5" ' + rot('amy') + '/>' +
        (D('amy') ? '<path class="crack" style="stroke-width:1.2" d="M132,143 L136,147 L134,150 L141,152"/>' : '') +
      '</g>' +
      '<ellipse class="rg thal outline" data-r="thal" cx="192" cy="110" rx="23" ry="15"/>' +
      '<path class="rg stem outline" data-r="stem" d="M184,122 L208,122 L214,155 L188,155 Z M194,188 L218,187 L219,222 L207,222 Z"/>' +
      '<path class="rg pons outline" data-r="stem" d="M188,154 L214,154 L218,188 L196,190 C180,186 178,162 188,154 Z"/>' +
      '<ellipse class="rg hypo outline" data-r="hypo" cx="170" cy="127" rx="11" ry="7"/>' +
      '<path d="M168,134 L165,145" stroke="#183A1D" stroke-width="3"/>' +
      '<circle class="rg pit outline" cx="164" cy="148" r="4.5"/>' +
      '</svg>';
  }

  // Small gray brain for the region guide, with only one region shown in yellow.
  // The two smallest regions are drawn larger than life (and ringed) so they can be seen.
  var ICON_SMALL = { amy: 'Amygdala', hypo: 'Hypothalamus' };
  function icon(key, name) {
    var GRAY = '#ECEDEA', LINE = '#A3A9A1', INK = '#183A1D', ON = '#FFEA00';
    function part(k, d, tag) {
      var on = k === key, a = ' fill="' + (on ? ON : GRAY) + '" stroke="' + (on ? INK : LINE) + '" stroke-width="' + (on ? 5 : 3) + '"';
      return tag === 'e' ? '<ellipse ' + d + a + '/>' : '<path d="' + d + '"' + a + ' stroke-linejoin="round"/>';
    }
    var hipD = 'M140,150 C156,166 196,170 214,146 C226,128 230,116 224,108', h = key === 'hip';
    return '<svg class="region-icon" viewBox="50 24 262 256" role="img" aria-label="Where the ' + name.toLowerCase() + ' is in the brain" focusable="false">' +
      part('cord', 'M206,222 L220,222 L219,275 L207,275 Z') +
      part('cbl', 'cx="255" cy="190" rx="38" ry="23"', 'e') +
      '<path d="M62,122 C52,72 102,32 177,31 C252,30 306,68 306,118 C307,158 291,175 262,173 C243,171 229,166 216,160 L190,160 C172,174 152,184 131,182 C111,180 100,168 88,159 C74,154 63,142 62,122 Z" fill="' + GRAY + '" stroke="' + LINE + '" stroke-width="3"/>' +
      part('pfc', PFC) +
      part('bg', 'M142,104 C140,90 160,84 172,90 C164,92 154,98 156,110 C157,120 150,122 146,118 Z M150,124 C150,114 170,112 176,120 C178,130 160,134 150,124 Z') +
      '<path d="' + hipD + '" fill="none" stroke="' + (h ? INK : LINE) + '" stroke-width="' + (h ? 17 : 13) + '" stroke-linecap="round"/>' +
      '<path d="' + hipD + '" fill="none" stroke="' + (h ? ON : GRAY) + '" stroke-width="' + (h ? 9 : 8) + '" stroke-linecap="round"/>' +
      (key === 'amy' ? '' : part('amy', 'cx="138" cy="147" rx="8" ry="6.5"', 'e')) +
      part('thal', 'cx="192" cy="110" rx="23" ry="15"', 'e') +
      part('stem', 'M184,122 L208,122 L214,155 L188,155 Z M188,154 L214,154 L218,188 L196,190 C180,186 178,162 188,154 Z M194,188 L218,187 L219,222 L207,222 Z') +
      (key === 'hypo' ? '' : part('hypo', 'cx="170" cy="127" rx="11" ry="7"', 'e')) +
      (key === 'amy' ? part('amy', 'cx="138" cy="147" rx="15" ry="12"', 'e') + '<circle cx="138" cy="147" r="24" fill="none" stroke="' + INK + '" stroke-width="5"/>' : '') +
      (key === 'hypo' ? part('hypo', 'cx="170" cy="127" rx="16" ry="11"', 'e') + '<circle cx="170" cy="127" r="22" fill="none" stroke="' + INK + '" stroke-width="5"/>' : '') +
      '</svg>';
  }

  function init() {
    var page = document.querySelector('[data-zombie]');
    if (!page) return;
    var z = ZOMBIES[page.getAttribute('data-zombie')];
    if (!z) return;

    // Draw the two brains; the alt text comes from each holder's data-alt.
    document.querySelectorAll('.brain').forEach(function (holder) {
      var isZombie = holder.getAttribute('data-brain') === 'zombie';
      holder.innerHTML = isZombie
        ? brain(z.mod, holder.getAttribute('data-alt'), z.dmg, z.strong)
        : brain({}, holder.getAttribute('data-alt'), [], false);
    });

    // Build region buttons from the region guide in the page.
    var guide = document.querySelectorAll('.region-guide [data-region]');
    var bar = document.getElementById('regions');
    var now = document.getElementById('now');
    if (!bar || !guide.length) return;
    var info = {};
    var label = document.createElement('span');
    label.textContent = 'Highlight a region:';
    bar.appendChild(label);
    guide.forEach(function (dt) {
      var key = dt.getAttribute('data-region');
      var dd = dt.nextElementSibling;
      info[key] = { name: dt.textContent.trim(), text: dd ? dd.textContent.trim() : '' };
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = info[key].name;
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('data-region', key);
      b.addEventListener('click', function () { select(key); });
      bar.appendChild(b);
    });
    bar.hidden = false;

    // Add a small brain icon to each region guide entry.
    var dl = document.querySelector('.region-guide');
    if (dl) {
      dl.classList.add('icons');
      guide.forEach(function (dt) {
        var key = dt.getAttribute('data-region'), dd = dt.nextElementSibling;
        var item = document.createElement('div');
        item.className = 'item';
        dl.insertBefore(item, dt);
        item.innerHTML = icon(key, info[key].name);
        item.appendChild(dt);
        if (dd && dd.tagName === 'DD') {
          item.appendChild(dd);
          if (ICON_SMALL[key]) {
            var note = document.createElement('span');
            note.className = 'icon-note';
            note.textContent = ICON_SMALL[key] + ' is small; this icon enlarges it to be visible.';
            dd.appendChild(note);
          }
        }
      });
    }

    // Region names in the brain report become buttons that highlight that region in both brains.
    document.querySelectorAll('.report .rl[data-region]').forEach(function (sp) {
      var key = sp.getAttribute('data-region');
      if (!info[key]) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'region-link';
      b.setAttribute('data-region', key);
      b.textContent = sp.textContent;
      b.addEventListener('click', function () { select(key, b); });
      sp.parentNode.replaceChild(b, sp);
    });

    function select(key, from) {
      bar.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-region') === key));
      });
      document.querySelectorAll('.scans [data-r]').forEach(function (el) {
        el.classList.toggle('sel', el.getAttribute('data-r') === key);
      });
      document.querySelectorAll('.region-link').forEach(function (el) {
        el.classList.toggle('on', el.getAttribute('data-region') === key);
      });
      if (!now) return;
      now.textContent = info[key].name + ': ' + info[key].text;
      if (from) {
        // Clicked from the report: bring the brains into view, with a way back.
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'back';
        back.textContent = 'Back to the report';
        back.addEventListener('click', function () {
          from.scrollIntoView({ block: 'center', behavior: smooth() });
          from.focus({ preventScroll: true });
        });
        now.appendChild(document.createTextNode(' '));
        now.appendChild(back);
        now.scrollIntoView({ block: 'start', behavior: smooth() });
      }
    }

    function smooth() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

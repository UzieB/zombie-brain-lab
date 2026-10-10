/* Zombie Brain Lab: brain drawings and region highlighting.
   Drawing adapted from Front Lawn Design Draft 4 (AI-drawn; not yet checked by an expert).
   Code: MIT License. Without JavaScript, the page still shows the image descriptions and region guide as text. */
(function () {
  'use strict';

  var PFC = 'M64,122 C56,84 80,50 122,37 C112,62 106,92 102,124 C100,138 97,150 92,157 L88,159 C75,154 65,142 64,122 Z';

  // Size multipliers (1 = control) and damaged regions for each zombie.
  var ZOMBIES = {
    basic: { mod: { pfc: .62, amy: .75, cord: 1.9 }, dmg: ['pfc', 'amy'], strong: true },
    news:  { mod: { pfc: .62, hip: .55, amy: 1.45 }, dmg: ['pfc', 'hip', 'amy'], strong: false }
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
    return '<svg viewBox="40 20 300 260" role="img" aria-label="' + label.replace(/"/g, '&quot;') + '" focusable="false">' +
      '<defs>' +
      '<filter id="rot-' + id + '" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<pattern id="mot-' + id + '" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#B9C595"/><circle cx="4" cy="5" r="2.4" fill="#8F9E68"/><circle cx="11" cy="10" r="1.6" fill="#8F9E68"/><circle cx="10" cy="2" r="1" fill="#7C8B57"/></pattern>' +
      '</defs>' +
      cordSVG(6.5 * s('cord'), strong) +
      '<ellipse class="rg cbl outline" data-r="cbl" cx="255" cy="190" rx="38" ry="23"/>' +
      '<path class="folia" d="M224,181 C245,177 268,177 288,182 M220,190 C245,186 270,186 292,191 M222,199 C245,196 268,196 289,200 M230,207 C248,205 266,205 282,208"/>' +
      '<path class="cortex outline" d="M62,122 C52,72 102,32 177,31 C252,30 306,68 306,118 C307,158 291,175 262,173 C243,171 229,166 216,160 L190,160 C172,174 152,184 131,182 C111,180 100,168 88,159 C74,154 63,142 62,122 Z"/>' +
      '<path class="gyri" d="M110,52 C122,62 128,60 140,52 M150,40 C160,55 172,55 182,42 M200,38 C206,52 222,54 230,44 M248,52 C252,66 268,70 276,62 M286,88 C278,100 284,112 296,116 M286,142 C276,140 270,150 276,160 M96,96 C108,94 112,104 104,114 M232,76 C240,88 256,90 262,82"/>' +
      (p < 1 ? '<path class="ghost" d="' + PFC + '"/>' : '') +
      '<g transform="translate(66 124) scale(' + p + ') translate(-66 -124)">' +
        '<path class="rg pfc outline" data-r="pfc" d="' + PFC + '" ' + rot('pfc') + '/>' +
        (D('pfc') ? '<path class="crack" d="M86,56 L94,68 L88,76 L99,88 M72,96 L82,101 L77,112 L88,120 M104,46 L101,57 L109,63 M95,128 L90,138 L97,146"/>' +
          '<path class="drip" d="M82,156 C82,164 78,170 78,175 C78,181 86,181 86,175 C86,170 82,164 82,156 Z M93,154 C93,159 91,162 91,165 C91,169 96,169 96,165 C96,162 93,159 93,154 Z"/>' : '') +
      '</g>' +
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

    function select(key) {
      bar.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-region') === key));
      });
      document.querySelectorAll('.scans [data-r]').forEach(function (el) {
        el.classList.toggle('sel', el.getAttribute('data-r') === key);
      });
      if (now) now.textContent = info[key].name + ': ' + info[key].text;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

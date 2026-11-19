// Small progressive enhancements; the page works fully without this file.
(function () {
	'use strict';

	var root = document.documentElement;

	// 1. Scroll reveal (fade + slide-up). Enabled from <head> only when
	//    IntersectionObserver exists and prefers-reduced-motion is off.
	if (root.classList.contains('js-reveal')) {
		var revealObserver = new IntersectionObserver(function (entries) {
			var batch = 0;
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				var el = entry.target;
				// Stagger elements that enter the viewport together
				el.style.setProperty('--reveal-delay', Math.min(batch, 4) * 80 + 'ms');
				batch++;
				el.classList.add('is-visible');
				el.addEventListener('transitionend', function done(e) {
					if (e.target !== el || e.propertyName !== 'opacity') return;
					el.removeEventListener('transitionend', done);
					el.classList.remove('reveal', 'is-visible');
					el.style.removeProperty('--reveal-delay');
				});
				revealObserver.unobserve(el);
			});
		}, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

		document.querySelectorAll('.reveal').forEach(function (el) {
			revealObserver.observe(el);
		});
	}

	// 2. Theme toggle. With no saved choice the theme follows the OS
	//    (prefers-color-scheme); a click saves an explicit "light"/"dark".
	var toggle = document.querySelector('.theme-toggle');
	if (toggle) {
		var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
		var isDark = function () {
			var t = root.getAttribute('data-theme');
			return t ? t === 'dark' : darkQuery.matches;
		};
		var sync = function () {
			toggle.setAttribute('aria-pressed', String(isDark()));
		};

		toggle.hidden = false;
		sync();

		toggle.addEventListener('click', function () {
			var next = isDark() ? 'light' : 'dark';
			root.setAttribute('data-theme', next);
			try { localStorage.setItem('theme', next); } catch (e) {}
			sync();
		});

		// Keep the button state right if the OS theme changes while no choice is saved
		if (darkQuery.addEventListener) {
			darkQuery.addEventListener('change', sync);
		}
	}

	// 3. Mobile menu (the button is only displayed below 48rem).
	var nav = document.querySelector('.site-nav');
	var menuBtn = document.querySelector('.site-nav__menu-btn');
	if (nav && menuBtn) {
		var isOpen = function () {
			return menuBtn.getAttribute('aria-expanded') === 'true';
		};
		var setOpen = function (open) {
			nav.classList.toggle('is-open', open);
			menuBtn.setAttribute('aria-expanded', String(open));
		};

		menuBtn.addEventListener('click', function () {
			setOpen(!isOpen());
		});

		// Close after choosing a section
		nav.querySelectorAll('.site-nav__links a').forEach(function (a) {
			a.addEventListener('click', function () {
				setOpen(false);
			});
		});

		// Escape closes and returns focus to the button
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && isOpen()) {
				setOpen(false);
				menuBtn.focus();
			}
		});

		// Click outside the nav closes
		document.addEventListener('click', function (e) {
			if (isOpen() && !nav.contains(e.target)) setOpen(false);
		});

		// Growing past the mobile breakpoint resets the menu
		var desktopQuery = window.matchMedia('(min-width: 48rem)');
		if (desktopQuery.addEventListener) {
			desktopQuery.addEventListener('change', function (e) {
				if (e.matches) setOpen(false);
			});
		}
	}

	// 4. Nav: hairline border once the page is scrolled.
	if (nav) {
		var onScroll = function () {
			nav.classList.toggle('is-scrolled', window.scrollY > 8);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	// 5. Nav: mark the link of the section currently in view.
	if ('IntersectionObserver' in window) {
		var links = {};
		document.querySelectorAll('.site-nav__links a[href^="#"]').forEach(function (a) {
			links[a.getAttribute('href').slice(1)] = a;
		});

		var sectionObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				var link = links[entry.target.id];
				if (!link) return;
				if (entry.isIntersecting) {
					Object.keys(links).forEach(function (id) {
						links[id].removeAttribute('aria-current');
					});
					link.setAttribute('aria-current', 'location');
				} else if (link.getAttribute('aria-current')) {
					link.removeAttribute('aria-current');
				}
			});
		}, { rootMargin: '-45% 0px -50% 0px' });

		Object.keys(links).forEach(function (id) {
			var section = document.getElementById(id);
			if (section) sectionObserver.observe(section);
		});
	}

	// 6. Hero glow follows the pointer (mouse only, and only when motion is welcome).
	//    CSS registers --glow-x/--glow-y with a short transition, so the glow trails smoothly.
	var hero = document.querySelector('.hero');
	if (hero && window.matchMedia('(pointer: fine)').matches &&
		!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		var glowFrame = 0;
		var glowX = 0;
		var glowY = 0;
		hero.addEventListener('pointermove', function (e) {
			var rect = hero.getBoundingClientRect();
			glowX = e.clientX - rect.left;
			glowY = e.clientY - rect.top;
			if (glowFrame) return;
			glowFrame = requestAnimationFrame(function () {
				glowFrame = 0;
				hero.style.setProperty('--glow-x', glowX + 'px');
				hero.style.setProperty('--glow-y', glowY + 'px');
			});
		});
	}

	// 7. Hero "data rain": sparse, slow columns of hex glyphs on a canvas behind the hero.
	//    Not started with reduced motion; paused when the hero is off screen or the tab is hidden.
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext && canvas.getContext('2d');
	if (hero && ctx && !reduceMotion.matches && 'IntersectionObserver' in window) {
		var GLYPHS = '0123456789abcdef{}[]<>/$#_*';
		var CELL = 20;        // px per column and per row
		var TRAIL = 14;       // glyphs per falling stream
		var STEP_MS = 90;     // one row every 90ms
		var ACTIVE = 0.35;    // share of columns with a stream
		var drops = [];
		var width = 0;
		var height = 0;
		var color = '';
		var lastStep = 0;
		var steps = 0;
		var rafId = 0;
		var inView = false;

		canvas.className = 'hero__rain';
		canvas.setAttribute('aria-hidden', 'true');
		hero.insertBefore(canvas, hero.firstChild);

		var randomGlyph = function () {
			return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
		};
		var newDrop = function (initial) {
			var rows = Math.ceil(height / CELL);
			return {
				// Initial drops start anywhere (so the hero isn't empty), later ones above the top
				y: initial ? Math.floor(Math.random() * rows * 1.6) - Math.floor(rows * 0.6) : -Math.floor(Math.random() * 30),
				active: Math.random() < ACTIVE,
				trail: []
			};
		};
		var readColor = function () {
			color = getComputedStyle(root).getPropertyValue('--color-accent').trim();
		};
		var resize = function () {
			var dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = hero.clientWidth;
			height = hero.clientHeight;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			var count = Math.ceil(width / CELL);
			drops = [];
			for (var i = 0; i < count; i++) drops.push(newDrop(true));
		};
		var draw = function () {
			ctx.clearRect(0, 0, width, height);
			ctx.font = '500 14px "JetBrains Mono", ui-monospace, monospace';
			ctx.textBaseline = 'top';
			ctx.fillStyle = color;
			for (var i = 0; i < drops.length; i++) {
				var d = drops[i];
				d.y++;
				d.trail.push(randomGlyph());
				if (d.trail.length > TRAIL) d.trail.shift();
				// Now and then a glyph in the trail flickers to another one
				if (Math.random() < 0.08) d.trail[Math.floor(Math.random() * d.trail.length)] = randomGlyph();

				if (d.active) {
					for (var j = 0; j < d.trail.length; j++) {
						var row = d.y - (d.trail.length - 1 - j);
						if (row < 0) continue;
						var t = (j + 1) / d.trail.length;   // 1 at the head
						ctx.globalAlpha = j === d.trail.length - 1 ? 1 : t * t * 0.7;
						ctx.fillText(d.trail[j], i * CELL + 4, row * CELL);
					}
				}
				if ((d.y - TRAIL) * CELL > height) drops[i] = newDrop(false);
			}
			ctx.globalAlpha = 1;
		};
		var loop = function (time) {
			rafId = requestAnimationFrame(loop);
			if (time - lastStep < STEP_MS) return;
			lastStep = time;
			if (steps++ % 15 === 0) readColor();   // follows theme changes
			draw();
		};
		var start = function () {
			if (!rafId && inView && !document.hidden && !reduceMotion.matches) rafId = requestAnimationFrame(loop);
		};
		var stop = function () {
			if (rafId) cancelAnimationFrame(rafId);
			rafId = 0;
		};

		readColor();
		resize();
		if ('ResizeObserver' in window) {
			new ResizeObserver(function () { resize(); }).observe(hero);
		} else {
			window.addEventListener('resize', resize);
		}
		new IntersectionObserver(function (entries) {
			inView = entries[0].isIntersecting;
			if (inView) start(); else stop();
		}).observe(hero);
		document.addEventListener('visibilitychange', function () {
			if (document.hidden) stop(); else start();
		});
		if (reduceMotion.addEventListener) {
			reduceMotion.addEventListener('change', function (e) {
				canvas.hidden = e.matches;
				if (e.matches) stop(); else start();
			});
		}
	}
})();

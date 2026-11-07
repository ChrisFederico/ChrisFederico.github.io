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
})();

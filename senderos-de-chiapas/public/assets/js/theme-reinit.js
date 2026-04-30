/**
 * Reinicializa sliders, WOW, niceSelect, etc. al cambiar de ruta (SPA).
 * Soluciona secciones "muy grandes" en la primera navegación.
 * Cargar después de theme.js. Llamar window.reinitTheme() desde React al cambiar pathname.
 */
(function () {
    'use strict';

    var SLIDER_SELECTORS = [
        '.hero-slider-one',
        '.hero-slider-two',
        '.hero-slider-three',
        '.slider-active-3-item',
        '.slider-destinations-grid',
        '.slider-active-3-item-dot',
        '.slider-active-4-item',
        '.slider-active-5-item',
        '.place-slider',
        '.recent-place-slider',
        '.testimonial-slider-one',
        '.product-big-slider',
        '.product-thumb-slider',
        '.partner-slider-one'
    ];

    function unslickAll($) {
        SLIDER_SELECTORS.forEach(function (sel) {
            var $el = $(sel);
            if ($el.length && $el.hasClass('slick-initialized') && typeof $el.slick === 'function') {
                try { $el.slick('unslick'); } catch (e) { /* ignore */ }
            }
        });
    }

    function initSliders($) {
        if (typeof $.fn.slick === 'undefined') return;

        if ($('.hero-slider-one').length) {
            $('.hero-slider-one').slick({
                dots: false, arrows: true, infinite: true, speed: 800, fade: true, autoplay: true,
                slidesToShow: 1, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="fal fa-arrow-left"></i></div>',
                nextArrow: '<div class="next"><i class="fal fa-arrow-right"></i></div>',
                responsive: [{ breakpoint: 1200, settings: { arrows: false } }]
            });
        }
        if ($('.hero-slider-two').length) {
            $('.hero-slider-two').slick({
                dots: false, arrows: true, infinite: true, speed: 800, fade: true,
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)', autoplay: true,
                slidesToShow: 1, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
                responsive: [{ breakpoint: 1024, settings: { arrows: false } }]
            });
        }
        if ($('.hero-slider-three').length) {
            var hero3Arrows = $('.hero-arrows');
            $('.hero-slider-three').slick({
                dots: false, arrows: true, infinite: true, speed: 800, fade: true,
                appendArrows: hero3Arrows, cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)', autoplay: true,
                slidesToShow: 1, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
                responsive: [{ breakpoint: 991, settings: { arrows: false } }]
            });
        }
        if ($('.slider-active-3-item').length) {
            $('.slider-active-3-item').slick({
                dots: false, arrows: true, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 3, slidesToScroll: 1,
                prevArrow: '<div class="prev slick-arrow"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next slick-arrow"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 991, settings: { slidesToShow: 2 } },
                    { breakpoint: 800, settings: { slidesToShow: 1 } }
                ]
            });
        }
        if ($('.slider-destinations-grid').length) {
            $('.slider-destinations-grid').slick({
                dots: false, arrows: true, infinite: true, speed: 800, autoplay: true,
                variableWidth: true, centerMode: true, centerPadding: '0px',
                slidesToScroll: 1,
                prevArrow: '<div class="prev slick-arrow"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next slick-arrow"><i class="far fa-angle-right"></i></div>'
            });
        }
        if ($('.slider-active-3-item-dot').length) {
            $('.slider-active-3-item-dot').slick({
                dots: true, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 3, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 991, settings: { slidesToShow: 2 } },
                    { breakpoint: 800, settings: { slidesToShow: 1 } }
                ]
            });
        }
        if ($('.slider-active-4-item').length) {
            $('.slider-active-4-item').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 4, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 3 } },
                    { breakpoint: 1200, settings: { slidesToShow: 2 } },
                    { breakpoint: 575, settings: { slidesToShow: 1 } }
                ]
            });
        }
        if ($('.slider-active-5-item').length) {
            $('.slider-active-5-item').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 5, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 4 } },
                    { breakpoint: 1199, settings: { slidesToShow: 3 } },
                    { breakpoint: 991, settings: { slidesToShow: 2 } },
                    { breakpoint: 575, settings: { slidesToShow: 1 } }
                ]
            });
        }
        // Importante: no inicializar Slick en elementos ocultos (display:none),
        // porque calcula anchos en 0 y el slider queda roto en mobile / navegación SPA.
        var $placeSliders = $('.place-slider:visible');
        if ($placeSliders.length) {
            $placeSliders.each(function () {
                var $el = $(this);
                $el.slick({
                    dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                    variableWidth: true, slidesToShow: 3, slidesToScroll: 1,
                    prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
                    nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
                    responsive: [{ breakpoint: 767, settings: { slidesToShow: 1 } }]
                });
                try { $el.slick('setPosition'); } catch (e) { /* ignore */ }
            });
        }
        if ($('.recent-place-slider').length) {
            var placeArrows = $('.place-arrows');
            $('.recent-place-slider').slick({
                dots: false, arrows: true, infinite: true, speed: 800, autoplay: true,
                appendArrows: placeArrows, slidesToShow: 2, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-arrow-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-arrow-right"></i></div>',
                responsive: [{ breakpoint: 767, settings: { slidesToShow: 1 } }]
            });
        }
        if ($('.testimonial-slider-one').length) {
            $('.testimonial-slider-one').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 1, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
            });
        }
        if ($('.product-big-slider').length) {
            $('.product-big-slider').slick({
                dots: false, arrows: false, speed: 800, autoplay: true, fade: true,
                asNavFor: '.product-thumb-slider', slidesToShow: 1, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
            });
        }
        if ($('.product-thumb-slider').length) {
            $('.product-thumb-slider').slick({
                dots: false, arrows: false, speed: 800, autoplay: true,
                asNavFor: '.product-big-slider', focusOnSelect: true,
                slidesToShow: 3, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>'
            });
        }
        if ($('.partner-slider-one').length) {
            $('.partner-slider-one').slick({
                dots: false, arrows: false, infinite: true, speed: 800, autoplay: true,
                slidesToShow: 5, slidesToScroll: 1,
                prevArrow: '<div class="prev"><i class="far fa-angle-left"></i></div>',
                nextArrow: '<div class="next"><i class="far fa-angle-right"></i></div>',
                responsive: [
                    { breakpoint: 1400, settings: { slidesToShow: 4 } },
                    { breakpoint: 991, settings: { slidesToShow: 3 } },
                    { breakpoint: 800, settings: { slidesToShow: 2 } },
                    { breakpoint: 575, settings: { slidesToShow: 1 } }
                ]
            });
        }
    }

    function reinitNiceSelect($) {
        if (typeof $.fn.niceSelect === 'undefined') return;
        try {
            if ($('select').length) {
                $('select').each(function () {
                    var $s = $(this);
                    if ($s.next('.nice-select').length) $s.niceSelect('destroy');
                });
                $('select').niceSelect();
            }
        } catch (e) { /* ignore */ }
    }

    function reinitDatepicker($) {
        if (typeof $.fn.datepicker === 'undefined') return;
        try {
            if ($('.datepicker').length) $('.datepicker').datepicker();
        } catch (e) { /* ignore */ }
    }

    function parseLocalDate(str) {
        if (!str) return null;
        var parts = (str.split('T')[0] || str).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (!parts) return null;
        var d = new Date(parseInt(parts[1], 10), parseInt(parts[2], 10) - 1, parseInt(parts[3], 10));
        return isNaN(d.getTime()) ? null : d;
    }

    function reinitCalendar($) {
        if (typeof $.fn.calendar === 'undefined') return;
        try {
            var $containers = $('.calendar-container');
            if ($containers.length) {
                $containers.each(function() {
                    var $el = $(this);
                    $el.empty();
                    var dateStr = $el.attr('data-calendar-date');
                    var endStr = $el.attr('data-calendar-end');
                    var initialDate = new Date();
                    var startDate = parseLocalDate(dateStr);
                    if (startDate) initialDate = startDate;
                    var opts = {
                        date: initialDate,
                        showTodayButton: false,
                        weekDayLength: 2,
                        prevButton: "<i class='far fa-angle-left'></i>",
                        nextButton: "<i class='far fa-angle-right'></i>",
                        monthMap: { 1: "enero", 2: "febrero", 3: "marzo", 4: "abril", 5: "mayo", 6: "junio", 7: "julio", 8: "agosto", 9: "septiembre", 10: "octubre", 11: "noviembre", 12: "diciembre" },
                        dayMap: { 0: "domingo", 1: "lunes", 2: "martes", 3: "miércoles", 4: "jueves", 5: "viernes", 6: "sábado" },
                        alternateDayMap: { 1: "lunes", 2: "martes", 3: "miércoles", 4: "jueves", 5: "viernes", 6: "sábado", 7: "domingo" },
                        todayButtonContent: "Hoy",
                        formatDate: function(d) {
                            var t = new Date();
                            if (d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()) return "HOY";
                            return d.getDate();
                        }
                    };
                    if (dateStr || endStr) {
                        var startMs = startDate ? startDate.getTime() : null;
                        var endDate = parseLocalDate(endStr);
                        var endMs = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime() : (startDate ? startDate.getTime() : null);
                        opts.customDateProps = function(d) {
                            var cellMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                            var inRange = (startMs !== null && cellMs >= startMs && (endMs === null || cellMs <= endMs));
                            return { classes: inRange ? 'calendar-date-marked' : '', data: {} };
                        };
                    }
                    $el.calendar(opts);
                });
            }
        } catch (e) { /* ignore */ }
    }

    function reinitMagnific($) {
        if (typeof $.fn.magnificPopup === 'undefined') return;
        try {
            if ($('.video-popup').length) {
                $('.video-popup').magnificPopup({ type: 'iframe', removalDelay: 300, mainClass: 'mfp-fade' });
            }
            if ($('.img-popup').length) {
                $('.img-popup').magnificPopup({ type: 'image', gallery: { enabled: true } });
            }
        } catch (e) { /* ignore */ }
    }

    function reinitWow() {
        if (typeof window.WOW === 'undefined') return;
        try {
            new window.WOW().init();
        } catch (e) { /* ignore */ }
    }

    function reinitTheme() {
        var $ = (typeof window !== 'undefined' && window.jQuery) ? window.jQuery : null;
        if (!$) return;
        unslickAll($);
        initSliders($);
        reinitNiceSelect($);
        reinitDatepicker($);
        reinitCalendar($);
        reinitMagnific($);
        reinitWow();
    }

    if (typeof window !== 'undefined') {
        window.reinitTheme = reinitTheme;
    }
})();

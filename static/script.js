const wrapper = document.getElementsByClassName("wrapper")[0];

window.addEventListener("DOMContentLoaded", () => {
	// disclaimer
	try {
		const btnDisclaimer = document.getElementById("btn-disclaimer");

		const wrapperDisclaimer = document.getElementById("wrapper-disclaimer");
		if (localStorage.getItem("disclaimerAccepted") === null) {
			wrapperDisclaimer.style.display = "flex";
		}
		btnDisclaimer.addEventListener("click", () => {
			wrapperDisclaimer.style.display = "none";
			localStorage.setItem("disclaimerAccepted", true);
		});
	} catch {}

	// card-slider

	$(document).ready(function () {
		$(".your-class").slick({
			infinite: false,
			slidesToShow: 4.2,
			slidesToScroll: 4,
			draggable: true,
			dots: true,
			arrows: true,
			prevArrow: $(".my-prev"),
			nextArrow: $(".my-next"),
			responsive: [
				{
					breakpoint: 1279,
					settings: {
						slidesToShow: 2.4,
						slidesToScroll: 2,
					},
				},
				{
					breakpoint: 480,
					settings: {
						arrows: false,
						centerMode: true,
						centerPadding: "40px",
						slidesToShow: 1,
					},
				},
			],
		});
		const sliderThing = document.getElementsByClassName("slick-list").item(0);
		console.log(sliderThing);
		sliderThing.classList.add("mask");
	});

	// open and close calculator overlay
	let calculatorIsOpen = false;
	const btnOpenCalculator = document.getElementById("btn-open-calculator");
	const btnOpenCalculatorNavi = document.getElementById("btn-open-calculator-navi");
	const btnOpenCalculatorHamburger = document.getElementById("btn-open-calculator-hamburger");
	const iconCloseCalculator = document.getElementById("icon-close-calculator");
	const tagBody = document.getElementsByTagName("body")[0];
	const calculatorHook = document.getElementById("preisrechner-hook");

	const toggleOverlayCalculator = (e) => {
		e.stopPropagation();
		if (calculatorIsOpen) {
			if (e.srcElement.id === "preisrechner-hook" || e.srcElement.id === "icon-close-calculator") {
				tagBody.classList.remove("overflow");
				calculatorHook.style.display = "none";
				calculatorIsOpen = false;
			}
		} else {
			tagBody.classList.add("overflow");
			calculatorHook.style.display = "flex";
			calculatorIsOpen = true;
		}
	};

	// button not available on all sites
	try {
		btnOpenCalculator.addEventListener("click", toggleOverlayCalculator);
	} catch {}

	// scroll 'Leistungen' into view (only on Index Page)
	try {
		const h1Leistungen = document.getElementById("h1-leistungen");

		const scrollLeistungenIntoView = () => {
			const y = h1Leistungen.getBoundingClientRect().top + window.scrollY;
			window.scroll({
				top: y,
				behavior: "smooth",
			});
		};

		const btnLeistungen = document.getElementById("btn-leistungen");
		btnLeistungen.addEventListener("click", scrollLeistungenIntoView);
	} catch {}

	btnOpenCalculatorNavi.addEventListener("click", toggleOverlayCalculator);
	btnOpenCalculatorHamburger.addEventListener("click", toggleOverlayCalculator);
	iconCloseCalculator.addEventListener("click", toggleOverlayCalculator);
	calculatorHook.addEventListener("click", toggleOverlayCalculator);
});

// #############################################
// media queries
// #############################################

const mq_str_1280 = "(min-width: 1280px)";
const mq_str_960 = "(max-width: 1279px) and (min-width: 960px)";
const mq_str_600 = "(max-width: 959px) and (min-width: 600px)";
const mq_str_320 = "(max-width: 599px)";

// #############################################
// handling the dropdown menu
// #############################################

const leistungen_link = document.getElementById("link-leistungen");
const leistungen_sublinks = document.getElementsByClassName("links-sub-leistungen")[0];
const ueberuns_link = document.getElementById("link-ueber-uns");
const ueberuns_sublinks = document.getElementsByClassName("links-sub-ueber-uns")[0];
const wrapperDropdown = document.getElementsByClassName("wrapper-dropdown")[0];

// eventListener to show the dropdown-menu background (wrapper)
wrapperDropdown.addEventListener("mouseout", onMouseOutHandler, true);

// eventListeners to show the hovered menu 1
leistungen_link.addEventListener("mouseenter", () => {
	wrapperDropdown.style.display = "block";
	leistungen_sublinks.style.display = "block";
	ueberuns_sublinks.style.display = "none";
	wrapperDropdown.classList.add("heity");
	wrapperDropdown.classList.remove("heity-out");
});
ueberuns_link.addEventListener("mouseenter", () => {
	wrapperDropdown.style.display = "block";
	leistungen_sublinks.style.display = "none";
	ueberuns_sublinks.style.display = "block";
	wrapperDropdown.classList.add("heity");
	wrapperDropdown.classList.remove("heity-out");
});

// check if the mouse is far enough away from the top of the page,
// if it is, hide the dropdown-menu (wrapper)
function onMouseOutHandler(event) {
	if (event.pageY >= wrapperDropdown.offsetHeight + 10) {
		// wrapperDropdown.style.display = "none";
		// var computedStyle = window.getComputedStyle(wrapperDropdown);
		// var max_hi = computedStyle.getPropertyValue("max-height");
		// wrapperDropdown.style.maxHeight = max_hi;
		wrapperDropdown.classList.remove("heity");
		wrapperDropdown.classList.add("heity-out");
	}
}
// hide dropdown menu on click
wrapperDropdown.addEventListener("click", () => {
	wrapperDropdown.style.display = "none";
});

// #############################################
// handling the hamburger menu
// #############################################

const wrapperHamburger = document.getElementsByClassName("wrapper-hamburger")[0];
const containerNavItemsHamburger = document.getElementsByClassName("container-nav-items-hamburger")[0];
containerNavItemsHamburger.style.display = "none";
const containerBtnOpenCalculatorHamburger = document.getElementsByClassName("container-btn-open-calculator-hamburger")[0];
const btnOpenCalculatorHamburger = document.getElementById("btn-open-calculator-hamburger");
const logoHamburger = document.getElementById("logo-hamburger");
const iconHamburger = document.getElementById("icon-hamburger");

let hamburgerMenuIsOpen = false;

const closeMenuHamburger = () => {
	containerNavItemsHamburger.style.display = "none";
	wrapperHamburger.style.background = "rgba(0,0,0,0)";
	iconHamburger.classList.remove("bright");
	logoHamburger.classList.remove("bright");
	btnOpenCalculatorHamburger.classList.remove("hamburger-menu-open");
	hamburgerMenuIsOpen = false;
	if (window.matchMedia(mq_str_320).matches) {
		containerBtnOpenCalculatorHamburger.style.display = "none";
	}
};

const openMenuHamburger = () => {
	containerNavItemsHamburger.style.display = "grid";
	wrapperHamburger.style.background = "linear-gradient(110deg, rgba(108,108,108,0.9) 20%, rgba(40, 40, 40, 0.9) 70%)";
	iconHamburger.classList.add("bright");
	logoHamburger.classList.add("bright");
	btnOpenCalculatorHamburger.classList.add("hamburger-menu-open");
	hamburgerMenuIsOpen = true;
	if (window.matchMedia(mq_str_320).matches) {
		containerBtnOpenCalculatorHamburger.style.display = "flex";
	}
};

const toggleMenuHamburger = () => {
	if (hamburgerMenuIsOpen === false) {
		openMenuHamburger();
	} else {
		closeMenuHamburger();
	}
};

iconHamburger.addEventListener("click", (e) => {
	e.stopPropagation();
	toggleMenuHamburger();
});

logoHamburger.addEventListener("click", (e) => {
	e.stopPropagation();
});

wrapperHamburger.addEventListener("click", toggleMenuHamburger);

const handleMediaQuery = (event) => {
	if (event.media === mq_str_320 && event.matches) {
		closeMenuHamburger();
		containerBtnOpenCalculatorHamburger.style.display = "none";
	} else if (event.media === mq_str_600 && event.matches) {
		closeMenuHamburger();
		containerBtnOpenCalculatorHamburger.style.display = "flex";
	}
};

const mq_320 = window.matchMedia(mq_str_320);
const mq_600 = window.matchMedia(mq_str_600);
mq_320.addEventListener("change", handleMediaQuery);
mq_600.addEventListener("change", handleMediaQuery);

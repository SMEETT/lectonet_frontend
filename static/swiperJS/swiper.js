const swiper = new Swiper(".swiper", {
	on: {
		init: function () {
			const wrapperSlider = document.getElementsByClassName("wrapper-slider")[0];
			const sliderLoader = document.getElementsByClassName("slider-loader")[0];
			sliderLoader.style.display = "none";
			wrapperSlider.style.display = "block";
			wrapperSlider.style.animation = "fadeIn 1s";
		},
	},
	// Optional parameters
	// If we need pagination
	// Responsive breakpoints
	breakpoints: {
		// when window width is >= 320px
		320: {
			slidesPerView: 1,
		},
		// when window width is >= 480px
		600: {
			slidesPerView: 2,
			// spaceBetween: 100,
		},
		// when window width is >= 640px
		960: {
			slidesPerView: 3,
			// spaceBetween: 120,
		},
		1280: {
			slidesPerView: 4,
			spaceBetween: 40,
		},
	},

	pagination: {
		el: ".swiper-pagination",
	},
	// Navigation arrows
	navigation: {
		nextEl: ".my-next",
		prevEl: ".my-prev",
	},
	// And if we need scrollbar
	// scrollbar: {
	// 	el: ".swiper-scrollbar",
	// },
});

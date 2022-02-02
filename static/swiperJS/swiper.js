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
	slidesPerView: 4,
	spaceBetween: 10,

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

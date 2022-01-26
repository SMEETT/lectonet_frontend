// card-slider
$(document).ready(function () {
	$(".your-class").slick({
		infinite: false,
		slidesToShow: 4,
		slidesToScroll: 4,
		draggable: true,
		touchThreshold: 15,
		// focusOnSelect: true,
		dots: true,
		arrows: true,
		prevArrow: $(".my-prev"),
		nextArrow: $(".my-next"),
		responsive: [
			{
				breakpoint: 1279,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 2,
				},
			},
			{
				breakpoint: 959,
				settings: {
					// infinite: true,
					slidesToShow: 2,
					slidesToScroll: 2,
				},
			},
			{
				breakpoint: 599,
				settings: {
					// centerMode: true,
					// centerPadding: "40px",
					infinite: true,
					arrows: false,
					slidesToShow: 1,
					slidesToScroll: 1,
				},
			},
		],
	});
	const sliderThing = document.getElementsByClassName("slick-list").item(0);
	console.log(sliderThing);
	sliderThing.classList.add("mask");
});

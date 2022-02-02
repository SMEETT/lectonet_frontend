// Unhide <body> after successful load
let domReady = (cb) => {
	document.readyState === "interactive" || document.readyState === "complete" ? cb() : document.addEventListener("DOMContentLoaded", cb);
};

domReady(() => {
	// Display body when DOM is loaded
	const wrapper = document.getElementsByClassName("wrapper")[0];
	console.log(wrapper);
	wrapper.style.display = "grid";
});

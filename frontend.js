// imports
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { expressCspHeader, NONE, SELF, INLINE } = require("express-csp-header");

const slugify = require("slugify");
const axios = require("axios");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const md = require("markdown-it")({
	html: true,
	typographer: true,
	quotes: "„“‚‘",
});
const compression = require("compression");

// environment variables
const strapiURL = process.env.strapiURL;
const priceCalcMailPW = process.env.priceCalcMailPW;
const priceCalcSMTP = process.env.priceCalcSMTP;
const frontendPORT = process.env.frontendPORT;

// express init
const app = express();

// gZip compression
app.use(compression());

// CSP Header
app.use(
	expressCspHeader({
		directives: {
			"default-src": [SELF, strapiURL, strapiURL.slice(0, -4)],
			"script-src": [SELF],
			"style-src": [SELF, INLINE, "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
			"img-src": [SELF, strapiURL, strapiURL.slice(0, -4), "https://www.lectonet.de"],
			"worker-src": [NONE],
			"block-all-mixed-content": true,
			"font-src": ["https://fonts.googleapis.com", "https://fonts.gstatic.com"],
			"frame-ancestors": [NONE],
			"connect-src": [SELF, strapiURL, strapiURL.slice(0, -4), "https://www.lectonet.de"],
		},
	})
);

app.use(cors());

// use EJS as template engine
app.set("view engine", "ejs");

// set up static folders
app.use("/static", express.static(path.resolve(__dirname, "static")));

// function to find page-specific css-files
const findSpecificCSS = (pageTitle) => {
	let urlCSS;
	try {
		fs.existsSync(`./static/css/specific/${pageTitle}.css`);
		urlCSS = `./static/css/specific/${pageTitle}.css`;
		return urlCSS;
	} catch (err) {
		console.error(err);
		urlCSS = false;
		return urlCSS;
	}
};

// build navigation and footer content
app.use(function (req, res, next) {
	const navItems = { leistungen: [], ueber_uns: [], footer: [] };
	const footerItems = ["FAQs", "Impressum", "Datenschutz", "Referenzen"].sort();

	// let strapi take care of the sorting
	const pages = `${strapiURL}/pages?_sort=title:ASC`;
	// fetch data
	const requestPages = axios.get(pages);
	requestPages
		.then((pages) => {
			console.log("PAAAAGES.DATA.DATA", pages.data.data);
			// get all titles from all pages and add them (based on category) to navItems
			// generate a slug based on the title for each page
			pages.data.data.forEach((page) => {
				if (page.attributes.category === "leistungen") {
					navItems.leistungen.push({
						title: page.attributes.title,
						slug: slugify(page.attributes.title, { lower: true }),
					});
				} else if (page.attributes.category === "ueber_uns") {
					navItems.ueber_uns.push({
						title: page.attributes.title,
						slug: slugify(page.attributes.title, { lower: true }),
					});
				}
			});
			// manually add "Wackwitz"
			navItems.ueber_uns.push({ title: "Wackwitz", slug: "wackwitz" });

			// add all (additional) footer-links to navItems (including slugs)
			footerItems.forEach((item) => {
				navItems.footer.push({ title: item, slug: slugify(item, { lower: true }) });
			});

			// attach navItems to res.locals so it can be accessed down the line
			res.locals.navItems = navItems;

			console.log("navItems:-----------", navItems);

			// call next middleware
			next();
		})
		.catch((error) => {
			console.log(error);
		});
});

//////////////////////////////////
// index route
//////////////////////////////////
app.get("/", (req, res) => {
	axios.get(`${strapiURL}/index?populate=*`).then((response) => {
		// add slugs for cards / generate markdown
		console.log("response data index-------------", response.data.data.attributes);
		response.data.data.attributes.card.forEach((entry) => {
			const slug = slugify(entry.title, { lower: true });
			entry.slug = slug;
			entry.teasertext = md.renderInline(entry.teasertext);
		});
		console.log(response.data.card);
		res.render("pages/index", {
			navItems: res.locals.navItems,
			title: "Home",
			meta_keywords: response.data.data.attributes.meta_keywords,
			meta_description: response.data.data.attributes.meta_description,
			headline: md.renderInline(response.data.data.attributes.headline),
			subheadline: md.renderInline(response.data.data.attributes.subheadline),
			copytext: md.renderInline(response.data.data.attributes.copytext),
			cards: response.data.data.attributes.card.sort((a, b) => a.position - b.position),
		});
	});
});

//////////////////////////////////
// Referenzen und Wackwitz
//////////////////////////////////

app.get(["/wackwitz", "/referenzen"], (req, res) => {
	axios.get(`${strapiURL}/referenzen-und-wackwitz?populate=*`).then((response) => {
		console.log("IMAGE URL", strapiURL.slice(0, -4) + response.data.data.attributes.foto_wackwitz.data.attributes.url);
		res.render("pages/ref_ww", {
			navItems: res.locals.navItems,
			title: "Referenzen / Wackwitz",
			meta_keywords: response.data.data.attributes.meta_keywords,
			meta_description: response.data.data.attributes.vmeta_description,
			headline_referenzen: md.renderInline(response.data.data.attributes.headline_referenzen),
			subheadline_referenzen: md.renderInline(response.data.data.attributes.subheadline_referenzen),
			copytext_referenzen: md.renderInline(response.data.data.attributes.copytext_referenzen),
			headline_wackwitz: md.renderInline(response.data.data.attributes.headline_wackwitz),
			subheadline_wackwitz: md.renderInline(response.data.data.attributes.subheadline_wackwitz),
			image: response.data.data.attributes.foto_wackwitz.data.attributes,
			image_text: md.renderInline(response.data.data.attributes.bildunterschrift_wackwitz),
			strapiURL: strapiURL.slice(0, -4),
		});
	});
});

//////////////////////////////////
// FAQs
//////////////////////////////////

app.get("/faqs", (req, res) => {
	axios.get(`${strapiURL}/fa-qs`).then((response) => {
		res.render("pages/faqs", {
			navItems: res.locals.navItems,
			title: "FAQs",
			data: response.data.FAQ,
		});
	});
});

//////////////////////////////////
// Imprint
//////////////////////////////////

app.get("/impressum", (req, res) => {
	axios.get(`${strapiURL}/impressum`).then((response) => {
		res.render("pages/impressum", {
			navItems: res.locals.navItems,
			title: "Impressum",
			copytext: md.render(response.data.copytext),
		});
	});
});

//////////////////////////////////
// Imprint
//////////////////////////////////

app.get("/datenschutz", (req, res) => {
	axios.get(`${strapiURL}/datenschutz`).then((response) => {
		res.render("pages/datenschutz", {
			navItems: res.locals.navItems,
			title: "Datenschutz",
			copytext: md.render(response.data.data.attributes.copytext),
		});
	});
});

//////////////////////////////////
// dynamic routing
//////////////////////////////////
app.get("/:path", (req, res) => {
	axios.get(`${strapiURL}/pages?populate=*`).then((response) => {
		// look for page with a title that matches the requested route
		const match = response.data.data.find((page) => {
			return slugify(page.attributes.title, { lower: true }) === req.params.path;
		});

		// if no match is returned, redirect to index-route ("/")
		if (!match) {
			res.redirect("/");
		}

		// render template based on provided category
		if (match.attributes.category === "leistungen") {
			res.render("pages/leistungen", {
				navItems: res.locals.navItems,
				title: match.attributes.title,
				meta_keywords: match.attributes.meta_keywords,
				meta_description: match.attributes.meta_description,
				superheadline: md.renderInline(match.attributes.superheadline),
				headline: md.renderInline(match.attributes.headline),
				subheadline: md.renderInline(match.attributes.subheadline),
				copytext: md.renderInline(match.attributes.copytext),
				image: match.attributes.image.data.attributes,
				strapiURL: strapiURL.slice(0, -4),
				css: findSpecificCSS(slugify(match.attributes.title, { lower: true })),
			});
		}

		if (match.category === "ueber_uns") {
			res.render("pages/ueber_uns", {
				navItems: res.locals.navItems,
				title: match.attributes.title,
				meta_keywords: match.attributes.meta_keywords,
				meta_description: match.attributes.meta_description,
				headline: md.renderInline(match.attributes.headline),
				subheadline: md.renderInline(match.attributes.subheadline),
				copytext: md.render(match.attributes.copytext),
				image: match.attributes.image,
				strapiURL: strapiURL.slice(0, -4),
				css: findSpecificCSS(slugify(match.title, { lower: true })),
			});
		}
	});
});

//////////////////////////////////
// send 'Preisrechner' E-Mail
//////////////////////////////////

app.post("/send/price", (req, res) => {
	console.log("/send/price");

	const receiver = req.query.email;
	const firstname = req.query.firstname;
	const lastname = req.query.lastname;
	const price = req.query.price;
	const service = req.query.service;
	const type = req.query.type;
	const quantity = req.query.quantity;

	// don't show 'quantity' when 'Bewerbung' was selected
	let interchangeableBit;
	if (service === "Bewerbung") {
		interchangeableBit = `
        <b>Umfang: </b>${type}<br>
        `;
	} else {
		interchangeableBit = `
        <b>Art: </b>${type}<br>
        <b>Umfang: </b>${quantity} Seite(n)<br>
        `;
	}

	const subject = "Ihre Preisanfrage auf Lectonet.de";
	const html = `<b>Sehr geehrte(r) ${firstname} ${lastname}! </b><br>
    <br>
    Anbei finden Sie den von Ihnen berechneten Preis:<br>
    <br>
    <b>Leistung: </b>${service}<br>
    ${interchangeableBit}
    <b>Preis: </b>${price} €<br>
    <br>
    Bei weiteren Fragen stehen wir Ihnen gerne zur Verfügung.<br/>
    <br>
    Mit freundlichen Grüßen, <br>
    R. Wackwitz, Geschäftsführer<br>
    <br>
    <img src="cid:unique@kreata.ee"/><br>
    Rüdiger Wackwitz<br>
    Eine Straße 17<br>
    53215 Ort<br>
    <br>
    02214 / 4236231<br>
    info@lectonet.de<br>
    www.lectonet.de<br>
    `;

	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		port: 587,
		host: priceCalcSMTP,
		auth: {
			user: "info@lectonet.de",
			pass: priceCalcMailPW,
		},
		tls: {
			ciphers: "SSLv3",
		},
		secureConnection: false,
	});

	const mailData = {
		from: "info@lectonet.de", // sender address
		to: receiver, // list of receivers
		subject: subject,
		html: html,
		attachments: [
			{
				filename: "logo_grey.svg",
				path: "../frontend/static/images/logo_grey_optimized.svg",
				cid: "unique@kreata.ee", //same cid value as in the html img src
			},
		],
	};

	transporter.sendMail(mailData, function (err, info) {
		if (err) console.log(err);
		else console.log(info);
	});
	res.status(204).send("Ok");
});

app.listen(frontendPORT, () => console.log(`Server running on port ${frontendPORT}`));

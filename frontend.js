// imports
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { expressCspHeader, NONE, SELF, INLINE, NONCE, STRICT_DYNAMIC } = require("express-csp-header");
const crypto = require("crypto");
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
const mila = require("markdown-it-link-attributes");
md.use(mila, {
	attrs: {
		target: "_blank",
		rel: "noopener",
		class: "default-link",
	},
});

let count = 0;

const compression = require("compression");

// environment variables
const strapiURL = process.env.strapiURL;
const strapiAPI = `${strapiURL}/api`;
const frontendURL = process.env.frontendURL;
const priceCalcMailPW = process.env.priceCalcMailPW;
const priceCalcSMTP = process.env.priceCalcSMTP;
const frontendPORT = process.env.frontendPORT;

// express init
const app = express();

app.use(bodyParser.json());

app.use(morgan("dev"));

// gZip compression
app.use(compression());

// set up static folders
app.use("/static", express.static(path.resolve(__dirname, "static")));

app.use(function (req, res, next) {
	console.log("Before Express CSP Header Middleware");
	next();
});

// CSP Header
app.use(
	expressCspHeader({
		directives: {
			"default-src": [SELF, strapiURL],
			"script-src": [[NONCE], STRICT_DYNAMIC],
			"style-src": [SELF, INLINE, "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://tagmanager.google.com", "https://unpkg.com"],
			"img-src": [
				SELF,
				strapiURL,
				frontendURL,
				"https://consentcdn.cookiebot.com",
				"https://consent.cookiebot.com",
				"* data:",
				"https://ssl.gstatic.com",
				"https://www.gstatic.com",
			],
			"worker-src": [NONE],
			"block-all-mixed-content": true,
			"font-src": [SELF, "https://fonts.googleapis.com", "https://fonts.gstatic.com", "data:"],
			"frame-ancestors": [NONE],
			"frame-src": [SELF, "https://consentcdn.cookiebot.com"],
			"connect-src": [
				SELF,
				strapiURL,
				frontendURL,
				"ws://localhost:35729",
				"ws://localhost:35730",
				"https://consentcdn.cookiebot.com",
				"https://www.google-analytics.com",
			],
		},
	})
);

app.use(function (req, res, next) {
	console.log("-------------------------------------------> generated NONCE: ", req.nonce);
	next();
});

app.use(cors());

// use EJS as template engine
app.set("view engine", "ejs");

// function to find page-specific css-files
const findSpecificCSS = (pageTitle) => {
	let urlCSS;
	try {
		if (fs.existsSync(`./static/css/specific/${pageTitle}.css`)) {
			urlCSS = `./static/css/specific/${pageTitle}.css`;
			return urlCSS;
		} else {
			urlCSS = false;
			return urlCSS;
		}
	} catch (err) {
		console.error(err);
		urlCSS = false;
		return urlCSS;
	}
};

// build navigation and footer content
app.use(function (req, res, next) {
	const navItems = { leistungen: [], ueber_uns: [], footer: [] };
	const footerItems = ["Links", "Impressum", "Datenschutz", "Referenzen"].sort();

	// let strapi take care of the sorting
	const pages = `${strapiAPI}/pages?_sort=title:ASC`;
	// fetch data
	const requestPages = axios.get(pages);
	requestPages
		.then((response) => {
			const pages = response.data.data;
			pages.forEach((page) => {
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

			// manually add "FAQs" to "Leistungen"
			navItems.leistungen.push({ title: "FAQs", slug: "faqs" });

			// manually add "Wackwitz" to "Ueber Uns"
			navItems.ueber_uns.push({ title: "Wackwitz", slug: "wackwitz" });

			// manually add "Kontakt" to "Ueber Uns"
			navItems.ueber_uns.push({ title: "Kontakt", slug: "kontakt" });

			// add all (additional) footer-links to navItems (including slugs)
			footerItems.forEach((item) => {
				navItems.footer.push({ title: item, slug: slugify(item, { lower: true }) });
			});

			// attach navItems to res.locals so it can be accessed down the line
			res.locals.navItems = navItems;

			// console.log("navItems:-----------", navItems);

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
app.get("/", async (req, res) => {
	console.log("app.get('/')");
	console.log("passed NONCE to '/' route: ------> ", req.nonce);
	axios.get(`${strapiAPI}/index?populate=*`).then((response) => {
		const data = response.data.data;
		// add slugs for cards / generate markdown
		data.attributes.card.forEach((card) => {
			const slug = slugify(card.title, { lower: true });
			card.slug = slug;
			card.teasertext = md.renderInline(card.teasertext);
		});
		res.render("pages/index", {
			navItems: res.locals.navItems,
			title: "Home",
			meta_keywords: data.attributes.meta_keywords,
			meta_description: data.attributes.meta_description,
			headline: md.renderInline(data.attributes.headline),
			subheadline: md.renderInline(data.attributes.subheadline),
			copytext: md.renderInline(data.attributes.copytext),
			cards: data.attributes.card.sort((a, b) => a.position - b.position),
			nonce: req.nonce,
		});
	});
});

//////////////////////////////////
// Referenzen und Wackwitz
//////////////////////////////////

app.get(["/wackwitz", "/referenzen"], (req, res) => {
	axios.get(`${strapiAPI}/referenzen-und-wackwitz?populate=*`).then((response) => {
		const data = response.data.data;
		res.render("pages/ref_ww", {
			navItems: res.locals.navItems,
			title: "Referenzen / Wackwitz",
			meta_keywords: data.attributes.meta_keywords,
			meta_description: data.attributes.meta_description,
			headline_referenzen: md.renderInline(data.attributes.headline_referenzen),
			subheadline_referenzen: md.renderInline(data.attributes.subheadline_referenzen),
			copytext_referenzen: md.renderInline(data.attributes.copytext_referenzen),
			headline_wackwitz: md.renderInline(data.attributes.headline_wackwitz),
			subheadline_wackwitz: md.renderInline(data.attributes.subheadline_wackwitz),
			image: data.attributes.foto_wackwitz.data.attributes,
			image_text: md.renderInline(data.attributes.bildunterschrift_wackwitz),
			strapiURL: strapiURL,
			nonce: req.nonce,
		});
	});
});

//////////////////////////////////
// FAQs
//////////////////////////////////

app.get("/faqs", (req, res) => {
	axios.get(`${strapiAPI}/faq?populate=*`).then((response) => {
		const data = response.data.data.attributes.FAQ;
		data.forEach((faq, i) => {
			data[i].answer = md.renderInline(data[i].answer);
		});
		res.render("pages/faqs", {
			navItems: res.locals.navItems,
			title: "FAQs",
			data: data,
			nonce: req.nonce,
		});
	});
});

//////////////////////////////////
// Imprint
//////////////////////////////////

app.get("/impressum", (req, res) => {
	axios.get(`${strapiAPI}/impressum`).then((response) => {
		const data = response.data.data;
		res.render("pages/impressum", {
			navItems: res.locals.navItems,
			title: "Impressum",
			copytext: md.render(data.attributes.copytext),
			nonce: req.nonce,
		});
	});
});

//////////////////////////////////
// Datenschutz
//////////////////////////////////

app.get("/datenschutz", (req, res) => {
	axios.get(`${strapiAPI}/datenschutz`).then((response) => {
		const data = response.data.data.attributes;
		res.render("pages/datenschutz", {
			navItems: res.locals.navItems,
			title: data.title,
			copytext: md.render(data.copytext),
			nonce: req.nonce,
		});
	});
});

//////////////////////////////////
// Links
//////////////////////////////////

app.get("/links", (req, res) => {
	axios.get(`${strapiAPI}/link?populate=*`).then((response) => {
		const data = response.data.data.attributes;
		res.render("pages/links", {
			navItems: res.locals.navItems,
			title: data.title,
			subhead: data.subhead,
			data: data.Link,
			nonce: req.nonce,
		});
	});
});

//////////////////////////////////
// Kontakt
//////////////////////////////////

app.get("/kontakt", (req, res) => {
	axios.get(`${strapiAPI}/kontakt?populate=*`).then((response) => {
		const data = response.data.data.attributes;
		res.render("pages/kontakt", {
			navItems: res.locals.navItems,
			title: data.title,
			subhead: data.subhead,
			copytext: md.render(data.copytext),
			nonce: req.nonce,
		});
	});
});

//////////////////////////////////
// dynamic routing
//////////////////////////////////
app.get("/:path", (req, res) => {
	axios.get(`${strapiAPI}/pages?populate=*`).then((response) => {
		console.log("dynamic routing");
		// look for page with a title that matches the requested route
		const match = response.data.data.find((page) => {
			return slugify(page.attributes.title, { lower: true }) === req.params.path;
		});

		// if no match is returned, redirect to index-route ("/")
		if (!match) {
			res.redirect("/");
		} else {
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
					strapiURL: strapiURL,
					css: findSpecificCSS(slugify(match.attributes.title, { lower: true })),
					nonce: req.nonce,
				});
			}

			if (match.attributes.category === "ueber_uns") {
				res.render("pages/ueber_uns", {
					navItems: res.locals.navItems,
					title: match.attributes.title,
					meta_keywords: match.attributes.meta_keywords,
					meta_description: match.attributes.meta_description,
					headline: md.renderInline(match.attributes.headline),
					subheadline: md.renderInline(match.attributes.subheadline),
					copytext: md.render(match.attributes.copytext),
					image: match.attributes.image.data.attributes,
					strapiURL: strapiURL,
					css: findSpecificCSS(slugify(match.attributes.title, { lower: true })),
					nonce: req.nonce,
				});
			}
		}
	});
});

//////////////////////////////////
// send 'Preisrechner' E-Mail
//////////////////////////////////

app.post("/send/price", (req, res) => {
	const receiver = req.query.email;
	const firstname = req.query.firstname;
	const lastname = req.query.lastname;
	const price = req.query.price;
	const service = req.query.service;
	const group = req.query.group;
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
        <b>Art der Arbeit: </b>${type}<br>
        <b>Umfang: </b>${quantity} Seite(n)<br>
        `;
	}

	const subject = "Ihre Preisanfrage auf lectonet.de";
	const html = `<b>Sehr geehrte(r) ${firstname} ${lastname}! </b><br>
    <br>
    Anbei finden Sie den nach Ihren Angaben kalkulierten lectonet-Preis:<br>
    <br>
    <b>Sie sind: </b>${group}<br>
    <b>Sie benötigen: </b>${service}<br>
    ${interchangeableBit}
    <b>ca.-Preis: </b>${price} (* unverbindliche Preisauskunft)<br>
    <br>
    Interessant für Sie? Dann setzen Sie sich bitte für ein detailliertes, verbindliches Angebot und gerne auch bei weiteren Fragen mit uns in Verbindung!<br/>
    <br>
    Herzliche Grüße<br>
    Rüdiger Wackwitz<br>
    <br>
    <img width=145 height=28 src="cid:unique@kreata.ee"/><br>
    Rüdiger Wackwitz<br>
    Mittelstraße 12<br>
    58256 Ennepetal<br>
    <br>
    02333 688 660 -0<br>
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
		bcc: "info@lectonet.de",
		subject: subject,
		html: html,
		attachments: [
			{
				filename: "logo_grey.svg",
				path: "./static/images/logo_grey_optimized.svg",
				cid: "unique@kreata.ee", //same cid value as in the html img src
			},
		],
	};

	transporter.sendMail(mailData, function (err, info) {
		// if (err) console.log(err);
		// else console.log(info);
	});
	res.status(204).send("Ok");
});

//////////////////////////////////
// 'Price Calce'  END!!!
//////////////////////////////////

//////////////////////////////////
// send 'Contact Form'
//////////////////////////////////

app.post("/send/contactform", (req, res) => {
	console.log("post contactform");
	console.log("req", req.headers);
	const receiver = req.body.email;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const msg = req.body.msg;

	const subject = "Ihre Kontaktanfrage auf lectonet.de";
	const html = `<b>Sehr geehrte(r) ${firstname} ${lastname}! </b><br>
    <br>
    Anbei finden Sie die von Ihnen gesendete Nachricht.<br>
    Wir setzen uns schnellstmoeglich mit Ihnen in Verbindung.<br>
    <br>
    <br>${msg}<br>
    <br>
    <br>
    Herzliche Grüße<br>
    Rüdiger Wackwitz<br>
    <br>
    <img width=145 height=28 src="cid:unique@kreata.ee"/><br>
    Rüdiger Wackwitz<br>
    Mittelstraße 12<br>
    58256 Ennepetal<br>
    <br>
    02333 688 660 -0<br>
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
		bcc: "info@lectonet.de",
		subject: subject,
		html: html,
		attachments: [
			{
				filename: "logo_grey.svg",
				path: "./static/images/logo_grey_optimized.svg",
				cid: "unique@kreata.ee", //same cid value as in the html img src
			},
		],
	};

	transporter.sendMail(mailData, function (err, info) {
		// if (err) console.log(err);
		// else console.log(info);
	});
	res.json("204: OK / Mail sent");
	// res.status(204).send("Ok");
});

//////////////////////////////////
// 'Contact-Form'  END!!!
//////////////////////////////////

//////////////////////////////////
// send 'Bewerbungsformular 222'
//////////////////////////////////

app.post("/send/bewerbungsformular_2", (req, res) => {
	console.log("post bewerbungsformular 2");
	console.log("req", req.headers);
	const receiver = req.body.email;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const street = req.body.street;
	const housenumber = req.body.housenumber;
	const zip = req.body.zip;
	const city = req.body.city;
	const email = req.body.email;
	const telephone = req.body.telephone;
	const messages = req.body.messages;

	const subject = "Ihre Bewerbungs als lectonetter";
	const html = `<b>Sehr geehrte(r) ${firstname} ${lastname}! </b><br>
    <br>
    Anbei finden Sie die von Ihnen gesendete Bewerbung.<br>
    Wir setzen uns schnellstmoeglich mit Ihnen in Verbindung.<br>
    <br>
    Herzliche Grüße<br>
    Rüdiger Wackwitz<br>
    <br>
    <img width=145 height=28 src="cid:unique@kreata.ee"/><br>
    Rüdiger Wackwitz<br>
    Mittelstraße 12<br>
    58256 Ennepetal<br>
    <br>
    02333 688 660 -0<br>
    info@lectonet.de<br>
    www.lectonet.de<br>
    <br>
    <br>
    -----------------------------------------------------<br>
    <strong>Name:</strong> ${lastname}<br>
    <strong>Vorname:</strong> ${firstname}<br>
    <strong>Strasse:</strong> ${street}<br>
    <strong>Hausnummer:</strong> ${housenumber}<br>
    <strong>PLZ:</strong> ${zip}<br>
    <strong>Ort:</strong> ${city}<br>
    <strong>E-Mail Adresse:</strong> ${email}<br>
    <strong>Telefonnummer:</strong> ${telephone}<br>
    <br>
    <strong>
      Derzeitige berufliche Tätigkeit:<br>
    </strong>
    ${messages[1].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Meine Erfahrungen im Bereich Textbearbeitung:<br>
    </strong>
    ${messages[2].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Das zeichnet mich als Quereinsteiger aus:<br>
    </strong>
    ${messages[3].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Darum will ich lectonet-Partner werden:<br>
    </strong>
    ${messages[4].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Diese Art von Aufträgen entspricht absolut meinem Stärken-und-Vorlieben-Profil:<br>
    </strong>
    ${messages[5].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Diese Art von Aufträgen kann ich übernehmen, aber nicht bevorzugt:<br>
    </strong>
    ${messages[6].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Diese Art von Aufträgen kann ich nicht annehmen:<br>
    </strong>
    ${messages[7].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Sonstiges:<br>
    </strong>
    ${messages[8].replace(/\n\r?/g, "<br />")}<br>
    <br>

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
		bcc: "info@lectonet.de",
		subject: subject,
		html: html,
		attachments: [
			{
				filename: "logo_grey.svg",
				path: "./static/images/logo_grey_optimized.svg",
				cid: "unique@kreata.ee", //same cid value as in the html img src
			},
		],
	};

	transporter.sendMail(mailData, function (err, info) {
		// if (err) console.log(err);
		// else console.log(info);
	});
	res.json("204: OK / Mail sent");
	// res.status(204).send("Ok");
});

//////////////////////////////////
// 'Bewerbungsformular 2'  END!!!
//////////////////////////////////

//////////////////////////////////
// send 'Bewerbungsformular'
//////////////////////////////////

app.post("/send/bewerbungsformular", (req, res) => {
	console.log("post bewerbungsformular");
	console.log("req", req.headers);
	const receiver = req.body.email;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const street = req.body.street;
	const housenumber = req.body.housenumber;
	const zip = req.body.zip;
	const city = req.body.city;
	const email = req.body.email;
	const telephone = req.body.telephone;
	const messages = req.body.messages;

	const subject = "Ihre Bewerbungs als lectonetter";
	const html = `<b>Sehr geehrte(r) ${firstname} ${lastname}! </b><br>
    <br>
    Anbei finden Sie die von Ihnen gesendete Bewerbung.<br>
    Wir setzen uns schnellstmoeglich mit Ihnen in Verbindung.<br>
    <br>
    Herzliche Grüße<br>
    Rüdiger Wackwitz<br>
    <br>
    <img width=145 height=28 src="cid:unique@kreata.ee"/><br>
    Rüdiger Wackwitz<br>
    Mittelstraße 12<br>
    58256 Ennepetal<br>
    <br>
    02333 688 660 -0<br>
    info@lectonet.de<br>
    www.lectonet.de<br>
    <br>
    <br>
    -----------------------------------------------------<br>
    <strong>Name:</strong> ${lastname}<br>
    <strong>Vorname:</strong> ${firstname}<br>
    <strong>Strasse:</strong> ${street}<br>
    <strong>Hausnummer:</strong> ${housenumber}<br>
    <strong>PLZ:</strong> ${zip}<br>
    <strong>Ort:</strong> ${city}<br>
    <strong>E-Mail Adresse:</strong> ${email}<br>
    <strong>Telefonnummer:</strong> ${telephone}<br>
    <br>
    <strong>
      Ich bin tätig im/in Korrektorat/Lektorat/Redaktion seit:<br>
    </strong>
    ${messages[1].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Meine relevanten Qualifikationen:<br>
    </strong>
    ${messages[2].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Meine relevanten beruflichen Erfahrungen (bitte mit Dauer und Arbeit-/Auftraggeber):<br>
    </strong>
    ${messages[3].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Mein wissenschaftliches Fachgebiet (gerne auch mehrere):<br>
    </strong>
    ${messages[4].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Diese Art von Aufträgen entspricht absolut meinem Stärken-und-Vorlieben-Profil:<br>
    </strong>
    ${messages[5].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Diese Art von Aufträgen kann ich übernehmen, aber nicht bevorzugt:<br>
    </strong>
    ${messages[6].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Diese Art von Aufträgen kann ich nicht annehmen:<br>
    </strong>
    ${messages[7].replace(/\n\r?/g, "<br />")}<br>
    <br>
    <strong>
      Sonstiges:<br>
    </strong>
    ${messages[8].replace(/\n\r?/g, "<br />")}<br>
    <br>

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
		bcc: "info@lectonet.de",
		subject: subject,
		html: html,
		attachments: [
			{
				filename: "logo_grey.svg",
				path: "./static/images/logo_grey_optimized.svg",
				cid: "unique@kreata.ee", //same cid value as in the html img src
			},
		],
	};

	transporter.sendMail(mailData, function (err, info) {
		// if (err) console.log(err);
		// else console.log(info);
	});
	res.json("204: OK / Mail sent");
	// res.status(204).send("Ok");
});

//////////////////////////////////
// 'Bewerbungsformular'  END!!!
//////////////////////////////////

app.listen(frontendPORT, () => console.log(`Server running on port ${frontendPORT}`));

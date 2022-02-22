import * as yup from "yup";

const maxChars = 500;

const regSchema = yup.object().shape({
	firstname: yup.string().required("(Bitte geben Sie Ihren Vornamen ein)"),
	lastname: yup.string().required("(Bitte geben Sie Ihren Namen ein)"),
	street: yup.string().required("(Bitte geben Sie die Staße an)"),
	housenumber: yup.string().required("(Bitte geben Sie die Hausnummer an)"),
	zip: yup.string().required("(Bitte geben Sie die PLZ an)"),
	city: yup.string().required("(Bitte geben Sie den Ort an)"),
	telephone: yup.string().required("(Bitte geben Sie Ihre Telefonnummer an)"),
	email: yup.string().email("(Die angebene E-Mail Adresse hat ein ungültiges Format)").required("(Bitte geben Sie Ihre E-Mail Adresse ein)"),
	messages: yup.object({
		1: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
		2: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
		3: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
		4: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
		5: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
		6: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
		7: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
		8: yup.string().required("(Dieses Feld bitte ausfüllen)").max(maxChars, `(Maximal ${maxChars} Zeichen erlaubt)`),
	}),
	agreed: yup.boolean().required("(Bitte akzeptieren Sie die Datenschutzerklärung)").oneOf([true], "(Bitte akzeptieren Sie die Datenschutzerklärung)"),
});

export { regSchema };

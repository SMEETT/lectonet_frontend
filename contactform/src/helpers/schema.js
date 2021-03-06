import * as yup from "yup";

const regSchema = yup.object().shape({
	lastname: yup.string().required("(Bitte geben Sie Ihren Namen ein)"),
	firstname: yup.string().required("(Bitte geben Sie Ihren Vornamen ein)"),
	email: yup.string().required("(Bitte geben Sie Ihre E-Mail Adresse ein)").email("(Die angebene E-Mail Adresse hat ein ungültiges Format)"),
	msg: yup.string().required("(Bitte geben Sie eine Nachricht ein.)"),
	agreed: yup.boolean().required("(Bitte akzeptieren Sie die Datenschutzerklärung)").oneOf([true], "(Bitte akzeptieren Sie die Datenschutzerklärung)"),
});

export { regSchema };

<script>
	import { regSchema } from "./helpers/schema";
	const fields = {
		firstname: "",
		lastname: "",
		email: "",
		msg: "",
		agreed: false,
	};

	const extractErrors = ({ inner }) => {
		return inner.reduce((acc, err) => {
			return { ...acc, [err.path]: err.message };
		}, {});
	};

	let frontendURL;
	if (isProduction) {
		frontendURL = "https://frontend.lectonet.de";
	} else {
		frontendURL = "http://localhost:1339";
	}

	let errors = {};
	let foundError = false;
	let formSuccessfullySubmitted = false;

	async function postData(url, data) {
		console.log("stringified", JSON.stringify(data));
		const res = await fetch(url, {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		return res.json();
	}

	const handleSubmit2 = () => {
		console.log(fields);
		const result = regSchema.validate(fields, { abortEarly: false });
		result
			.then((res) => {
				errors = {};
				foundError = false;
				postData(`${frontendURL}/send/contactform`, fields)
					.then((res) => {
						console.log("post req res", res);
						formSuccessfullySubmitted = true;
					})
					.catch((err) => {
						console.log("post failed", err);
					});
			})
			.catch((err) => {
				console.log(frontendURL);
				// console.log(err);
				errors = extractErrors(err);
				foundError = true;
				formSuccessfullySubmitted = false;
			});
	};
</script>

<div class="wrapper-contactform">
	{#if !formSuccessfullySubmitted}
		<form class="email" on:submit|preventDefault>
			<input class="name mt-16" bind:value={fields.firstname} type="text" name="firstname" placeholder="Vorname" />
			{#if errors.firstname}
				<p class="error">{errors.firstname}</p>
			{/if}
			<input class="name mt-16" bind:value={fields.lastname} type="text" name="lastname" placeholder="Name" />
			{#if errors.lastname}
				<p class="error">{errors.lastname}</p>
			{/if}
			<input class="email mt-16" bind:value={fields.email} type="text" name="email" placeholder="E-Mail Adresse" />
			{#if errors.email}
				<p class="error">{errors.email}</p>
			{/if}
			<textarea bind:value={fields.msg} placeholder="Nachricht" />
			{#if errors.msg}
				<p class="error">{errors.msg}</p>
			{/if}
			<div class="email-form-checkboxes" style="cursor: pointer">
				<input class="checkbox" bind:checked={fields.agreed} type="checkbox" style="cursor: pointer" name="checkbox" />
				<label for="checkbox"
					>mit
					<a href="/datenschutz" target="_blank">Datenschutzerklärung</a>
					einverstanden</label
				>
			</div>
			{#if errors.agreed}
				<p style="padding-left: 38px" class="error">{errors.agreed}</p>
			{/if}
			<div class="email-form-button">
				<button on:click|preventDefault={handleSubmit2} class="btn outline">Abschicken</button>
			</div>
		</form>
	{:else}
		<div class="success">
			Vielen Dank! Ihre Kontaktanfrage wurde erfolgreich versendet.<br />
		</div>
	{/if}
</div>

<style>
	.success {
		display: flex;
		margin-top: 20px;
		font-style: bold;
	}

	.wrapper-contactform {
		/* border: 1px solid red; */
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		transition: 0.15s;
		font-family: Montserrat;
		font-style: normal;
	}

	.mt-16 {
		margin-top: 16px;
	}

	.mr-16 {
		margin-right: 16px;
	}

	li {
		list-style: square;
		margin-top: 4px;
	}

	p {
		font-weight: 500;
	}

	p.error {
		/* border: 1px solid red; */
		padding-left: 16px;
		color: red;
	}

	.errors {
		margin-top: 16px;
		padding: 16px 16px;
		border: 3px solid red;
		border-radius: 10px;
		grid-row: 5;
		font-size: 14px;
	}

	form.email {
		display: flex;
		flex-direction: column;
		/* margin: 16px 0; */
		/* column-gap: 20px; */
		/* row-gap: 16px; */
		/* grid-auto-flow: column; */
		/* justify-items: center; */
		/* align-items: center; */
		width: 100%;
		/* border: 1px solid red; */
		/* grid-template-columns: 100%; */
		/* grid-template-rows: auto auto auto auto auto auto; */
		/* border: 1px solid red; */
	}

	input {
		width: 100%;
		padding-left: 15px;
		height: 40px;
		font-size: 16px;
		border: 1px solid #595959;
		box-sizing: border-box;
		border-radius: 24px;
	}

	textarea {
		font-size: 16px;
		margin-top: 16px;
		padding-left: 15px;
		padding-top: 8px;

		border: 1px solid #595959;
		box-sizing: border-box;
		border-radius: 18px;
		width: 100%;
		height: 200px;
		resize: none;
	}

	input.checkbox {
		height: auto;
		width: 32px;
	}

	.email-form-checkboxes {
		/* grid-row: 4; */
		width: 100%;
		padding-left: 10px;
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 16px;
	}

	label {
		width: auto;
	}

	.email-form-address {
		/* grid-row: 3; */
		width: 100%;
		margin-top: 16px;
	}

	.email-form-button {
		grid-row: 6;
		margin-top: 16px;
		padding-left: 10px;
	}

	button {
		text-transform: none;
		border-radius: 10px;
		font-weight: 500;
		font-size: 16px;
		padding: 0 16px;
		background: transparent;
		border: 0;
	}
	.btn {
		display: flex;
	}
	.btn.outline {
		border: 1px solid var(--default-grey);
		background: transparent;
		color: var(--default-grey);
	}

	.btn.outline.back {
		margin-top: 16px;
	}

	.btn.outline:hover {
		background: var(--default-grey);
		color: white;
	}

	.btn.agree {
		padding-top: 12px;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		width: 500px;
	}

	/* ----------- 1280-WIDTH */
	@media only screen and (min-width: 1280px) {
	}

	/* ----------- 960-WIDTH */
	@media (max-width: 1279px) {
	}

	/* ----------- 600-WIDTH */
	@media only screen and (max-width: 959px) {
	}
	/* ----------- 320-WIDTH */
	@media only screen and (max-width: 599px) {
		input,
		textarea,
		.wrapper-contactform,
		.btn {
			font-size: 12px;
		}
	}
</style>

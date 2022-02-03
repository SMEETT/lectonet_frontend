<script>
	import { regSchema } from "./helpers/schema";
	import axios from "axios";

	const fields = {
		firstname: "",
		lastname: "",
		email: "",
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

	const handleSubmit = () => {
		const result = regSchema.validate(fields, { abortEarly: false });
		result
			.then((res) => {
				errors = {};
				foundError = false;
				axios
					.post(
						`${frontendURL}/send/price`,
						{},
						{
							params: {
								firstname: fields.firstname,
								lastname: fields.lastname,
								email: fields.email,
							},
						}
					)
					.then((response) => {
						console.log(response);
					})
					.catch((error) => {
						console.log(error);
					});
				formSuccessfullySubmitted = true;
			})
			.catch((err) => {
				errors = extractErrors(err);
				foundError = true;
				formSuccessfullySubmitted = false;
			});
	};
</script>

<div class="wrapper-contactform">
	<p>Contactform :)</p>
	{#if !formSuccessfullySubmitted}
		<form class="email" on:submit|preventDefault>
			<div class="email-form-desc">Bei Fragen kein Problem:</div>
			<div class="email-form-name">
				<input bind:value={fields.firstname} type="text" name="firstname" class="name" placeholder="Vorname" />
				<input bind:value={fields.lastname} type="text" name="lastname" class="name" placeholder="Name" />
			</div>
			<div class="email-form-address">
				<input bind:value={fields.email} class="email" type="text" name="email" placeholder="E-Mail Adresse" />
			</div>
			<div class="email-form-checkboxes" style="cursor: pointer">
				<input bind:checked={fields.agreed} type="checkbox" class="checkbox" style="cursor: pointer" name="checkbox" />
				<label for="checkbox"
					>Mit
					<a href="/datenschutz">Datenschutzerklärung</a>
					einverstanden</label
				>
			</div>
			{#if foundError}
				<div class="errors">
					Bitte fuellen Sie alle Felder vollstaendig aus.
					{#if errors.firstname}
						<li>{errors.firstname}</li>
					{/if}
					{#if errors.lastname}
						<li>{errors.lastname}</li>
					{/if}
					{#if errors.email}
						<li>{errors.email}</li>
					{/if}
					{#if errors.agreed}
						<li>{errors.agreed}</li>
					{/if}
				</div>
			{/if}
			<div class="email-form-button">
				<button on:click|preventDefault={handleSubmit} class="btn outline">Abschicken</button>
			</div>
		</form>
	{:else}
		<div class="success">
			Vielen Dank! Wir setzen uns mit Ihnen in Verbindung.<br />
		</div>
	{/if}
</div>

<style>
	.wrapper-contactform {
		border: 1px solid red;
	}
	* {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		transition: 0.15s;
		font-family: Montserrat;
		font-style: normal;
	}

	li {
		list-style: square;
		margin-top: 4px;
	}

	.success {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin-top: 32px;
		padding: 0 10px;
	}

	p {
		font-weight: 500;
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
		display: grid;
		/* column-gap: 20px; */
		/* row-gap: 16px; */
		/* grid-auto-flow: column; */
		justify-items: center;
		align-items: center;
		width: 100%;
		/* border: 1px solid red; */
		padding: 0 50px 10px 50px;
		grid-template-columns: 100%;
		grid-template-rows: auto auto auto auto auto auto;
	}

	.email-form-desc {
		margin-top: 16px;
		grid-row: 1;
		text-align: center;
		padding: 0 80px;
	}

	.email-form-name {
		grid-row: 2;
		width: 100%;
		display: flex;
		justify-content: space-between;
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

	input.name {
		width: 49%;
		margin-top: 16px;
	}

	input.checkbox {
		height: auto;
		width: 5%;
	}

	label {
		width: auto;
	}

	.email-form-address {
		grid-row: 3;
		width: 100%;
		margin-top: 16px;
	}

	.email-form-checkboxes {
		grid-row: 4;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin-top: 16px;
	}

	.email-form-button {
		grid-row: 6;
		margin-top: 16px;
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
</style>

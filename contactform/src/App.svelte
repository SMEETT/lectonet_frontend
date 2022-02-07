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
			<svg class="success-checkmark" width="257" height="257" viewBox="0 0 257 257" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M98.331 119.081C95.9144 116.67 92.6369 115.316 89.2193 115.316C85.8018 115.316 82.5242 116.67 80.1077 119.081C77.6911 121.491 76.3335 124.76 76.3335 128.169C76.3335 131.577 77.6911 134.846 80.1077 137.257L118.608 175.657C119.807 176.843 121.229 177.782 122.793 178.419C124.356 179.056 126.03 179.378 127.719 179.369C129.476 179.313 131.203 178.898 132.792 178.15C134.382 177.401 135.8 176.335 136.959 175.017L226.793 72.6168C228.867 70.0481 229.867 66.7801 229.585 63.494C229.302 60.2079 227.759 57.1573 225.276 54.9785C222.794 52.7996 219.564 51.6606 216.26 51.7989C212.956 51.9372 209.833 53.3421 207.543 55.7208L127.719 147.881L98.331 119.081Z"
					fill="var(--default-grey)"
				/>
				<path
					d="M243.221 115.369C239.817 115.369 236.553 116.718 234.146 119.118C231.74 121.518 230.388 124.774 230.388 128.169C230.388 155.327 219.571 181.373 200.317 200.577C181.063 219.78 154.95 230.569 127.721 230.569C107.445 230.56 87.6265 224.563 70.7635 213.334C53.9005 202.106 40.7484 186.149 32.9657 167.475C25.1831 148.801 23.1183 128.247 27.0317 108.404C30.9452 88.5618 40.6616 70.3192 54.9559 55.9769C64.4616 46.3691 75.7931 38.7487 88.2874 33.5618C100.782 28.3748 114.188 25.7256 127.721 25.7689C135.927 25.8202 144.103 26.7644 152.104 28.5849C153.779 29.1015 155.541 29.2705 157.284 29.0816C159.026 28.8926 160.711 28.3498 162.235 27.4864C163.759 26.6231 165.089 25.4576 166.144 24.0617C167.199 22.6659 167.956 21.0693 168.369 19.3704C168.782 17.6715 168.841 15.9063 168.544 14.1837C168.246 12.461 167.598 10.8174 166.639 9.35412C165.68 7.89086 164.431 6.63897 162.969 5.67565C161.506 4.71233 159.862 4.05798 158.136 3.75294C148.166 1.41365 137.963 0.21128 127.721 0.168945C102.367 0.300319 77.6194 7.91961 56.6024 22.0653C35.5853 36.211 19.2404 56.2491 9.6301 79.6509C0.0198383 103.053 -2.42502 128.77 2.60405 153.556C7.63313 178.342 19.9108 201.087 37.8876 218.921C61.7151 242.697 94.0161 256.091 127.721 256.169C161.757 256.169 194.399 242.683 218.466 218.679C242.533 194.674 256.054 162.117 256.054 128.169C256.054 124.774 254.702 121.518 252.295 119.118C249.889 116.718 246.624 115.369 243.221 115.369Z"
					fill="var(--default-grey)"
				/>
			</svg>
			<p class="success-message">Vielen Dank! Ihre Kontaktanfrage wurde erfolgreich versendet.</p>
		</div>
	{/if}
</div>

<style>
	.success {
		display: flex;
		padding: 16px 0;
		width: 320px;
		/* margin-top: 20px; */
		font-style: bold;
		justify-content: center;
		width: 50%;
		align-items: center;
		/* border: 1px solid red; */
	}

	.success-checkmark {
		width: 40px;
		height: 40px;
		/* border: 1px solid red; */
	}

	.success-message {
		/* margin-top: 16px; */
		margin-left: 16px;
		line-height: 1.3;
		width: 100%;
		/* text-align: center; */
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

		.success {
			margin-top: 10px;
			width: 220px;
		}
		/* .success-checkmark {
			width: 200px;
		} */
	}
</style>

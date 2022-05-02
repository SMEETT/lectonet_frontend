<script>
	import { regSchema } from "./helpers/schema";
	const fields = {
		firstname: "",
		lastname: "",
		street: "",
		housenumber: "",
		zip: "",
		city: "",
		telephone: "",
		email: "",
		messages: {
			1: "",
			2: "",
			3: "",
			4: "",
			5: "",
			6: "",
			7: "",
			8: "",
		},
		agreed: false,
	};

	// const fields = {
	// 	firstname: "Bob",
	// 	lastname: "Testing",
	// 	street: "Teststrasse",
	// 	housenumber: "1337",
	// 	zip: "20044",
	// 	city: "Testhausen",
	// 	telephone: "1197 38919441",
	// 	email: "tbr@tutamail.com",
	// 	messages: {
	// 		1: "text 1",
	// 		2: "text 2",
	// 		3: "text 3",
	// 		4: "text 4",
	// 		5: "text 5",
	// 		6: "text 6",
	// 		7: "text 7",
	// 		8: "text 8",
	// 	},
	// 	agreed: true,
	// };

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

	const handleSubmit = () => {
		console.log(fields);
		console.log(frontendURL);
		const result = regSchema.validate(fields, { abortEarly: false });
		result
			.then((res) => {
				errors = {};
				foundError = false;
				postData(`${frontendURL}/send/bewerbungsformular_2`, fields)
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
				console.log(errors);
			});
	};

	const handleClose = () => {
		formSuccessfullySubmitted = false;
		const hook = document.getElementById("bewerbungsformular-hook-2");
		hook.style.display = "none";
	};

	const makeSureIsNumber = (value, caller) => {
		if (isNaN(value) || value.length > 5) {
			fields[caller] = value.slice(0, -1);
			// node.value = newValue;
		}
	};

	const regExTelephoneNr = (number) => {
		const pattern = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
		if (!pattern.test(number)) {
			fields.telephone = number.slice(0, -1);
		}
	};
</script>

<div class="wrapper">
	<div class="wrapper-header">
		<div class="wrapper-header-title">Bewerbungsformular 2</div>
		<div class="wrapper-header-x">
			<div class="icon-close" id="close-bewerbungsformular-2" />
		</div>
	</div>
	{#if !formSuccessfullySubmitted}
		<div class="wrapper-personal-info">
			<div>
				<input bind:value={fields.lastname} placeholder="Name" type="text" />
				{#if errors.lastname}
					<p class="error">{errors.lastname}</p>
				{/if}
			</div>
			<div>
				<input bind:value={fields.firstname} placeholder="Vorname" type="text" />
				{#if errors.firstname}
					<p class="error">{errors.firstname}</p>
				{/if}
			</div>
			<div>
				<input bind:value={fields.street} placeholder="Straße" type="text" />
				{#if errors.street}
					<p class="error">{errors.street}</p>
				{/if}
			</div>
			<div>
				<input bind:value={fields.housenumber} placeholder="Hausnummer" type="text" />
				{#if errors.housenumber}
					<p class="error">{errors.housenumber}</p>
				{/if}
			</div>
			<div>
				<input bind:value={fields.zip} on:input={makeSureIsNumber(fields.zip, "zip")} placeholder="PLZ" type="text" min="1" />
				{#if errors.zip}
					<p class="error">{errors.zip}</p>
				{/if}
			</div>
			<div>
				<input bind:value={fields.city} placeholder="Ort" type="text" />
				{#if errors.city}
					<p class="error">{errors.city}</p>
				{/if}
			</div>
			<div>
				<input bind:value={fields.email} placeholder="E-Mail-Adresse" type="text" />
				{#if errors.email}
					<p class="error">{errors.email}</p>
				{/if}
			</div>
			<div>
				<input bind:value={fields.telephone} on:input={regExTelephoneNr(fields.telephone)} placeholder="Telefonnummer" type="text" />
				{#if errors.telephone}
					<p class="error">{errors.telephone}</p>
				{/if}
			</div>
		</div>
		<div class="wrapper-textareas">
			<div class="wrapper-textarea">
				<span class="label">Derzeitige berufliche Tätigkeit:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[1]} />
				</div>
				{#if errors["messages.1"]}
					<p class="error">{errors["messages.1"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[1].length > 500}>{fields.messages[1].length}/500 Zeichen</div>
				<!-- <div class="error">{errors.messages[1]}</div> -->
			</div>
			<div class="wrapper-textarea">
				<span class="label">Meine Erfahrungen im Bereich Textbearbeitung:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[2]} />
				</div>
				{#if errors["messages.2"]}
					<p class="error">{errors["messages.2"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[2].length > 500}>{fields.messages[2].length}/500 Zeichen</div>
			</div>
			<div class="wrapper-textarea">
				<span class="label">Das zeichnet mich als Quereinsteiger aus:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[3]} />
				</div>
				{#if errors["messages.3"]}
					<p class="error">{errors["messages.3"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[3].length > 500}>{fields.messages[3].length}/500 Zeichen</div>
			</div>
			<div class="wrapper-textarea">
				<span class="label">Darum will ich lectonet-Partner werden:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[4]} />
				</div>
				{#if errors["messages.4"]}
					<p class="error">{errors["messages.4"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[4].length > 500}>{fields.messages[4].length}/500 Zeichen</div>
			</div>
			<div class="wrapper-textarea">
				<span class="label">Diese Art von Aufträgen entspricht absolut meinem Stärken-und-Vorlieben-Profil:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[5]} />
				</div>
				{#if errors["messages.5"]}
					<p class="error">{errors["messages.5"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[5].length > 500}>{fields.messages[5].length}/500 Zeichen</div>
			</div>
			<div class="wrapper-textarea">
				<span class="label">Diese Art von Aufträgen kann ich übernehmen, aber nicht bevorzugt:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[6]} />
				</div>
				{#if errors["messages.6"]}
					<p class="error">{errors["messages.6"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[6].length > 500}>{fields.messages[6].length}/500 Zeichen</div>
			</div>
			<div class="wrapper-textarea">
				<span class="label">Diese Art von Aufträgen kann ich nicht annehmen:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[7]} />
				</div>
				{#if errors["messages.7"]}
					<p class="error">{errors["messages.7"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[7].length > 500}>{fields.messages[7].length}/500 Zeichen</div>
			</div>
			<div class="wrapper-textarea">
				<span class="label">Sonstiges:</span>
				<div class="textarea">
					<textarea bind:value={fields.messages[8]} />
				</div>
				{#if errors["messages.8"]}
					<p class="error">{errors["messages.8"]}</p>
				{/if}
				<div class="wrapper-char-limit" class:highlight-error={fields.messages[8].length > 500}>{fields.messages[8].length}/500 Zeichen</div>
			</div>
		</div>
		<div class="wrapper-submit">
			<div class="wrapper-checkbox">
				<input bind:checked={fields.agreed} type="checkbox" class="checkbox" style="cursor: pointer" name="checkbox" />
				<span
					>mit
					<a href="/datenschutz" target="_blank">Datenschutzerklärung</a>
					einverstanden</span
				>
			</div>
			{#if errors.agreed}
				<p class="error" style="margin-top: -1rem; margin-bottom: 0.5rem">{errors.agreed}</p>
			{/if}
			<button on:click={handleSubmit} class="btn outline">Absenden</button>
		</div>
		<div class="wrapper-disclaimer`">
			<p class="disclaimer-text">
				* Ihre gesamten Angaben werden absolut vertraulich behandelt und ausschließlich für die möglichst effiziente Weitergabe und Erfüllung von
				Kundenaufträgen sowie für Abrechnungen verwendet. Eine Verwendung außerhalb dieser Zwecke ist ausgeschlossen, wenn der Netzwerkpartner dieser
				nicht zuvor schriftlich (Email) zugestimmt hat. Der Austausch von Daten innerhalb des Netzwerkes – etwa von einem Netzwerkpartner zum anderen –
				ist ohne schriftliche Zustimmung ebenfalls ausgeschlossen. Eine Weitergabe von Daten der Netzwerkpartner an externe Dritte (z.B. Kunden) ist
				auch mit Zustimmung des Partners ausgeschlossen. Ausgenommen hiervon sind berechtigte bzw. berechtigt erscheinende behördliche Ersuchen. Aus der
				Bewerbung für die freibe Mitarbeit bei lectonet entstehen für keine Seite rechtliche Ansprüche. Weder ist lectonet zur Auftragsweitergabe
				verpflichtet noch besteht für einen Netzwerkpartner die Pflicht zur Auftragsannahme. Das Ausscheiden eines Partners aus dem lectonet-Netzwerk
				bedeutet die Löschung der Daten nach sechs Monaten. Dieses Ausscheiden bedarf der Schriftform einer Seite.
			</p>
		</div>
	{:else}
		<div class="success">
			<p>Gut, dass Sie uns vertrauen – vielen Dank!</p>
			<p>Wir setzen uns mit Ihnen in Verbindung.</p>
			<button id="btnCloseAfterSubmit-2" class="btn outline" style="margin-top: 16px" on:click={handleClose}>OK</button>
		</div>
	{/if}
</div>

<style>
	:root {
		--font-size: 12px;
	}

	.wrapper {
		width: 90%;
		/* height: 2800px; */
		display: flex;
		flex-direction: column;
		align-items: center;
		position: static;
		margin: auto;
		margin-top: 10px;
		margin-bottom: 60px;
		z-index: 30;
		box-shadow: 10px 10px 40px rgba(0, 0, 0, 0.25);
		border-radius: 25px;
		overflow: hidden;
		background: transparent;
	}

	.wrapper-header {
		width: 100%;
		display: flex;
		height: 60px;
		/* border: 1px solid red; */
		border-top-left-radius: 25px;
		border-top-right-radius: 25px;
		background-color: #555;
		color: white;
	}

	.wrapper-header-title {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80%;
		padding-left: 20%;
		text-transform: uppercase;
		font-size: 16px;
		font-weight: 600;

		/* border: 1px solid green; */
	}

	.wrapper-header-x {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20%;
		/* border: 1px solid blue; */
	}

	.icon-close {
		background: url("../../static/images/icon_calculator_close.svg") no-repeat;
		background-size: contain;
		width: 20px;
		height: 20px;
	}

	.icon-close:hover {
		cursor: pointer;
		background: url("../../static/images/icon_calculator_close_hover.svg") no-repeat;
		background-size: contain;
	}

	.wrapper-personal-info {
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr;
		column-gap: 1rem;
		row-gap: 1rem;
		width: 100%;
		background-color: white;
		/* border: 3px solid red; */
	}

	input {
		width: 100%;
		padding-left: 15px;
		height: 40px;
		font-size: var(--font-size);
		border: 1px solid #595959;
		box-sizing: border-box;
		border-radius: 24px;
	}

	input.checkbox {
		height: auto;
		width: 32px;
	}

	.error {
		/* border: 1px solid red; */
		color: red;
		margin-top: 0.5rem;
		/* margin-bottom: -0.5rem; */
		padding-left: 15px;
		line-height: 1;
	}

	.wrapper-textareas {
		padding: 1rem;
		display: grid;
		grid-template-columns: 1fr;
		column-gap: 1rem;
		row-gap: 1rem;
		width: 100%;
		border-top: 1px solid rgb(202, 202, 202);
		background-color: white;
		/* border: 3px solid blue; */
	}

	.wrapper-textarea {
		/* border: 3px dotted blue; */
	}

	.label {
		padding-left: 12px;
		display: block;
		font-size: var(--font-size);
		font-weight: 500;
		margin-bottom: 8px;
		color: #787878;
		/* border: 2px dotted royalblue; */
		/* min-height: 3rem; */
	}

	.textarea {
		border-radius: 18px;
		border: 1px solid #595959;
		overflow: hidden;
	}

	textarea {
		font-size: var(--font-size);
		padding-left: 15px;
		padding-top: 8px;
		box-sizing: border-box;
		width: 100%;
		height: 120px;
		resize: none;
		border: 0;
		outline: none;
	}

	.wrapper-char-limit {
		padding-left: 15px;
		font-size: 12px;
		margin-top: 4px;
		color: #787878;
		/* border: 2px dotted gray; */
	}

	.highlight-error {
		color: red;
	}

	.wrapper-submit {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding-bottom: 16px;
		background-color: white;
	}

	.wrapper-checkbox {
		font-size: var(--font-size);
		margin: 16px 0;
		display: flex;
		justify-content: center;
		width: 100%;
		align-items: center;
	}

	.disclaimer-text {
		white-space: normal;
		margin: 0;
		padding: 24px;
		font-size: 12px;
		border-top: 1px solid rgb(202, 202, 202);
		background-color: white;
	}

	button {
		text-transform: none;
		border-radius: 10px;
		font-weight: 500;
		font-size: var(--font-size);
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

	.btn.outline:hover {
		background: var(--default-grey);
		color: white;
	}

	.success {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		width: 100%;
		padding: 16px;
		background-color: white;
	}

	.success > p {
		margin: 0;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type="number"] {
		-moz-appearance: textfield;
	}

	@media (min-width: 600px) {
		:root {
			--font-size: 15px;
		}
		.wrapper {
			width: 580px;
			margin-top: 30px;
			/* height: 2800px; */
		}
	}
	@media (min-width: 960px) {
		.wrapper {
			width: 940px;
			/* height: 2800px; */
		}
		.wrapper-personal-info {
			grid-template-columns: 1fr 1fr;
		}
		.wrapper-textareas {
			grid-template-columns: 1fr 1fr;
			padding-top: 0;
		}
		.label {
			display: flex;
			align-items: flex-end;
			/* border: 2px dotted royalblue; */
			min-height: 40px;
		}
	}
</style>

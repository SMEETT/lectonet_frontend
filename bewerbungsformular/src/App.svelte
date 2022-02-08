<script>
</script>

<div class="wrapper">
	<div class="wrapper-header">
		<div class="wrapper-header-title">Bewerbungsformular</div>
		<div class="wrapper-header-x">
			<div class="icon-close" id="close-bewerbungsformular" />
		</div>
	</div>
	<div class="wrapper-personal-info">
		<input placeholder="Name" type="text" />
		<input placeholder="Vorname" type="text" />
		<input placeholder="Staße" type="text" />
		<input placeholder="Hausnummer" type="text" />
		<input placeholder="PLZ" type="text" />
		<input placeholder="Ort" type="text" />
		<input placeholder="E-Mail Adresse" type="text" />
		<input placeholder="Telfonnummer" type="text" />
	</div>
	<div class="wrapper-textareas">
		<div class="wrapper-textarea">
			<span class="label">Ich bin tätig im/in Korrektorat/Lektorat/Redaktion seit:</span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
		<div class="wrapper-textarea">
			<span class="label">Meine relevanten Qualifikationen:</span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
		<div class="wrapper-textarea">
			<span class="label">Meine relevanten beruflichen Erfahrungen (bitte mit Dauer und Arbeit-/Auftraggeber): </span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
		<div class="wrapper-textarea">
			<span class="label">Mein wissenschaftliches Fachgebiet (gerne auch mehrere):</span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
		<div class="wrapper-textarea">
			<span class="label">Diese Art von Aufträgen entsprechen absolut meinem Stärken-und-Vorlieben-Profil:</span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
		<div class="wrapper-textarea">
			<span class="label">Diese Art von Aufträgen kann ich übernehmen, aber nicht bevorzugt:</span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
		<div class="wrapper-textarea">
			<span class="label">Diese Art von Aufträgen lehne ich strikt ab:</span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
		<div class="wrapper-textarea">
			<span class="label">Sonstiges:</span>
			<div class="textarea">
				<textarea />
			</div>
			<div class="wrapper-char-limit">0/500 Zeichen</div>
		</div>
	</div>
	<div class="wrapper-submit">
		<div class="wrapper-checkbox">
			<input type="checkbox" class="checkbox" style="cursor: pointer" name="checkbox" />
			<span
				>mit
				<a href="/datenschutz" target="_blank">Datenschutzerklärung</a>
				einverstanden</span
			>
		</div>
		<button class="btn outline">Absenden</button>
	</div>
	<div class="wrapper-disclaimer`">
		<p class="disclaimer-text">
			* Ihre gesamten Angaben werden absolut vertraulich behandelt und ausschließlich für die möglichst effiziente Weitergabe und Erfüllung von
			Kundenaufträgen sowie für Abrechnungen verwendet. Eine Verwendung außerhalb dieser Zwecke ist ausgeschlossen, wenn der Netzwerkpartner dieser nicht
			zuvor schriftlich (Email) zugestimmt hat. Der Austausch von Daten innerhalb des Netzwerkes – etwa von einem Netzwerkpartner zum anderen – ist ohne
			schriftliche Zustimmung ebenfalls ausgeschlossen. Eine Weitergabe von Daten der Netzwerkpartner an externe Dritte (z.B. Kunden) ist auch mit
			Zustimmung des Partners ausgeschlossen. Ausgenommen hiervon sind berechtigte bzw. berechtigt erscheinende behördliche Ersuchen. Aus der Bewerbung
			für die freibe Mitarbeit bei lectonet entstehen für keine Seite rechtliche Ansprüche. Weder ist lectonet zur Auftragsweitergabe verpflichtet noch
			besteht für einen Netzwerkpartner die Pflicht zur Auftragsannahme. Das Ausscheiden eines Partners aus dem lectonet-Netzwerk bedeutet die Löschung
			der Daten nach sechs Monaten. Dieses Ausscheiden bedarf der Schriftform einer Seite.
		</p>
	</div>
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
		padding-left: 12px;
		font-size: 12px;
		margin-top: 4px;
		color: #787878;
		/* border: 2px dotted gray; */
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

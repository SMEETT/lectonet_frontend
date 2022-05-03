<script>
    import { regSchema } from "../helpers/schema.js";
    import axios from "axios";

    import {
        priceDisableStatus,
        selectedCategories,
        calculatedPrice,
        quantity,
        bewerbungenSelectedTypes,
        priceUpperBound,
        formSuccessfullySubmitted,
    } from "../stores/stores.js";

    const fields = {
        firstname: "",
        lastname: "",
        email: "",
        agreed: false,
        priceCalculated: "",
    };
    let errors = {};
    let foundError = false;

    const extractErrors = ({ inner }) => {
        return inner.reduce((acc, err) => {
            return { ...acc, [err.path]: err.message };
        }, {});
    };

    priceDisableStatus.subscribe((status) => {
        fields.priceCalculated = !status;
    });

    let typeOrTypes;

    bewerbungenSelectedTypes.subscribe((obj) => {
        if ($selectedCategories.service === "Bewerbung") {
            typeOrTypes = obj;
            try {
                typeOrTypes = typeOrTypes.join(", ");
            } catch {}
        } else {
            typeOrTypes = $selectedCategories.type;
        }
    });

    selectedCategories.subscribe((obj) => {
        if ($selectedCategories.service !== "Bewerbung") {
            typeOrTypes = obj.type;
        }
    });

    let frontendURL;
    if (isProduction) {
        frontendURL = "https://www.lectonet.de";
    } else {
        frontendURL = "http://localhost:1339";
    }

    const handleSubmit = () => {
        const result = regSchema.validate(fields, { abortEarly: false });
        result
            .then((res) => {
                errors = {};
                foundError = false;
                const price = `* ${$calculatedPrice} € - ${(
                    $calculatedPrice * $priceUpperBound
                ).toFixed(2)} €`;
                axios
                    .post(
                        `${frontendURL}/send/price`,
                        {},
                        {
                            params: {
                                firstname: fields.firstname,
                                lastname: fields.lastname,
                                email: fields.email,
                                service: $selectedCategories.service,
                                group: $selectedCategories.group,
                                type: typeOrTypes,
                                price: price,
                                quantity: $quantity,
                            },
                        }
                    )
                    .then((response) => {
                        // console.log(response);
                        console.log("OK");
                    })
                    .catch((error) => {
                        // console.log(error);
                        console.log("ERROR");
                    });
                $formSuccessfullySubmitted = true;
            })
            .catch((err) => {
                errors = extractErrors(err);
                foundError = true;
                $formSuccessfullySubmitted = false;
            });
    };

    const handleClose = () => {
        $formSuccessfullySubmitted = false;
        const calculatorHook = document.getElementById("preisrechner-hook");
        calculatorHook.style.display = "none";
    };

    const toggleOverlayCalculator = (e) => {};
</script>

{#if !$formSuccessfullySubmitted}
    <form class="email" on:submit|preventDefault>
        <div class="email-form-desc">
            Unschlüssig? Dann fordern Sie hier ein unverbindliches,
            detailliertes Angebot an:
        </div>
        <div class="email-form-name">
            <input
                bind:value={fields.firstname}
                type="text"
                name="firstname"
                class="name"
                placeholder="Vorname"
            />
            <input
                bind:value={fields.lastname}
                type="text"
                name="lastname"
                class="name"
                placeholder="Name"
            />
        </div>
        <div class="email-form-address">
            <input
                bind:value={fields.email}
                class="email"
                type="text"
                name="email"
                placeholder="E-Mail Adresse"
            />
        </div>
        <div class="email-form-checkboxes" style="cursor: pointer">
            <input
                bind:checked={fields.agreed}
                type="checkbox"
                class="checkbox"
                style="cursor: pointer"
                name="checkbox"
            />
            <label for="checkbox"
                >mit
                <a href="/datenschutz" target="_blank">Datenschutzerklärung</a>
                einverstanden</label
            >
        </div>
        {#if foundError}
            <div class="errors">
                Bitte fuellen Sie alle Felder vollstaendig aus.
                {#if errors.priceCalculated}
                    <li>{errors.priceCalculated}</li>
                {/if}
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
            <button on:click|preventDefault={handleSubmit} class="btn outline"
                >Abschicken</button
            >
        </div>
    </form>
{:else}
    <div class="success">
        Gut, dass Sie uns vertrauen – vielen Dank!<br />
        Wir setzen uns mit Ihnen in Verbindung.
        <button
            id="btnCloseAfterSubmit"
            class="btn outline back"
            on:click={handleClose}>OK</button
        >
    </div>
{/if}

<style>
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        transition: 0.15s;
        font-family: Montserrat;
        font-style: normal;
    }

    .hide {
        display: none;
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

    /* .btn.inactive {
        border: 1px solid lightgray;
        color: lightgray;
        cursor: default;
    }
    .btn.inactive:hover {
        color: lightgray;
        background: transparent;
    } */

    /* ----------- 1280-WIDTH */
    @media (min-width: 1280px) {
    }
    /* ----------- 960-WIDTH */
    @media (max-width: 1279px) {
    }
    /* ----------- 600-WIDTH */
    @media (max-width: 959px) {
        form.email {
            padding: 0 20px 10px 20px;
        }
    }
    /* ----------- 320-WIDTH */
    @media (max-width: 599px) {
        .email-form-desc {
            padding: 0;
        }
        form.email {
            padding: 0 10px 10px 10px;
        }

        .success {
            text-align: center;
            font-size: 12px;
        }

        .errors {
            text-align: center;
        }
        .email-form-name {
            grid-row: 2;
            width: 100%;
            display: flex;
            flex-direction: column;
        }
        input.name {
            width: 100%;
        }
        input.checkbox {
            width: 10%;
        }
        label {
            margin-left: 8px;
        }
    }
</style>

<script>
    import Dropdown from "../src/components/Dropdown.svelte";
    import TextfieldQuantity from "../src/components/TextfieldQuantity.svelte";
    import PriceDisplay from "./components/PriceDisplay.svelte";
    import BewerbungenCheckboxes from "../src/components/BewerbungCheckboxes.svelte";
    import MailForm from "../src/components/MailForm.svelte";

    // instance used to invoke 'resetMe' in componenent 'BewerbungenCheckboxes'
    let BewerbungenCheckboxesInstance;

    import {
        services,
        groups,
        types,
        selectedCategories,
        formSuccessfullySubmitted,
    } from "./stores/stores.js";

    let selectedCategoriesTEMP;
    selectedCategories.subscribe((data) => {
        selectedCategoriesTEMP = data;
    });

    let dropdownDataGroups;
    groups.subscribe((data) => {
        dropdownDataGroups = data;
    });

    let dropdownDataServices;
    services.subscribe((data) => {
        dropdownDataServices = data;
    });

    let dropdownDataTypes;
    types.subscribe((data) => {
        dropdownDataTypes = data;
    });

    const bewerbungenReset = () => {
        BewerbungenCheckboxesInstance.resetMe();
    };

    function handleDropdownChange(event) {
        const calculatorMidRegular = document.getElementById(
            "calculator-mid-regular"
        );
        const calculatorMidBewerbung = document.getElementById(
            "calculator-mid-bewerbung"
        );
        if (selectedCategoriesTEMP.service === "Bewerbung") {
            calculatorMidRegular.style.display = "none";
            calculatorMidBewerbung.style.display = "flex";
        } else {
            BewerbungenCheckboxesInstance.resetMe();
            calculatorMidRegular.style.display = "flex";
            calculatorMidBewerbung.style.display = "none";
        }
    }
</script>

<!-- MARKUP /////////////////////////////////////////////////////////////////////////////////////// -->
<div class="preisrechner-wrapper">
    <div class="preisrechner-title-wrapper">
        <span class="preisrechner-title">Preisrechner</span>
        <div class="icon-close-calculator" id="icon-close-calculator" />
    </div>
    {#if !$formSuccessfullySubmitted}
        <form
            style="border-bottom: 1px solid rgb(221, 221, 221)"
            on:submit|preventDefault
            on:change|preventDefault={handleDropdownChange}>
            <div class="calculator-top">
                <Dropdown
                    label={'Sie sind'}
                    options={dropdownDataGroups}
                    category={'group'}
                    id={'dropdown-group'}
                    initialDisableStatus="false" />

                <Dropdown
                    label={'Sie benötigen'}
                    options={dropdownDataServices}
                    category={'service'}
                    id={'dropdown-service'}
                    initialDisableStatus="true" />
            </div>
            <!-- div rendered when anything but "Bewerbung" was selected -->
            <div class="calculator-mid-regular" id="calculator-mid-regular">
                <Dropdown
                    label={'Art der Arbeit'}
                    options={dropdownDataTypes}
                    category={'type'}
                    id={'dropdown-type'}
                    initialDisableStatus="true" />
                <TextfieldQuantity />
            </div>
            <!-- div rendered when "Bewerbung" was selected -->
            <div class="calculator-mid-bewerbung" id="calculator-mid-bewerbung">
                <BewerbungenCheckboxes
                    bind:this={BewerbungenCheckboxesInstance}
                    dropdownDataTypes={dropdownDataTypes} />
            </div>
            <div class="wrapper-price-display">
                <PriceDisplay />
            </div>
        </form>
    {/if}
    <div class="calculator-bottom">
        <MailForm />
        {#if !$formSuccessfullySubmitted}
            <div class="price-disclaimer">
                <p>* unverbindliche Preisauskunft</p>
            </div>
        {/if}
    </div>
</div>

<!-- STYLES /////////////////////////////////////////////////////////////////////////////////////// -->
<style>
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        transition: 0.15s;
        font-family: Montserrat;
        font-style: normal;
        list-style: none;
    }

    .calculator-bottom {
        height: 100%;
        width: 100%;
        border-bottom-left-radius: 25px;
        border-bottom-right-radius: 25px;
        background-color: white;
        padding-bottom: 16px;
    }

    .price-disclaimer {
        /* border: 1px solid red; */
        display: flex;
        /* justify-content: center; */
        padding-left: 50px;
    }

    .calculator-top {
        grid-column: 1 / 3;
        grid-row: 1;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .calculator-mid-regular {
        grid-column: 1 / 3;
        grid-row: 2;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .calculator-mid-bewerbung {
        margin-top: 16px;
        padding-left: 34px;
        grid-column: 2 / 3;
        grid-row: 2;
        width: 100%;
        display: none;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .wrapper-price-display {
        grid-column: 1 / 3;
        grid-row: 3;
        margin-top: 16px;
    }

    form {
        display: grid;
        justify-items: center;
        align-items: center;
        background-color: white;
        width: 100%;
        height: auto;
        padding: 0 50px 10px 50px;
        grid-template-columns: 50% 50%;
        grid-template-rows: auto auto auto auto;
    }

    .preisrechner-title-wrapper {
        text-transform: uppercase;
        width: 100%;
        height: 60px;
        display: grid;
        grid-template-columns: 1fr repeat(8, 1fr) 1fr;
        justify-items: center;
        align-items: center;
        background-color: #555;
        color: white;
    }

    .preisrechner-title {
        grid-column: 3 / 9;
        font-weight: 600;
        /* color: white; */
        font-size: 16px;
        display: inline;
    }

    .icon-close-calculator {
        background: url("../../../static/images/icon_calculator_close.svg")
            no-repeat;
        background-size: contain;
        margin-left: 70px;
        width: 20px;
        height: 20px;
        grid-column: 9 / 11;
    }

    .icon-close-calculator:hover {
        cursor: pointer;
        background: url("../../../static/images/icon_calculator_close_hover.svg")
            no-repeat;
        background-size: contain;
    }

    /* .preisrechner-wrapper {
        width: 700px;
        height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        z-index: 30;
        box-shadow: 10px 10px 40px rgba(0, 0, 0, 0.25);
        border-radius: 25px;
        overflow: hidden;
    } */

    .preisrechner-wrapper {
        width: 700px;
        height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: static;
        margin: auto;
        margin-top: 60px;
        z-index: 30;
        box-shadow: 10px 10px 40px rgba(0, 0, 0, 0.25);
        border-radius: 25px;
        overflow: hidden;
    }

    /* ----------- 1280-WIDTH */
    @media (min-width: 1280px) {
    }
    /* ----------- 960-WIDTH */
    @media (max-width: 1279px) {
    }
    /* ----------- 600-WIDTH */
    @media (max-width: 959px) {
        .icon-close-calculator {
            margin-left: 30px;
        }

        .preisrechner-wrapper {
            width: 512px;
            height: auto;
        }

        .price-disclaimer {
            padding-left: 20px;
        }

        .calculator-top {
            flex-direction: column;
        }
        .calculator-mid-bewerbung {
            padding: 0;
            padding-left: 80px;
            grid-column: 1 / 3;
            display: none;
            flex-direction: row;
            justify-content: start;
            align-items: center;
        }
        .calculator-mid-regular {
            flex-direction: column;
        }
    }
    /* ----------- 320-WIDTH */
    @media (max-width: 599px) {
        .icon-close-calculator {
            margin-left: 0;
        }
        form {
            padding: 0 10px 0px 10px;
        }

        .price-disclaimer {
            padding: 0;
            justify-content: center;
        }

        .calculator-mid-bewerbung {
            padding-left: 16px;
        }

        .preisrechner-wrapper {
            width: 300px;
            height: auto;
        }

        .preisrechner-title-wrapper {
            height: 50px;
        }

        .preisrechner-title {
            grid-column-start: 3;
            grid-column-end: 9;
            font-weight: 500;
            font-size: 16px;
            display: inline;
        }
        .icon-close-calculator {
            display: flex;
            justify-content: center;
            grid-column-start: 9;
            grid-column-end: 11;
            margin-left: 0px;
            grid-row: 1;
        }
    }
</style>

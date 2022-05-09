<script>
    import {
        selectedCategories,
        priceDisableStatus,
        price,
        appliedReduction,
        quantity,
        calculatedPrice,
    } from "../stores/stores";

    import { get } from "svelte/store";

    export let options;
    export let category;
    export let id;
    export let label;

    // set in App.svelte when creating the component
    export let initialDisableStatus;
    // cast incoming string to boolean
    let disableDropdown = initialDisableStatus == "true";
    // resetId is used to address the default 'Bitte auswahlen' option
    let resetId = `reset-${category}`;
    let labelIdentifier = `label-${category}`;
    let selectWrapperId = `wrapper-${category}`;
    let currentSelection;

    const handleChange = () => {
        console.log("handleChange");
        appliedReduction.set(0);
        const defaultOptionService = document.getElementById("reset-service");
        const dropdownService = document.getElementById("dropdown-service");
        const selectWrapperService = document.getElementById("wrapper-service");

        const defaultOptionType = document.getElementById("reset-type");
        const dropdownType = document.getElementById("dropdown-type");
        const selectWrapperType = document.getElementById("wrapper-type");

        // when a 'group' was selected reset selections for 'service' and 'type';
        // enable 'dropdownService' (it's disabled before a 'group' was selected)
        // disable 'dropdownType' (since all was reset and therefor no 'service' is selected anymore (or yet))
        if (currentSelection.category === "group") {
            // reset the 'service' and 'type' selection
            selectedCategories.update((obj) => {
                obj["service"] = null;
                obj["type"] = null;
                return obj;
            });
            // change the dropdown's values back to default "Bitte auswaehlen";
            // enable the service dropdown
            dropdownService.disabled = false;
            dropdownService.classList.remove("inactive");
            selectWrapperService.classList.remove("inactive");
            defaultOptionService.selected = "true";

            // disable the type dropdown
            dropdownType.disabled = true;
            dropdownType.classList.add("inactive");
            selectWrapperType.classList.add("inactive");
            defaultOptionType.selected = "true";
        }

        // when a 'service' was selected, reset the selected 'type' and
        // enable 'dropdown-type' (it's disabled before a 'service' was picked)
        if (
            currentSelection.category === "service" &&
            currentSelection.category !== "Bewerbung"
        ) {
            // reset 'type' selection
            selectedCategories.update((obj) => {
                obj["type"] = null;
                return obj;
            });
            // enable dropdown for 'type'`s;
            // remove all visual 'inactive' classes;
            // reset back to default option ('Bitte auswaehlen');
            dropdownType.disabled = false;
            dropdownType.classList.remove("inactive");
            selectWrapperType.classList.remove("inactive");
            defaultOptionType.selected = "true";
        }
        // when a 'type' is selected, remove the disabled status from 'priceDisplay'
        if (currentSelection.category === "type") {
            // update current calculated price
            let priceTEMP;
            price.subscribe((p) => {
                priceTEMP = p;
                const quantityTEMP = parseFloat(get(quantity));
                let finalPrice = (quantityTEMP * priceTEMP).toFixed(2);
                if (finalPrice == "NaN") {
                    finalPrice = "0.00";
                }
                quantity.set(quantityTEMP);
                calculatedPrice.set(finalPrice);
            });
            priceDisableStatus.set(false);
        } else {
            priceDisableStatus.set(true);
        }
        // update the global 'selectedCategories' object
        selectedCategories.update((obj) => {
            obj[currentSelection.category] = currentSelection.opt;
            return obj;
        });
    };
</script>

<!-- MARKUP ------------------------------ -->

<div
    id={selectWrapperId}
    class="select-wrapper"
    class:inactive={disableDropdown}>
    <label for={labelIdentifier}>{label}</label>
    <!-- svelte-ignore a11y-no-onchange -->
    <select
        name={labelIdentifier}
        bind:value={currentSelection}
        on:change={handleChange}
        id={id}
        class:inactive={disableDropdown}
        disabled={disableDropdown}>
        <option selected disabled hidden id={resetId}>Bitte auswählen</option>
        {#each options as opt}
            <option value={{ opt, category }}>{opt}</option>
        {/each}
    </select>
</div>

<!-- STYLING ------------------------------ -->
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
    label {
        /* border: 1px solid red; */
        padding-left: 15px;
        color: #949494;
        display: inline-block;
        margin-bottom: 5px;
    }

    .select-wrapper {
        position: relative;
        width: 280px;
        display: inline-block;
        margin-top: 16px;
    }

    .select-wrapper::after {
        content: url("../../../static/images/icon_dropdown_closed.svg");
        pointer-events: none;
        position: absolute;
        height: calc(100% - 12px);
        padding-top: 12px;
        padding-left: 20px;
        right: 15px;
        width: 20px;
    }

    /* .select-wrapper.inactive::after {
        content: url("../../../static/images/icon_dropdown_inactive.svg");
        transition: 0s;
    } */

    /* .select-wrapper.inactive:hover::after {
        content: url("../../../static/images/icon_dropdown_inactive.svg");
        transition: 0s;
    } */

    select {
        -moz-appearance: none;
        -webkit-appearance: none;
        appearance: none;
        border: 1px solid #595959;
        border-radius: 24px;
        color: #595959;
        font-weight: 500;
        cursor: pointer;
        font-family: Montserrat;
        font-size: 16px;
        height: 40px;
        outline: none;
        padding-left: 15px;
        width: 100%;
        background-color: white;
    }

    select.inactive {
        border: 1px solid lightgray;
        color: lightgray;
        cursor: default;
    }

    option {
        color: var(--default-grey);
        background-color: white;
    }

    select::-ms-expand {
        display: none;
    }
</style>

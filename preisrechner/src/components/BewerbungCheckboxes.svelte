<script>
    import { get } from "svelte/store";

    import {
        selectedCategories,
        price,
        calculatedPrice,
        bewerbungCheckboxes,
        bewerbungenSelectedTypes,
        priceDisableStatus,
    } from "../stores/stores.js";

    // 'types' (received from App.svelte)
    export let dropdownDataTypes;

    // temporary store for all prices
    let pricesBewerbungen = [];

    // temporary store for all selected 'Types'
    let bewerbungenSelectedTypesTEMP = [];

    // we get a collection of prices, therefor we loop over them
    // and store all prices in an array (at a fixed index to preserve order)
    price.subscribe((p) => {
        try {
            p.forEach((object, index) => {
                pricesBewerbungen[index] = parseFloat(object.price);
            });
        } catch {}
    });

    let priceTEMP = 0;

    // reset-function (called by the form in App.svelte)
    export const resetMe = () => {
        priceTEMP = 0;
        pricesBewerbungen = [];
        try {
            const checkboxes = get(bewerbungCheckboxes);
            for (let item of checkboxes) {
                item.checked = false;
            }
        } catch {}
    };

    const handleChecked = (event) => {
        // get all checkboxes
        const allCheckboxes = document.getElementsByName("checkbox");
        // set store so we can reset all checkboxes later
        bewerbungCheckboxes.set(allCheckboxes);
        // the current checkbox
        let currentCheckbox;
        // if the function was invoked from link instead of checkbox
        if (event.srcElement.name === "a-handler") {
            currentCheckbox = allCheckboxes.item(event.srcElement.id);
            currentCheckbox.checked = !currentCheckbox.checked;
        } else {
            currentCheckbox = event.srcElement;
        }
        const srcElementId = event.srcElement.id;
        // lastCheckbox = dropdownDataTypes[srcElementId];
        if (currentCheckbox.checked) {
            selectedCategories.update((obj) => {
                obj["type"] = dropdownDataTypes[srcElementId];
                return obj;
            });
            priceTEMP += pricesBewerbungen[srcElementId];
        } else {
            selectedCategories.update((obj) => {
                obj["type"] = null;
                return obj;
            });
            priceTEMP -= pricesBewerbungen[srcElementId];
        }
        if (priceTEMP === 0) {
            priceTEMP = "0.00";
            priceDisableStatus.update((status) => {
                status = true;
                return status;
            });
        } else {
            // cast to float, toFixed returns a string
            priceTEMP = parseFloat(priceTEMP).toFixed(2);
        }

        if (
            !bewerbungenSelectedTypesTEMP.includes(
                dropdownDataTypes[srcElementId]
            )
        ) {
            bewerbungenSelectedTypesTEMP.push(dropdownDataTypes[srcElementId]);
        } else {
            bewerbungenSelectedTypesTEMP = bewerbungenSelectedTypesTEMP.filter(
                (v) => v !== dropdownDataTypes[srcElementId]
            );
        }

        bewerbungenSelectedTypes.set(bewerbungenSelectedTypesTEMP);
        calculatedPrice.set(priceTEMP);
        // cast string back to float
        priceTEMP = parseFloat(priceTEMP);
    };
</script>

<!-- MARKUP ------------------------------ -->
<div class="checkboxes-wrapper">
    {#each dropdownDataTypes as checkbox, index}
        <div class="checkbox-wrapper">
            <input
                type="checkbox"
                name="checkbox"
                id={index}
                on:change|preventDefault={handleChecked} />
            <a
                on:click={handleChecked}
                name="a-handler"
                id={index}>{checkbox}</a>
        </div>
    {/each}
</div>

<!-- STYLING ------------------------------ -->
<style>
    a {
        margin-left: 8px;
    }

    a:hover {
        text-decoration: underline;
        cursor: pointer;
    }
    .checkbox-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .checkboxes-wrapper {
        display: flex;
        flex-direction: column;
    }
</style>

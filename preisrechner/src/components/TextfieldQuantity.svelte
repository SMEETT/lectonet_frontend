<script>
    import {
        priceDisableStatus,
        calculatedPrice,
        price,
        quantity,
    } from "../stores/stores.js";

    // to be a boolean that reflects the current state
    // of the component
    let disabled;
    priceDisableStatus.subscribe((status) => {
        disabled = status;
    });

    let quantityTEMP;
    quantity.subscribe((qty) => {
        quantityTEMP = qty;
    });

    let priceTEMP;
    price.subscribe((p) => {
        priceTEMP = p;
    });

    const increase = (e) => {
        quantityTEMP = quantityTEMP + 1;
        calculatePrice();
    };

    const decrease = () => {
        quantityTEMP = quantityTEMP - 1;
        quantityTEMP < 1 ? (quantityTEMP = 1) : (quantityTEMP = quantityTEMP);
        calculatePrice();
    };

    const calculatePrice = (event) => {
        let calculatedPriceTEMP = (quantityTEMP * priceTEMP).toFixed(2);
        if (calculatedPriceTEMP == "NaN") {
            calculatedPriceTEMP = "0.00";
        }
        quantity.set(quantityTEMP);
        calculatedPrice.set(calculatedPriceTEMP);
    };
</script>

<!-- MARKUP ------------------------------ -->
<div class="wrapper-quantity">
    <label for="quantity">Umfang</label>
    <div class="lower-row">
        <input
            name="quantity"
            disabled={disabled}
            class:inactive={disabled}
            type="number"
            min="1"
            bind:value={quantityTEMP}
            on:input|preventDefault={calculatePrice} />
        <!-- depending on 'quantity', either show 'Seite' or 'Seiten' -->
        <span
            class:inactive={disabled}>{quantityTEMP > 1 ? 'Seiten' : 'Seite'}</span>
        <div class="plus-minus">
            <button
                alt="up"
                class="up"
                disabled={disabled}
                class:inactive={disabled}
                on:click={increase} />
            <button
                alt="down"
                class="down"
                disabled={disabled}
                class:inactive={disabled}
                on:click={decrease} />
        </div>
    </div>
</div>

<!-- STYLING ------------------------------ -->
<style>
    .wrapper-quantity {
        display: grid;
        grid-template-rows: auto auto;
        width: 280px;
        margin-top: 16px;
        align-items: center;
    }
    .lower-row {
        grid-row: 2;
        display: flex;
        align-items: center;
    }
    /* number input field's label */
    label {
        display: block;
        padding-left: 15px;
        color: #c4c4c4;
        margin-bottom: 5px;
    }
    /* number input field */
    input {
        -moz-appearance: none;
        -webkit-appearance: none;
        appearance: none;
        border: 1px solid #595959;
        border-radius: 24px;
        color: #595959;
        font-weight: 500;
        cursor: pointer;
        font-family: "Open Sans", sans-serif;
        font-size: 16px;
        text-align: center;
        height: 40px;
        outline: none;
        width: 80px;
        background-color: white;
    }

    input.inactive {
        border: 1px solid lightgray;
        color: lightgray;
        cursor: default;
    }

    span {
        margin-left: 8px;
        width: 56px;
    }
    /* corresponding span in markup either shows "Seite" or "Seiten" */
    span.inactive {
        color: lightgray;
    }

    .plus-minus {
        display: flex;
    }

    .plus-minus .up {
        background-image: url("../../../static/images/icon_plus.svg");
        background-repeat: no-repeat;
        background-size: contain;
        margin-bottom: 2px;
        width: 35px;
        height: 35px;
        background-color: white;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }

    .plus-minus .up:hover {
        background-image: url("../../../static/images/icon_plus_hover.svg");
    }

    .plus-minus .down {
        background-image: url("../../../static/images/icon_minus.svg");
        background-size: contain;
        background-repeat: no-repeat;
        width: 35px;
        height: 35px;
        background-color: white;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }

    .plus-minus .down:hover {
        background-image: url("../../../static/images/icon_minus_hover.svg");
    }

    .plus-minus .down.inactive {
        background-image: url("../../../static/images/icon_minus_inactive.svg");
        cursor: default;
    }

    .plus-minus .up.inactive {
        background-image: url("../../../static/images/icon_plus_inactive.svg");
        cursor: default;
    }

    /* disable spinners */
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
</style>

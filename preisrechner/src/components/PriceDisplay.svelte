<script>
    import {
        calculatedPrice,
        priceDisableStatus,
        price,
        appliedReduction,
        priceUpperBound,
        quantity,
    } from "../stores/stores.js";

    let disabled;
    priceDisableStatus.subscribe((status) => {
        disabled = status;
    });
    // initially set the displayed price to "0.00"
    let displayedPrice = "* 0.00";
    let displayedPriceReduced = null;
    // subscribe to the global price and wait for changes,
    // update the "displayedPrice"
    calculatedPrice.subscribe((price) => {
        if (price === "0.00") {
            displayedPrice = "* 0.00 €";
            displayedPriceReduced = null;
        } else {
            let appliedReductionTEMP = 0;
            if ($appliedReduction !== 0) {
                console.log("appliedReduction:", $appliedReduction);
                appliedReductionTEMP = 1 - $appliedReduction / 100;
                const priceStringReduced = `* ${(
                    price * appliedReductionTEMP
                ).toFixed(2)} € - ${(
                    price *
                    $priceUpperBound *
                    1.1 *
                    appliedReductionTEMP
                ).toFixed(2)} €`;
                console.log("priceStringReduced________", priceStringReduced);
                displayedPriceReduced = priceStringReduced;
            } else {
                displayedPriceReduced = null;
            }
            const priceString = `* ${price} € - ${(
                price *
                $priceUpperBound *
                1.1
            ).toFixed(2)} €`;
            displayedPrice = priceString;
        }
    });
</script>

<!-- MARKUP ------------------------------ -->
<div class="wrapper-price">
    {#if displayedPriceReduced !== null && appliedReduction !== 0}
        <div class="wrapper-price-old">
            <p
                id="price"
                class="oldPrice strikethrough-diagonal"
                class:inactive={disabled}
                disabled={disabled}>
                {`${displayedPrice}`}
            </p>
            <div class="badge badge-amount">{$quantity}</div>
            <div class="badge badge-reduction">-{$appliedReduction}%</div>
        </div>
        <p
            id="price"
            class="price"
            class:inactive={disabled}
            disabled={disabled}>
            {`${displayedPriceReduced}`}
        </p>
    {:else}
        <p
            id="price"
            class="price"
            class:inactive={disabled}
            disabled={disabled}>
            {`${displayedPrice}`}
        </p>
    {/if}
</div>

<!-- STYLING ------------------------------ -->
<style>
    .wrapper-price {
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 100%;
    }

    .wrapper-price-old {
        display: flex;
        /* border: 1px dotted blue; */
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin: 12px 0;
    }

    .badge {
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 24px;
        padding: 5px 8px;
        border-radius: 5px;
        margin-right: 5px;
        color: white;
        font-weight: 700;
        font-size: 16px;
    }

    .badge-reduction {
        background-color: #00b032;
    }

    .badge-amount {
        background-color: #d3d3d3;
    }

    p {
        font-size: 48px;
        font-weight: 700;
        margin: 0;
        padding: 0;
        font-family: Montserrat;
        display: block;
    }

    .price {
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 100%;
        text-align: center;
    }

    .oldPrice {
        display: flex;
        font-size: 26px;
        justify-content: center;
        align-items: center;
        line-height: 100%;
        text-align: center;
        margin-right: 10px;
        color: #e5e5e5;
    }

    .strikethrough-diagonal {
        position: relative;
        font-weight: bold;
    }

    .strikethrough-diagonal:before {
        position: absolute;
        content: "";
        left: 0;
        top: 45%;
        right: 0;
        border-top: 2px solid;
        border-color: inherit;
        -webkit-transform: skewY(-3deg);
        -moz-transform: skewY(-3deg);
        transform: skewY(-3deg);
    }

    p.inactive {
        color: lightgray;
    }

    /* ----------- 1280-WIDTH */
    @media (min-width: 1280px) {
    }
    /* ----------- 960-WIDTH */
    @media (max-width: 1279px) {
    }
    /* ----------- 600-WIDTH */
    @media (max-width: 959px) {
        .price {
            text-align: center;
            font-size: 32px;
        }

        .oldPrice {
            font-size: 20px;
        }
    }
    /* ----------- 320-WIDTH */
    @media (max-width: 599px) {
        .price {
            text-align: center;
            font-size: 22px;
        }

        .oldPrice {
            font-size: 16px;
        }

        .badge {
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 20px;
            padding: 4px 7px;
            font-size: 14px;
        }
    }
</style>

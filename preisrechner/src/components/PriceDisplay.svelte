<script>
    import {
        calculatedPrice,
        priceDisableStatus,
        price,
        priceUpperBound,
    } from "../stores/stores.js";

    let disabled;
    priceDisableStatus.subscribe((status) => {
        disabled = status;
    });
    // initially set the displayed price to "0.00"
    let displayedPrice = "*0.00";
    // subscribe to the global price and wait for changes,
    // update the "displayedPrice"
    calculatedPrice.subscribe((price) => {
        if (price === "0.00") {
            displayedPrice = "* 0.00 €";
        } else {
            const priceString = `* ${price} € - ${(
                price * $priceUpperBound
            ).toFixed(2)} €`;
            displayedPrice = priceString;
        }
    });
</script>

<!-- MARKUP ------------------------------ -->
<div class="wrapper-price">
    <p id="price" class="price" class:inactive={disabled} disabled={disabled}>
        {`${displayedPrice}`}
    </p>
</div>

<!-- STYLING ------------------------------ -->
<style>
    .wrapper-price {
        display: flex;
        flex-direction: column;
        align-items: center;
        line-height: 100%;
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
        margin: 16px 0;
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
    }
    /* ----------- 320-WIDTH */
    @media (max-width: 599px) {
        .price {
            text-align: center;
            font-size: 22px;
        }
    }
</style>

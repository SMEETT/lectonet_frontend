<script>
    import { calculatedPrice, priceDisableStatus } from "../stores/stores.js";

    let disabled;
    priceDisableStatus.subscribe((status) => {
        disabled = status;
    });
    // initially set the displayed price to "0.00"
    let displayedPrice = "0.00";
    // subscribe to the global price and wait for changes,
    // update the "displayedPrice"
    calculatedPrice.subscribe((price) => {
        displayedPrice = price;
    });
</script>

<!-- MARKUP ------------------------------ -->
<div class="wrapper-price">
    <p id="price" class:inactive={disabled} disabled={disabled}>
        {`${displayedPrice} €`}
    </p>
</div>

<!-- STYLING ------------------------------ -->
<style>
    .wrapper-price {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    p {
        font-size: 48px;
        font-weight: 700;
        margin: 0;
        padding: 0;
        font-family: Montserrat;
        display: block;
    }

    p.inactive {
        color: lightgray;
    }
</style>

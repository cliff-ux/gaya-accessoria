function renderCartItems() {

    const cartContent = document.getElementById('cart-content');

    cartContent.innerHTML = ''; // Clear previous content


    if (cart.length === 0) {

        cartContent.innerHTML = '<p>Your cart is empty.</p>';

        return;

    }


    cart.forEach(item => {

        const cartItem = document.createElement('div');

        cartItem.className = 'cart-item';

        cartItem.innerHTML = `

            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-details">

                <h4>${item.name}</h4>

                <p>Quantity: ${item.quantity}</p>

                <p class="cart-item-price">Total: $${item.total.toFixed(2)}</p>

                <button onclick="buyNow('${item.name}', ${item.price})" class="buy-now-button">Buy Now</button>

            </div>

        `;

        cartContent.appendChild(cartItem);

    });

}


function buyNow(productName, price) {

    // Clear the cart before proceeding to checkout

    cart = []; 

    localStorage.setItem('cart', JSON.stringify(cart)); // Clear cart in localStorage

    const checkoutUrl = `checkout/?add-to-cart=${productName}&price=${price}`; // Modify this URL as needed

    window.location.href = checkoutUrl; // Redirect to checkout

}
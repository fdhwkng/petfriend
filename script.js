/* =========================================================
   PET FRIEND
   ANA JAVASCRIPT DOSYASI
   =========================================================

   BU DOSYA:

   ✓ Ana sayfa
   ✓ Öne çıkan ürünler
   ✓ Ürün listeleme
   ✓ Arama
   ✓ Kategori filtreleme
   ✓ Maksimum fiyat filtresi
   ✓ Filtreleri Uygula
   ✓ Filtreleri Temizle
   ✓ Ürün detay
   ✓ Sepet
   ✓ Checkout
   ✓ Kapıda nakit ödeme
   ✓ Sipariş oluşturma
   ✓ Admin ürün ekleme
   ✓ Admin ürün düzenleme
   ✓ Admin ürün silme
   ✓ Gelen siparişler
   ✓ Sipariş onaylama
   ✓ Mobil menü
   ✓ Footer yılı

   Veriler localStorage içinde tutulur.
   ========================================================= */


/* =========================================================
   1. BAŞLANGIÇ ÜRÜNLERİ
   ========================================================= */

const defaultProducts = [

    {
        id: 1,
        name: "Premium Pişik Yemi",
        category: "Yem",
        price: 349.90,
        image:
            "https://placehold.co/600x450/F4E8D8/5E4634?text=Kedi+Mamasi",
        description:
            "Pişiyinizin gündəlik qidalanma ehtiyaclarını qarşılamağa kömək edən keyfiyyətli premium pişik yemi."
    },

    {
        id: 2,
        name: "Yetkin İt Yemi",
        category: "Yem",
        price: 499.90,
        image:
            "https://placehold.co/600x450/E8F0E5/355C45?text=Kopek+Mamasi",
        description:
            "Yetkin itlərin balanslaşdırılmış qidalanmasına kömək edən xüsusi formullu yem."
    },

    {
        id: 3,
        name: "Omega 3 Ev Heyvanı Vitamini",
        category: "Vitamin və Dərman",
        price: 189.90,
        image:
            "https://placehold.co/600x450/FFF0D8/C66A24?text=Omega+3",
        description:
            "Ev heyvanınızın ümumi baxımını dəstəkləməyə kömək edən Omega 3 əlavəsi."
    },

    {
        id: 4,
        name: "Tənzimlənən İt Tasması",
        category: "Aksesuar",
        price: 129.90,
        image:
            "https://placehold.co/600x450/E8F0E5/355C45?text=Kopek+Tasmasi",
        description:
            "Gündəlik istifadə üçün davamlı, rahat və tənzimlənən it tasması."
    },

    {
        id: 5,
        name: "Tüklü Pişik Oyuncağı",
        category: "Pişik Məhsulları",
        price: 79.90,
        image:
            "https://placehold.co/600x450/F4E8D8/5E4634?text=Kedi+Oyuncagi",
        description:
            "Pişiyinizin əylənməsini və hərəkət etməsini təmin edən rəngli tüklü oyuncaq."
    },

    {
        id: 6,
        name: "İt Çeynəmə Oyuncağı",
        category: "İt Məhsulları",
        price: 99.90,
        image:
            "https://placehold.co/600x450/FFF0D8/C66A24?text=Kopek+Oyuncagi",
        description:
            "İtlərin çeynəmə ehtiyacına uyğun davamlı oyuncaq."
    },

    {
        id: 7,
        name: "Pişik Qumu Kürəyi",
        category: "Pişik Məhsulları",
        price: 59.90,
        image:
            "https://placehold.co/600x450/F1EEE8/5E4634?text=Kum+Kuregi",
        description:
            "Pişik qumu təmizliyini asanlaşdıran praktik və davamlı kürək."
    },

    {
        id: 8,
        name: "İt Yem Qabı",
        category: "İt Məhsulları",
        price: 149.90,
        image:
            "https://placehold.co/600x450/E8F0E5/355C45?text=Mama+Kabi",
        description:
            "Asan təmizlənən, davamlı və zərif yem qabı."
    }

];


/* =========================================================
   2. LOCAL STORAGE ANAHTARLARI
   ========================================================= */

const STORAGE_KEYS = {

    products: "petFriendProducts",

    cart: "petFriendCart",

    orders: "petFriendOrders"

};


/* =========================================================
   3. YARDIMCI FONKSİYONLAR
   ========================================================= */

function formatPrice(price) {

    return Number(price).toLocaleString(
        "tr-TR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " ₺";

}


/* Güvenli HTML metni */
function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* localStorage'dan oku */
function getStorage(
    key,
    fallback
) {

    try {

        const data =
            localStorage.getItem(key);


        if (!data) {

            return fallback;

        }


        return JSON.parse(data);

    } catch (error) {

        console.error(
            "LocalStorage okuma hatası:",
            error
        );

        return fallback;

    }

}


/* localStorage'a kaydet */
function setStorage(
    key,
    data
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "LocalStorage kayıt hatası:",
            error
        );

    }

}


/* =========================================================
   4. ÜRÜNLER
   ========================================================= */

function getProducts() {

    const products =
        getStorage(
            STORAGE_KEYS.products,
            null
        );


    if (!Array.isArray(products)) {

        setStorage(
            STORAGE_KEYS.products,
            defaultProducts
        );


        return [
            ...defaultProducts
        ];

    }


    return products;

}


function saveProducts(
    products
) {

    setStorage(
        STORAGE_KEYS.products,
        products
    );

}


/* =========================================================
   5. SEPET
   ========================================================= */

function getCart() {

    const cart =
        getStorage(
            STORAGE_KEYS.cart,
            []
        );


    return Array.isArray(cart)
        ? cart
        : [];

}


function saveCart(
    cart
) {

    setStorage(
        STORAGE_KEYS.cart,
        cart
    );


    updateCartCount();

}


/* =========================================================
   6. SEPETE EKLE
   ========================================================= */

function addToCart(
    productId,
    quantity = 1
) {

    const products =
        getProducts();


    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        alert(
            "Məhsul tapılmadı."
        );

        return;

    }


    quantity =
        Number(quantity);


    if (
        !Number.isFinite(quantity) ||
        quantity < 1
    ) {

        quantity = 1;

    }


    quantity =
        Math.floor(quantity);


    const cart =
        getCart();


    const existingItem =
        cart.find(
            item =>
                Number(item.productId) ===
                Number(productId)
        );


    if (existingItem) {

        existingItem.quantity +=
            quantity;

    } else {

        cart.push({

            productId:
                Number(productId),

            quantity:
                quantity

        });

    }


    saveCart(
        cart
    );


    alert(
        `"${product.name}" səbətə əlavə edildi.`
    );

}


/* =========================================================
   7. SEPET ÜRÜN ADEDİ
   ========================================================= */

function updateCartItem(
    productId,
    quantity
) {

    let cart =
        getCart();


    quantity =
        Number(quantity);


    if (
        !Number.isFinite(quantity)
    ) {

        return;

    }


    quantity =
        Math.floor(quantity);


    const item =
        cart.find(
            cartItem =>
                Number(
                    cartItem.productId
                ) ===
                Number(productId)
        );


    if (!item) {

        return;

    }


    if (quantity <= 0) {

        cart =
            cart.filter(
                cartItem =>
                    Number(
                        cartItem.productId
                    ) !==
                    Number(productId)
            );

    } else {

        item.quantity =
            quantity;

    }


    saveCart(
        cart
    );


    renderCartPage();

}


/* =========================================================
   8. SEPETTEN SİL
   ========================================================= */

function removeFromCart(
    productId
) {

    const cart =
        getCart().filter(
            item =>
                Number(
                    item.productId
                ) !==
                Number(productId)
        );


    saveCart(
        cart
    );


    renderCartPage();

}


/* =========================================================
   9. SEPETİ TEMİZLE
   ========================================================= */

function clearCart() {

    saveCart([]);

    renderCartPage();

}


/* =========================================================
   10. SEPET SAYISI
   ========================================================= */

function getCartItemCount() {

    return getCart().reduce(
        (
            total,
            item
        ) => {

            return total +
                Number(
                    item.quantity
                );

        },
        0
    );

}


/* =========================================================
   11. HEADER SEPET SAYACI
   ========================================================= */

function updateCartCount() {

    const element =
        document.getElementById(
            "cartCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        getCartItemCount();

}


/* =========================================================
   12. SEPET TOPLAMI
   ========================================================= */

function getCartTotal() {

    const cart =
        getCart();


    const products =
        getProducts();


    return cart.reduce(
        (
            total,
            item
        ) => {

            const product =
                products.find(
                    productItem =>
                        Number(
                            productItem.id
                        ) ===
                        Number(
                            item.productId
                        )
                );


            if (!product) {

                return total;

            }


            return total +
                product.price *
                item.quantity;

        },
        0
    );

}


/* =========================================================
   13. ÜRÜN KARTI
   ========================================================= */

function createProductCard(
    product
) {

    return `

        <article class="product-card">


            <a
                href="product.html?id=${encodeURIComponent(product.id)}"
                class="product-image-link"
            >

                <img
                    class="product-image"
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                    onerror="
                        this.src='https://placehold.co/600x450/F1EEE8/5E4634?text=Pet+Friend'
                    "
                />

            </a>


            <div class="product-card-content">


                <div class="product-category">

                    ${escapeHTML(
                        product.category
                    )}

                </div>


                <h3 class="product-title">

                    <a
                        href="product.html?id=${encodeURIComponent(product.id)}"
                    >

                        ${escapeHTML(
                            product.name
                        )}

                    </a>

                </h3>


                <div class="product-price">

                    ${formatPrice(
                        product.price
                    )}

                </div>


                <button
                    type="button"
                    class="add-to-cart-btn"
                    data-product-id="${product.id}"
                >

                    Səbətə Əlavə Et

                </button>


            </div>


        </article>

    `;

}


/* =========================================================
   14. ANA SAYFA
   ========================================================= */

function renderFeaturedProducts() {

    const container =
        document.getElementById(
            "featuredProducts"
        );


    if (!container) {

        return;

    }


    const products =
        getProducts();


    const featured =
        products.slice(
            0,
            4
        );


    if (!featured.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🐾
                </div>

                <h2>
                    Hələ məhsul yoxdur
                </h2>

            </div>

        `;

        return;

    }


    container.innerHTML =
        featured
            .map(
                createProductCard
            )
            .join("");

}


/* =========================================================
   15. ÜRÜN SAYFASI
   ========================================================= */

function renderProductsPage() {

    const container =

        document.getElementById(
            "productList"
        ) ||

        document.getElementById(
            "product-list"
        );


    if (!container) {

        return;

    }


    const products =
        getProducts();


    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlCategory =
        params.get(
            "category"
        );


    const searchInput =

        document.getElementById(
            "productSearch"
        ) ||

        document.getElementById(
            "product-search"
        ) ||

        document.getElementById(
            "searchInput"
        );


    const categorySelect =

        document.getElementById(
            "categoryFilter"
        ) ||

        document.getElementById(
            "category-filter"
        );


    const maxPriceInput =

        document.getElementById(
            "maxPrice"
        ) ||

        document.getElementById(
            "max-price"
        ) ||

        document.getElementById(
            "maxPriceInput"
        );


    let selectedCategory =
        "all";


    if (
        categorySelect &&
        categorySelect.value
    ) {

        selectedCategory =
            categorySelect.value;

    }


    if (urlCategory) {

        selectedCategory =
            urlCategory;

    }


    let searchTerm =
        "";


    if (
        searchInput &&
        searchInput.value
    ) {

        searchTerm =
            searchInput.value
                .toLocaleLowerCase(
                    "tr-TR"
                )
                .trim();

    }


    let maxPrice =
        null;


    if (
        maxPriceInput &&
        maxPriceInput.value.trim() !== ""
    ) {

        const value =
            Number(
                maxPriceInput.value
            );


        if (
            Number.isFinite(value) &&
            value >= 0
        ) {

            maxPrice =
                value;

        }

    }


    let filteredProducts =
        [...products];


    /* =====================================================
       KATEGORİ
       ===================================================== */

    if (
        selectedCategory &&
        selectedCategory !== "all" &&
        selectedCategory !== ""
    ) {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    product.category ===
                    selectedCategory
            );

    }


    /* =====================================================
       ARAMA
       ===================================================== */

    if (searchTerm) {

        filteredProducts =
            filteredProducts.filter(
                product => {

                    const name =
                        product.name
                            .toLocaleLowerCase(
                                "tr-TR"
                            );


                    const category =
                        product.category
                            .toLocaleLowerCase(
                                "tr-TR"
                            );


                    return (
                        name.includes(
                            searchTerm
                        ) ||

                        category.includes(
                            searchTerm
                        )
                    );

                }
            );

    }


    /* =====================================================
       MAKSİMUM FİYAT
       ===================================================== */

    if (maxPrice !== null) {

        filteredProducts =
            filteredProducts.filter(
                product =>

                    Number(
                        product.price
                    ) <=
                    maxPrice
            );

    }


    /* =====================================================
       ÜRÜN YOK
       ===================================================== */

    if (
        filteredProducts.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🔎
                </div>

                <h2>
                    Məhsul tapılmadı
                </h2>

                <p>
                    Seçdiyiniz filtrlərə uyğun məhsul tapılmadı.
                </p>

            </div>

        `;

        updateProductResultCount(
            0
        );

        return;

    }


    /* =====================================================
       ÜRÜNLERİ YAZ
       ===================================================== */

    container.innerHTML =
        filteredProducts
            .map(
                createProductCard
            )
            .join("");


    updateProductResultCount(
        filteredProducts.length
    );

}


/* =========================================================
   16. ÜRÜN SONUÇ SAYISI
   ========================================================= */

function updateProductResultCount(
    count
) {

    const element =

        document.getElementById(
            "productResultCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        `${count} məhsul`;

}


/* =========================================================
   17. KATEGORİLERİ DOLDUR
   ========================================================= */

function populateCategoryFilter() {

    const select =

        document.getElementById(
            "categoryFilter"
        ) ||

        document.getElementById(
            "category-filter"
        );


    if (!select) {

        return;

    }


    const products =
        getProducts();


    const categories =
        [
            ...new Set(
                products.map(
                    product =>
                        product.category
                )
            )
        ];


    const currentValue =
        select.value;


    select.innerHTML = `

        <option value="all">
            Bütün Kateqoriyalar
        </option>

        ${
            categories
                .map(
                    category => `

                        <option
                            value="${escapeHTML(category)}"
                        >

                            ${escapeHTML(category)}

                        </option>

                    `
                )
                .join("")
        }

    `;


    if (
        currentValue &&
        [...select.options].some(
            option =>
                option.value ===
                currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


/* =========================================================
   18. FİLTRE BUTONU
   ========================================================= */

function setupFilterButton() {

    const existingButton =
        document.getElementById(
            "applyFilters"
        );


    if (existingButton) {

        return;

    }


    const maxPriceInput =

        document.getElementById(
            "maxPrice"
        ) ||

        document.getElementById(
            "max-price"
        ) ||

        document.getElementById(
            "maxPriceInput"
        );


    if (!maxPriceInput) {

        return;

    }


    const parent =
        maxPriceInput.parentElement;


    if (!parent) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.id =
        "applyFilters";


    button.className =
        "btn btn-primary btn-full filter-apply-button";


    button.textContent =
        "Filtrləri Tətbiq Et";


    parent.appendChild(
        button
    );

}


/* =========================================================
   19. FİLTRE TEMİZLE
   ========================================================= */

function clearFilters() {

    const searchInput =

        document.getElementById(
            "productSearch"
        ) ||

        document.getElementById(
            "product-search"
        ) ||

        document.getElementById(
            "searchInput"
        );


    const categorySelect =

        document.getElementById(
            "categoryFilter"
        ) ||

        document.getElementById(
            "category-filter"
        );


    const maxPriceInput =

        document.getElementById(
            "maxPrice"
        ) ||

        document.getElementById(
            "max-price"
        ) ||

        document.getElementById(
            "maxPriceInput"
        );


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (categorySelect) {

        categorySelect.value =
            "all";

    }


    if (maxPriceInput) {

        maxPriceInput.value =
            "";

    }


    /*
       Kategori URL'sini temizle.
    */

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );


    renderProductsPage();

}


/* =========================================================
   20. ÜRÜN DETAY
   ========================================================= */

function getProductIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        Number(
            params.get("id")
        );


    return Number.isFinite(id)
        ? id
        : null;

}


function renderProductDetailPage() {

    const container =

        document.getElementById(
            "productDetail"
        ) ||

        document.getElementById(
            "product-detail"
        );


    if (!container) {

        return;

    }


    const productId =
        getProductIdFromURL();


    const product =
        getProducts().find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🐾
                </div>

                <h2>
                    Məhsul tapılmadı
                </h2>

                <p>
                    Axtardığınız məhsul mövcud deyil.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    Məhsullara Qayıt
                </a>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="product-detail-image">

            <img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
                onerror="
                    this.src='https://placehold.co/800x600/F1EEE8/5E4634?text=Pet+Friend'
                "
            />

        </div>


        <div class="product-detail-info">

            <span class="product-category">
                ${escapeHTML(product.category)}
            </span>


            <h1>
                ${escapeHTML(product.name)}
            </h1>


            <div class="product-detail-price">
                ${formatPrice(product.price)}
            </div>


            <p class="product-detail-description">
                ${escapeHTML(product.description)}
            </p>


            <div class="quantity-row">

                <label>
                    Say:
                </label>


                <div class="quantity-control">

                    <button
                        type="button"
                        id="detailMinus"
                    >
                        −
                    </button>


                    <input
                        type="number"
                        id="detailQuantity"
                        min="1"
                        value="1"
                    />


                    <button
                        type="button"
                        id="detailPlus"
                    >
                        +
                    </button>

                </div>

            </div>


            <div class="detail-actions">

                <button
                    type="button"
                    id="detailAddToCart"
                    class="btn btn-primary"
                    data-product-id="${product.id}"
                >
                    Səbətə Əlavə Et
                </button>

            </div>


            <div class="product-meta">

                <div class="meta-row">

                    <span>
                        Ödəniş
                    </span>

                    <strong>
                        Qapıda Nağd
                    </strong>

                </div>


                <div class="meta-row">

                    <span>
                        Kateqoriya
                    </span>

                    <strong>
                        ${escapeHTML(
                            product.category
                        )}
                    </strong>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   21. SEPET SAYFASI
   ========================================================= */

function renderCartPage() {

    const container =

        document.getElementById(
            "cartItems"
        ) ||

        document.getElementById(
            "cart-items"
        );


    const totalElement =

        document.getElementById(
            "cartTotal"
        ) ||

        document.getElementById(
            "cart-total"
        );


    if (!container) {

        return;

    }


    const cart =
        getCart();


    const products =
        getProducts();


    if (
        cart.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🛒
                </div>

                <h2>
                    Səbətiniz boşdur
                </h2>

                <p>
                    Hələ səbətinizə məhsul əlavə etməmisiniz.
                </p>

                <a
                    href="products.html"
                    class="btn btn-primary"
                >
                    Alış-verişə Başla
                </a>

            </div>

        `;


        if (totalElement) {

            totalElement.textContent =
                formatPrice(0);

        }


        return;

    }


    let total =
        0;


    container.innerHTML =

        cart.map(
            item => {

                const product =
                    products.find(
                        productItem =>
                            Number(
                                productItem.id
                            ) ===
                            Number(
                                item.productId
                            )
                    );


                if (!product) {

                    return "";

                }


                const subtotal =
                    product.price *
                    item.quantity;


                total +=
                    subtotal;


                return `

                    <div class="cart-item">

                        <div class="cart-item-image">

                            <img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                            />

                        </div>


                        <div class="cart-item-info">

                            <h3>
                                ${escapeHTML(
                                    product.name
                                )}
                            </h3>


                            <p>
                                ${formatPrice(
                                    product.price
                                )}
                            </p>


                            <div class="cart-item-actions">

                                <label>
                                    Say:

                                    <input
                                        type="number"
                                        min="1"
                                        value="${item.quantity}"
                                        class="cart-quantity-input"
                                        data-product-id="${product.id}"
                                    />

                                </label>


                                <button
                                    type="button"
                                    class="remove-cart-btn"
                                    data-product-id="${product.id}"
                                >
                                    Məhsulu Sil
                                </button>

                            </div>


                            <div class="cart-item-total">

                                Aralıq cəmi:
                                <strong>
                                    ${formatPrice(
                                        subtotal
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");


    if (totalElement) {

        totalElement.textContent =
            formatPrice(total);

    }

}


/* =========================================================
   22. CHECKOUT
   ========================================================= */

function handleCheckout(
    event
) {

    event.preventDefault();


    const cart =
        getCart();


    if (
        cart.length === 0
    ) {

        alert(
            "Səbətiniz boşdur."
        );

        return;

    }


    const nameInput =

        document.getElementById(
            "customerName"
        ) ||

        document.getElementById(
            "customer-name"
        ) ||

        document.getElementById(
            "name"
        );


    const phoneInput =

        document.getElementById(
            "customerPhone"
        ) ||

        document.getElementById(
            "customer-phone"
        ) ||

        document.getElementById(
            "phone"
        );


    const addressInput =

        document.getElementById(
            "customerAddress"
        ) ||

        document.getElementById(
            "customer-address"
        ) ||

        document.getElementById(
            "address"
        );


    if (
        !nameInput ||
        !phoneInput ||
        !addressInput
    ) {

        alert(
            "Sifariş forması sahələri tapılmadı."
        );

        return;

    }


    const customerName =
        nameInput.value.trim();


    const customerPhone =
        phoneInput.value.trim();


    const customerAddress =
        addressInput.value.trim();


    if (
        !customerName ||
        !customerPhone ||
        !customerAddress
    ) {

        alert(
            "Zəhmət olmasa ad, telefon və ünvan sahələrini doldurun."
        );

        return;

    }


    const products =
        getProducts();


    const orderItems =

        cart

            .map(
                item => {

                    const product =
                        products.find(
                            productItem =>
                                Number(
                                    productItem.id
                                ) ===
                                Number(
                                    item.productId
                                )
                        );


                    if (!product) {

                        return null;

                    }


                    return {

                        productId:
                            product.id,

                        name:
                            product.name,

                        price:
                            product.price,

                        quantity:
                            item.quantity,

                        subtotal:
                            product.price *
                            item.quantity

                    };

                }
            )

            .filter(Boolean);


    const total =
        orderItems.reduce(
            (
                sum,
                item
            ) => {

                return sum +
                    item.subtotal;

            },
            0
        );


    const orders =
        getStorage(
            STORAGE_KEYS.orders,
            []
        );


    const newOrder = {

        id:
            "PF-" +
            Date.now(),

        createdAt:
            new Date().toISOString(),

        customer: {

            name:
                customerName,

            phone:
                customerPhone,

            address:
                customerAddress

        },

        paymentMethod:
            "Qapıda Nağd Ödəniş",

        items:
            orderItems,

        total:
            total,

        status:
            "Yeni Sifariş"

    };


    orders.push(
        newOrder
    );


    setStorage(
        STORAGE_KEYS.orders,
        orders
    );


    /*
       Sipariş tamamlanınca sepeti temizle.
    */

    saveCart([]);


    alert(

        "Sifarişiniz uğurla yaradıldı!\n\n" +

        "Sifariş No: " +
        newOrder.id +

        "\n\n" +

        "Ödəniş: Qapıda Nağd"

    );


    window.location.href =
        "index.html";

}


/* =========================================================
   23. CHECKOUT TOPLAMI
   ========================================================= */

function renderCheckoutTotal() {

    const element =

        document.getElementById(
            "checkoutTotal"
        ) ||

        document.getElementById(
            "checkout-total"
        );


    if (!element) {

        return;

    }


    element.textContent =
        formatPrice(
            getCartTotal()
        );

}


/* =========================================================
   24. ADMİN SEKMELERİ
   ========================================================= */

function setupAdminTabs() {

    const tabs =
        document.querySelectorAll(
            "[data-admin-tab]"
        );


    const productsTab =
        document.getElementById(
            "adminTabProducts"
        );


    const ordersTab =
        document.getElementById(
            "adminTabOrders"
        );


    if (
        !tabs.length ||
        !productsTab ||
        !ordersTab
    ) {

        return;

    }


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                function () {

                    const target =
                        tab.dataset.adminTab;


                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    if (
                        target ===
                        "orders"
                    ) {

                        productsTab.classList.remove(
                            "active"
                        );

                        ordersTab.classList.add(
                            "active"
                        );

                        renderAdminOrders();

                    } else {

                        ordersTab.classList.remove(
                            "active"
                        );

                        productsTab.classList.add(
                            "active"
                        );

                        renderAdminProducts();

                    }

                }
            );

        }
    );

}


/* =========================================================
   25. ADMİN ÜRÜNLERİ
   ========================================================= */

function renderAdminProducts() {

    const container =
        document.getElementById(
            "adminProductList"
        );


    if (!container) {

        return;

    }


    const products =
        getProducts();


    const countElement =
        document.getElementById(
            "adminProductCount"
        );


    if (countElement) {

        countElement.textContent =
            `${products.length} məhsul`;

    }


    if (
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🛍️
                </div>

                <h2>
                    Hələ məhsul yoxdur
                </h2>

                <p>
                    Yuxarıdakı formu istifadə edərək ilk məhsulunuzu əlavə edin.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =

        products
            .map(
                product => `

                    <div class="admin-product-row">


                        <div class="admin-product-main">

                            <img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                                class="admin-product-thumb"
                                onerror="
                                    this.src='https://placehold.co/100x100/F1EEE8/5E4634?text=PF'
                                "
                            />


                            <div>

                                <strong>

                                    ${escapeHTML(
                                        product.name
                                    )}

                                </strong>


                                <span>

                                    ${escapeHTML(
                                        product.category
                                    )}

                                </span>

                            </div>

                        </div>


                        <div class="admin-product-price">

                            ${formatPrice(
                                product.price
                            )}

                        </div>


                        <div class="admin-actions">

                            <button
                                type="button"
                                class="btn btn-small btn-secondary"
                                data-edit-product="${product.id}"
                            >
                                Redaktə et
                            </button>


                            <button
                                type="button"
                                class="btn btn-small btn-danger"
                                data-delete-product="${product.id}"
                            >
                                Sil
                            </button>

                        </div>


                    </div>

                `
            )
            .join("");

}


/* =========================================================
   26. YENİ ÜRÜN ID
   ========================================================= */

function createNewProductId(
    products
) {

    if (!products.length) {

        return 1;

    }


    const ids =
        products.map(
            product =>
                Number(
                    product.id
                ) || 0
        );


    return (
        Math.max(...ids) +
        1
    );

}


/* =========================================================
   27. ADMİN ÜRÜN KAYDET
   ========================================================= */

function saveAdminProduct(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const idInput =
        form.querySelector(
            "#productId"
        );


    const nameInput =
        form.querySelector(
            "#productName"
        );


    const categoryInput =
        form.querySelector(
            "#productCategory"
        );


    const priceInput =
        form.querySelector(
            "#productPrice"
        );


    const imageInput =
        form.querySelector(
            "#productImage"
        );


    const descriptionInput =
        form.querySelector(
            "#productDescription"
        );


    if (
        !nameInput ||
        !categoryInput ||
        !priceInput ||
        !imageInput ||
        !descriptionInput
    ) {

        alert(
            "Məhsul formunda çatışmayan sahə var."
        );

        return;

    }


    const name =
        nameInput.value.trim();


    const category =
        categoryInput.value.trim();


    const price =
        Number(
            priceInput.value
        );


    const image =
        imageInput.value.trim();


    const description =
        descriptionInput.value.trim();


    if (
        !name ||
        !category ||
        !image ||
        !description
    ) {

        alert(
            "Zəhmət olmasa bütün məhsul sahələrini doldurun."
        );

        return;

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Düzgün bir qiymət daxil edin."
        );

        return;

    }


    const products =
        getProducts();


    const editingId =
        idInput.value
            ? Number(
                idInput.value
            )
            : null;


    /*
       DÜZENLEME
    */

    if (editingId) {

        const index =
            products.findIndex(
                product =>
                    Number(
                        product.id
                    ) ===
                    editingId
            );


        if (index === -1) {

            alert(
                "Məhsul tapılmadı."
            );

            return;

        }


        products[index] = {

            ...products[index],

            name:
                name,

            category:
                category,

            price:
                price,

            image:
                image,

            description:
                description

        };


        alert(
            "Məhsul uğurla yeniləndi."
        );

    }


    /*
       YENİ ÜRÜN
    */

    else {

        const newProduct = {

            id:
                createNewProductId(
                    products
                ),

            name:
                name,

            category:
                category,

            price:
                price,

            image:
                image,

            description:
                description

        };


        products.push(
            newProduct
        );


        alert(
            "Yeni məhsul uğurla əlavə edildi."
        );

    }


    saveProducts(
        products
    );


    resetAdminProductForm();


    renderAdminProducts();

    renderFeaturedProducts();

    renderProductsPage();

    populateCategoryFilter();

}


/* =========================================================
   28. ADMİN ÜRÜN FORMUNU TEMİZLE
   ========================================================= */

function resetAdminProductForm() {

    const form =
        document.getElementById(
            "adminProductForm"
        );


    if (!form) {

        return;

    }


    form.reset();


    const idInput =
        document.getElementById(
            "productId"
        );


    if (idInput) {

        idInput.value =
            "";

    }


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (submitButton) {

        submitButton.textContent =
            "Məhsulu Yadda Saxla";

    }

}


/* =========================================================
   29. ADMİN ÜRÜN DÜZENLE
   ========================================================= */

function editProduct(
    productId
) {

    const product =
        getProducts().find(
            item =>
                Number(
                    item.id
                ) ===
                Number(
                    productId
                )
        );


    if (!product) {

        alert(
            "Məhsul tapılmadı."
        );

        return;

    }


    const idInput =
        document.getElementById(
            "productId"
        );


    const nameInput =
        document.getElementById(
            "productName"
        );


    const categoryInput =
        document.getElementById(
            "productCategory"
        );


    const priceInput =
        document.getElementById(
            "productPrice"
        );


    const imageInput =
        document.getElementById(
            "productImage"
        );


    const descriptionInput =
        document.getElementById(
            "productDescription"
        );


    if (idInput) {

        idInput.value =
            product.id;

    }


    if (nameInput) {

        nameInput.value =
            product.name;

    }


    if (categoryInput) {

        categoryInput.value =
            product.category;

    }


    if (priceInput) {

        priceInput.value =
            product.price;

    }


    if (imageInput) {

        imageInput.value =
            product.image;

    }


    if (descriptionInput) {

        descriptionInput.value =
            product.description;

    }


    const submitButton =
        document.querySelector(
            "#adminProductForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "Dəyişiklikləri Yadda Saxla";

    }


    const form =
        document.getElementById(
            "adminProductForm"
        );


    if (form) {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   30. ADMİN ÜRÜN SİL
   ========================================================= */

function deleteProduct(
    productId
) {

    const products =
        getProducts();


    const product =
        products.find(
            item =>
                Number(
                    item.id
                ) ===
                Number(
                    productId
                )
        );


    if (!product) {

        alert(
            "Məhsul tapılmadı."
        );

        return;

    }


    const confirmed =
        confirm(

            `"${product.name}" məhsulunu silmək istədiyinizə əminsiniz?`

        );


    if (!confirmed) {

        return;

    }


    const newProducts =
        products.filter(
            item =>
                Number(
                    item.id
                ) !==
                Number(
                    productId
                )
        );


    saveProducts(
        newProducts
    );


    /*
       Ürün sepette varsa
       oradan da çıkar.
    */

    const newCart =
        getCart().filter(
            item =>
                Number(
                    item.productId
                ) !==
                Number(
                    productId
                )
        );


    saveCart(
        newCart
    );


    renderAdminProducts();

    renderFeaturedProducts();

    renderProductsPage();

    renderCartPage();

    populateCategoryFilter();


    alert(
        "Məhsul silindi."
    );

}


/* =========================================================
   31. ADMİN SİPARİŞ SAYISI
   ========================================================= */

function updateAdminOrderCount() {

    const orders =
        getStorage(
            STORAGE_KEYS.orders,
            []
        );


    const countElement =
        document.getElementById(
            "adminOrderCount"
        );


    const badgeElement =
        document.getElementById(
            "adminOrdersBadge"
        );


    /*
       Yeni sipariş sayısı
    */

    const newOrdersCount =
        orders.filter(
            order =>
                order.status !==
                "Təsdiqləndi"
        ).length;


    if (countElement) {

        countElement.textContent =
            newOrdersCount;

    }


    if (badgeElement) {

        badgeElement.textContent =
            `${orders.length} sifariş`;

    }

}


/* =========================================================
   32. ADMİN SİPARİŞLERİ GÖSTER
   ========================================================= */

function renderAdminOrders() {

    const container =
        document.getElementById(
            "adminOrderList"
        );


    if (!container) {

        return;

    }


    const orders =
        getStorage(
            STORAGE_KEYS.orders,
            []
        );


    updateAdminOrderCount();


    if (
        orders.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    📦
                </div>

                <h2>
                    Hələ sifariş yoxdur
                </h2>

                <p>
                    Müştərilərdən gələn sifarişlər burada görünəcək.
                </p>

            </div>

        `;

        return;

    }


    /*
       En yeni sipariş en üstte.
    */

    const sortedOrders =
        [...orders].reverse();


    container.innerHTML =

        sortedOrders
            .map(
                order => {

                    const customer =
                        order.customer ||
                        {};


                    const items =
                        Array.isArray(
                            order.items
                        )
                            ? order.items
                            : [];


                    const date =
                        order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString(
                                "tr-TR"
                              )
                            : "";


                    const itemsHTML =
                        items
                            .map(
                                item => `

                                    <div class="order-line">

                                        <span>

                                            ${escapeHTML(
                                                item.name
                                            )}

                                            ×
                                            ${item.quantity}

                                        </span>


                                        <strong>

                                            ${formatPrice(
                                                item.subtotal
                                            )}

                                        </strong>

                                    </div>

                                `
                            )
                            .join("");


                    const isApproved =
                        order.status ===
                        "Təsdiqləndi";


                    return `

                        <article
                            class="order-card ${
                                isApproved
                                    ? "order-approved"
                                    : ""
                            }"
                        >


                            <div class="order-card-header">


                                <div>

                                    <div class="order-id">

                                        ${escapeHTML(
                                            order.id
                                        )}

                                    </div>


                                    <div class="order-date">

                                        ${date}

                                    </div>

                                </div>


                                <div class="order-status-badge ${
                                    isApproved
                                        ? "approved"
                                        : "new"
                                }">

                                    ${
                                        isApproved
                                            ? "✓ Təsdiqləndi"
                                            : "Yeni Sifariş"
                                    }

                                </div>


                            </div>


                            <div class="admin-order-info">


                                <div class="admin-order-customer">

                                    <h4>
                                        Müştəri Məlumatları
                                    </h4>


                                    <p>

                                        <strong>
                                            Ad Soyad:
                                        </strong>

                                        ${escapeHTML(
                                            customer.name ||
                                            "Məlumat yoxdur"
                                        )}

                                    </p>


                                    <p>

                                        <strong>
                                            Telefon:
                                        </strong>

                                        ${escapeHTML(
                                            customer.phone ||
                                            "Məlumat yoxdur"
                                        )}

                                    </p>


                                    <p>

                                        <strong>
                                            Çatdırılma Ünvanı:
                                        </strong>

                                        ${escapeHTML(
                                            customer.address ||
                                            "Məlumat yoxdur"
                                        )}

                                    </p>


                                    <p>

                                        <strong>
                                            Ödəniş:
                                        </strong>

                                        Qapıda Nağd Ödəniş

                                    </p>

                                </div>


                                <div class="order-items">

                                    <h4>
                                        Sifariş Tərkibi
                                    </h4>


                                    ${itemsHTML}


                                    <div class="order-total">

                                        <span>
                                            Cəmi
                                        </span>

                                        <strong>
                                            ${formatPrice(
                                                order.total
                                            )}
                                        </strong>

                                    </div>

                                </div>


                            </div>


                            <div class="order-card-actions">


                                ${
                                    isApproved

                                        ? `

                                            <span class="approved-message">

                                                ✓ Bu sifariş təsdiqləndi.

                                            </span>

                                        `

                                        : `

                                            <button
                                                type="button"
                                                class="btn btn-primary"
                                                data-approve-order="${escapeHTML(
                                                    order.id
                                                )}"
                                            >

                                                ✓ Sifarişi Təsdiqlə

                                            </button>

                                        `
                                }


                            </div>


                        </article>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   33. SİPARİŞ ONAYLA
   ========================================================= */

function approveOrder(
    orderId
) {

    const orders =
        getStorage(
            STORAGE_KEYS.orders,
            []
        );


    const order =
        orders.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    orderId
                )
        );


    if (!order) {

        alert(
            "Sifariş tapılmadı."
        );

        return;

    }


    if (
        order.status ===
        "Təsdiqləndi"
    ) {

        return;

    }


    const confirmed =
        confirm(

            `#${order.id} nömrəli sifarişi təsdiqləmək istəyirsiniz?`

        );


    if (!confirmed) {

        return;

    }


    order.status =
        "Təsdiqləndi";


    order.approvedAt =
        new Date().toISOString();


    setStorage(
        STORAGE_KEYS.orders,
        orders
    );


    renderAdminOrders();

    updateAdminOrderCount();


    alert(
        "Sifariş uğurla təsdiqləndi."
    );

}


/* =========================================================
   34. ADMİN BUTONLARI
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {


        /* =====================================================
           ADMİN SEKMESİ
           ===================================================== */

        const adminTab =
            event.target.closest(
                "[data-admin-tab]"
            );


        if (adminTab) {

            /*
               Tabların kendi event'i olduğu için
               burada ekstra işlem gerekmiyor.
            */

        }


        /* =====================================================
           ÜRÜN SİL
           ===================================================== */

        const deleteButton =
            event.target.closest(
                "[data-delete-product]"
            );


        if (deleteButton) {

            deleteProduct(
                Number(
                    deleteButton.dataset.deleteProduct
                )
            );


            return;

        }


        /* =====================================================
           ÜRÜN DÜZENLE
           ===================================================== */

        const editButton =
            event.target.closest(
                "[data-edit-product]"
            );


        if (editButton) {

            editProduct(
                Number(
                    editButton.dataset.editProduct
                )
            );


            return;

        }


        /* =====================================================
           SİPARİŞ ONAYLA
           ===================================================== */

        const approveButton =
            event.target.closest(
                "[data-approve-order]"
            );


        if (approveButton) {

            approveOrder(
                approveButton.dataset.approveOrder
            );


            return;

        }


        /* =====================================================
           SEPETE EKLE
           ===================================================== */

        const addButton =
            event.target.closest(
                ".add-to-cart-btn"
            );


        if (addButton) {

            const productId =
                Number(
                    addButton.dataset.productId
                );


            let quantity =
                1;


            const detailQuantity =
                document.getElementById(
                    "detailQuantity"
                );


            if (
                detailQuantity &&
                Number(
                    detailQuantity.value
                ) > 0
            ) {

                quantity =
                    Number(
                        detailQuantity.value
                    );

            }


            addToCart(
                productId,
                quantity
            );


            return;

        }


        /* =====================================================
           DETAYDAN SEPETE EKLE
           ===================================================== */

        const detailAddButton =
            event.target.closest(
                "#detailAddToCart"
            );


        if (detailAddButton) {

            const productId =
                Number(
                    detailAddButton.dataset.productId
                );


            const quantityInput =
                document.getElementById(
                    "detailQuantity"
                );


            const quantity =
                quantityInput
                    ? Number(
                        quantityInput.value
                      )
                    : 1;


            addToCart(
                productId,
                quantity
            );


            return;

        }


        /* =====================================================
           DETAY ADET ARTIR
           ===================================================== */

        if (
            event.target.closest(
                "#detailPlus"
            )
        ) {

            const input =
                document.getElementById(
                    "detailQuantity"
                );


            if (input) {

                input.value =
                    Number(
                        input.value
                    ) + 1;

            }


            return;

        }


        /* =====================================================
           DETAY ADET AZALT
           ===================================================== */

        if (
            event.target.closest(
                "#detailMinus"
            )
        ) {

            const input =
                document.getElementById(
                    "detailQuantity"
                );


            if (input) {

                input.value =
                    Math.max(
                        1,
                        Number(
                            input.value
                        ) - 1
                    );

            }


            return;

        }


        /* =====================================================
           SEPETTEN SİL
           ===================================================== */

        const removeButton =
            event.target.closest(
                ".remove-cart-btn"
            );


        if (removeButton) {

            removeFromCart(
                Number(
                    removeButton.dataset.productId
                )
            );


            return;

        }


        /* =====================================================
           SEPETİ TEMİZLE
           ===================================================== */

        const clearCartButton =
            event.target.closest(
                "#clearCart"
            );


        if (clearCartButton) {

            const confirmed =
                confirm(
                    "Səbəti tamamilə təmizləmək istəyirsiniz?"
                );


            if (confirmed) {

                clearCart();

            }


            return;

        }


        /* =====================================================
           FİLTRELERİ UYGULA
           ===================================================== */

        const applyFiltersButton =
            event.target.closest(
                "#applyFilters"
            );


        if (applyFiltersButton) {

            renderProductsPage();

            return;

        }


        /* =====================================================
           FİLTRELERİ TEMİZLE
           ===================================================== */

        const clearFiltersButton =

            event.target.closest(
                "#clearFilters"
            ) ||

            event.target.closest(
                ".filter-clear"
            );


        if (clearFiltersButton) {

            clearFilters();

            return;

        }


        /* =====================================================
           MOBİL MENÜ
           ===================================================== */

        const menuToggle =
            event.target.closest(
                "#menuToggle"
            );


        if (menuToggle) {

            const mainNav =
                document.getElementById(
                    "mainNav"
                );


            if (mainNav) {

                const isOpen =
                    mainNav.classList.toggle(
                        "open"
                    );


                menuToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );

            }

        }

    }
);


/* =========================================================
   35. INPUT DEĞİŞİKLİKLERİ
   ========================================================= */

document.addEventListener(
    "change",
    function (event) {


        /* Sepet adedi */

        if (
            event.target.matches(
                ".cart-quantity-input"
            )
        ) {

            updateCartItem(

                Number(
                    event.target.dataset.productId
                ),

                Number(
                    event.target.value
                )

            );


            return;

        }


        /* Kategori değişince */

        if (

            event.target.matches(
                "#categoryFilter"
            )

            ||

            event.target.matches(
                "#category-filter"
            )

        ) {

            renderProductsPage();


            return;

        }

    }
);


/* =========================================================
   36. ARAMA
   ========================================================= */

document.addEventListener(
    "input",
    function (event) {

        if (

            event.target.matches(
                "#productSearch"
            )

            ||

            event.target.matches(
                "#product-search"
            )

            ||

            event.target.matches(
                "#searchInput"
            )

        ) {

            renderProductsPage();

        }

    }
);


/* =========================================================
   37. FORM GÖNDERİMLERİ
   ========================================================= */

document.addEventListener(
    "submit",
    function (event) {


        /* Checkout */

        if (

            event.target.matches(
                "#checkoutForm"
            )

            ||

            event.target.matches(
                "#checkout-form"
            )

            ||

            event.target.matches(
                ".checkout-form"
            )

        ) {

            handleCheckout(
                event
            );


            return;

        }


        /* Admin ürün */

        if (

            event.target.matches(
                "#adminProductForm"
            )

            ||

            event.target.matches(
                "#admin-product-form"
            )

            ||

            event.target.matches(
                ".admin-product-form"
            )

        ) {

            saveAdminProduct(
                event
            );


            return;

        }

    }
);


/* =========================================================
   38. FORM TEMİZLE BUTONU
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#cancelProductEdit"
            );


        if (!button) {

            return;

        }


        resetAdminProductForm();

    }
);


/* =========================================================
   39. FOOTER YILI
   ========================================================= */

function setCurrentYear() {

    const element =
        document.getElementById(
            "currentYear"
        );


    if (element) {

        element.textContent =
            new Date().getFullYear();

    }

}


/* =========================================================
   40. ADMİN TAB BAŞLANGIÇ
   ========================================================= */

function initializeAdmin() {

    setupAdminTabs();

    renderAdminProducts();

    renderAdminOrders();

    updateAdminOrderCount();

}


/* =========================================================
   41. SAYFA AÇILINCA BAŞLAT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Ürün verisini hazırla.
        */

        getProducts();


        /*
           Sepet sayısı.
        */

        updateCartCount();


        /*
           Kategori filtresi.
        */

        populateCategoryFilter();


        /*
           Maksimum fiyat için buton.
        */

        setupFilterButton();


        /*
           Ana sayfa.
        */

        renderFeaturedProducts();


        /*
           Ürünler.
        */

        renderProductsPage();


        /*
           Ürün detay.
        */

        renderProductDetailPage();


        /*
           Sepet.
        */

        renderCartPage();


        /*
           Checkout.
        */

        renderCheckoutTotal();


        /*
           Admin.
        */

        initializeAdmin();


        /*
           Mobil menü.
        */

        setupMobileMenuFallback();


        /*
           Footer.
        */

        setCurrentYear();


        console.log(
            "🐾 Pet Friend sistemi hazır."
        );

    }
);


/* =========================================================
   42. MOBİL MENÜ YARDIMCI
   ========================================================= */

function setupMobileMenuFallback() {

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const mainNav =
        document.getElementById(
            "mainNav"
        );


    if (
        !menuToggle ||
        !mainNav
    ) {

        return;

    }


    if (
        menuToggle.dataset.ready ===
        "true"
    ) {

        return;

    }


    menuToggle.dataset.ready =
        "true";


    menuToggle.addEventListener(
        "click",
        function () {

            const isOpen =
                mainNav.classList.toggle(
                    "open"
                );


            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );

        }
    );


    mainNav
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        mainNav.classList.remove(
                            "open"
                        );


                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   43. GLOBAL PET FRIEND
   ========================================================= */

window.PetFriend = {

    getProducts,

    saveProducts,

    getCart,

    addToCart,

    updateCartItem,

    removeFromCart,

    clearCart,

    getCartTotal,

    getCartItemCount,

    renderProductsPage,

    renderFeaturedProducts,

    renderProductDetailPage,

    renderCartPage,

    renderAdminProducts,

    renderAdminOrders,

    editProduct,

    deleteProduct,

    approveOrder,

    clearFilters

};

const ADMIN_PASSWORD = "salam";
/* =========================================================
   DOSYA SONU
   ========================================================= */

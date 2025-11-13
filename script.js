// Simple demo data and cart logic (no backend). Uses localStorage.
(function(){
  const products = [
    { id: 'p1', title: 'Pulseira Minimal', price: 59.9, img: 'https://via.placeholder.com/600x400/222222/ffffff?text=Pulseira+Minimal', stock: 12, desc: 'Pulseira em aço inox com acabamento premium.' },
    { id: 'p2', title: 'Colar Elegance', price: 129.9, img: 'https://via.placeholder.com/600x400/111111/ffffff?text=Colar+Elegance', stock: 8, desc: 'Colar delicado com pingente banhado.' },
    { id: 'p3', title: 'Óculos Solar', price: 199.0, img: 'https://via.placeholder.com/600x400/333333/ffffff?text=%C3%93culos+Solar', stock: 6, desc: 'Óculos com lente UV e armação leve.' },
    { id: 'p4', title: 'Anel Clássico', price: 89.0, img: 'https://via.placeholder.com/600x400/444444/ffffff?text=Anel+Cl%C3%A1ssico', stock: 15, desc: 'Anel em aço com acabamento escovado.' },
    { id: 'p5', title: 'Brinco Delicado', price: 49.5, img: 'https://via.placeholder.com/600x400/555555/ffffff?text=Brinco+Delicado', stock: 20, desc: 'Brinco leve, perfeito para o dia a dia.' },
    { id: 'p6', title: 'Carteira Slim', price: 109.9, img: 'https://via.placeholder.com/600x400/666666/ffffff?text=Carteira+Slim', stock: 10, desc: 'Carteira compacta em material sintético premium.' }
  ];

  // Utilities
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const storageKey = 'infinity_demo_cart_v1';

  function getCart(){
    try{
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    }catch(e){
      return {};
    }
  }
  function saveCart(cart){
    localStorage.setItem(storageKey, JSON.stringify(cart));
    updateMiniCounts();
  }

  function updateMiniCounts(){
    const cart = getCart();
    const qty = Object.values(cart).reduce((s,v)=>s+v.qty,0);
    $$('#mini-count, #mini-count-2, #mini-count-3').forEach(el=>{
      if(el) el.textContent = qty;
    });
  }

  // Render home products (few)
  function renderHome(){
    const container = $('#home-products');
    if(!container) return;
    container.innerHTML = '';
    products.slice(0,4).forEach(p=>{
      const el = document.createElement('div');
      el.className = 'product';
      el.innerHTML = `
        <img src="${p.img}" alt="${p.title}">
        <h3>${p.title}</h3>
        <div class="price">R$ ${p.price.toFixed(2)}</div>
        <p class="muted" style="margin-top:8px">${p.desc}</p>
        <div class="add-to-cart">
          <a class="btn ghost" href="produto.html?id=${p.id}">Ver</a>
          <button class="btn primary" data-add="${p.id}">Adicionar</button>
        </div>
      `;
      container.appendChild(el);
    });
  }

  // Render products grid
  function renderProductsGrid(){
    const grid = $('#products-grid');
    if(!grid) return;
    grid.innerHTML = '';
    products.forEach(p=>{
      const el = document.createElement('div');
      el.className = 'product';
      el.innerHTML = `
        <img src="${p.img}" alt="${p.title}">
        <h3>${p.title}</h3>
        <div class="price">R$ ${p.price.toFixed(2)}</div>
        <p class="muted">${p.desc}</p>
        <div class="add-to-cart">
          <a class="btn ghost" href="produto.html?id=${p.id}">Detalhes</a>
          <button class="btn primary" data-add="${p.id}">Adicionar</button>
        </div>
      `;
      grid.appendChild(el);
    });
  }

  // Product details page
  function renderProductView(){
    const view = $('#produto-view');
    if(!view) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || products[0].id;
    const p = products.find(x=>x.id===id);
    if(!p){
      view.innerHTML = '<p>Produto não encontrado.</p>';
      return;
    }
    view.innerHTML = `
      <div class="grid-3" style="grid-template-columns:1fr 1fr;">
        <div>
          <img src="${p.img}" alt="${p.title}" style="width:100%;border-radius:12px">
        </div>
        <div>
          <h1>${p.title}</h1>
          <div class="price" style="font-size:1.6rem">R$ ${p.price.toFixed(2)}</div>
          <p class="muted" style="margin-top:10px">${p.desc}</p>

          <div style="margin-top:12px">
            <label>Quantidade: <input type="number" id="qty" value="1" min="1" max="${p.stock}"></label>
          </div>

          <div style="margin-top:14px">
            <button class="btn primary" id="add-now">Adicionar ao carrinho</button>
            <a class="btn ghost" href="produtos.html" style="margin-left:8px">Voltar</a>
          </div>

          <div style="margin-top:18px" class="muted">
            <p><strong>Estoque:</strong> ${p.stock}</p>
            <p><strong>Pagamento seguro:</strong> Pix, cartão e alternativas integradas.</p>
            <p><strong>Atendimento:</strong> Chatbot e suporte 24h (simulado).</p>
          </div>
        </div>
      </div>
    `;

    $('#add-now').addEventListener('click', ()=> {
      const q = parseInt($('#qty').value,10) || 1;
      addToCart(p.id, q);
      location.href = 'carrinho.html';
    });
  }

  // Cart rendering
  function renderCart(){
    const container = $('#cart');
    if(!container) return;
    const cart = getCart();
    const ids = Object.keys(cart);
    if(ids.length===0){
      container.innerHTML = '<p>Seu carrinho está vazio.</p>';
      return;
    }
    let html = '';
    let total = 0;
    ids.forEach(id=>{
      const entry = cart[id];
      const p = products.find(x=>x.id===id);
      if(!p) return;
      const subtotal = p.price * entry.qty;
      total += subtotal;
      html += `
        <div class="cart-item" data-id="${id}">
          <img src="${p.img}" alt="${p.title}">
          <div style="flex:1">
            <strong>${p.title}</strong>
            <div class="muted">R$ ${p.price.toFixed(2)} • Subtotal: R$ ${subtotal.toFixed(2)}</div>
          </div>
          <div>
            <input type="number" value="${entry.qty}" min="1" max="${p.stock}" data-qty="${id}">
            <div style="margin-top:8px;text-align:right">
              <button class="btn ghost" data-remove="${id}">Remover</button>
            </div>
          </div>
        </div>
      `;
    });
    html += `<div style="margin-top:12px"><strong>Total: R$ ${total.toFixed(2)}</strong></div>`;
    container.innerHTML = html;

    // wire quantity inputs
    container.querySelectorAll('input[data-qty]').forEach(inp=>{
      inp.addEventListener('change', (e)=>{
        const id = inp.getAttribute('data-qty');
        let qty = parseInt(inp.value,10) || 1;
        const p = products.find(x=>x.id===id);
        if(qty > p.stock) qty = p.stock;
        updateQty(id, qty);
        renderCart();
      });
    });

    container.querySelectorAll('button[data-remove]').forEach(btn=>{
      btn.addEventListener('click', ()=> {
        const id = btn.getAttribute('data-remove');
        removeFromCart(id);
        renderCart();
      });
    });
  }

  // Cart actions
  function addToCart(id, qty=1){
    const cart = getCart();
    if(!cart[id]) cart[id] = { qty: 0 };
    cart[id].qty += qty;
    saveCart(cart);
  }
  function updateQty(id, qty){
    const cart = getCart();
    if(cart[id]) {
      cart[id].qty = qty;
      if(cart[id].qty <= 0) delete cart[id];
    }
    saveCart(cart);
  }
  function removeFromCart(id){
    const cart = getCart();
    if(cart[id]) delete cart[id];
    saveCart(cart);
  }
  function clearCart(){
    localStorage.removeItem(storageKey);
    updateMiniCounts();
  }

  // Simulate checkout
  function fakeCheckout(){
    const cart = getCart();
    const items = Object.keys(cart).length;
    if(items === 0){
      showMessage('O carrinho está vazio. Adicione produtos antes de finalizar.');
      return;
    }
    // Simulated flow: prepare message for WhatsApp or confirmation
    const receipt = {
      date: new Date().toLocaleString(),
      items: Object.keys(cart).map(id=>{
        const p = products.find(x=>x.id===id);
        return { title: p.title, qty: cart[id].qty, price: p.price };
      })
    };
    clearCart();
    showMessage('Checkout simulado com sucesso. Um link de confirmação (simulado) foi enviado.');
    console.log('Simulated receipt:', receipt);
  }

  function showMessage(msg){
    const el = document.getElementById('checkout-message') || document.createElement('div');
    el.className = 'muted';
    el.textContent = msg;
    if(!document.getElementById('checkout-message')) {
      document.body.appendChild(el);
    } else {
      document.getElementById('checkout-message').textContent = msg;
    }
  }

  // Event delegation for add buttons on products pages
  function setupAddButtons(){
    document.body.addEventListener('click', function(e){
      const btn = e.target.closest('button[data-add]');
      if(btn){
        const id = btn.getAttribute('data-add');
        addToCart(id, 1);
        alert('Produto adicionado ao carrinho (demo).');
      }
    });
  }

  // Wire actions for cart page
  document.addEventListener('DOMContentLoaded', function(){
    // populate dynamic parts for each page
    updateMiniCounts();
    const y = new Date().getFullYear();
    ['year','year-2','year-3','year-4'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.textContent = y;
    });

    renderHome();
    renderProductsGrid();
    renderProductView();
    renderCart();
    setupAddButtons();

    // wire clear cart and checkout buttons if present
    const clearBtn = document.getElementById('clear-cart');
    if(clearBtn) clearBtn.addEventListener('click', ()=> { clearCart(); renderCart(); });

    const checkoutBtn = document.getElementById('fake-checkout');
    if(checkoutBtn) checkoutBtn.addEventListener('click', ()=> { fakeCheckout(); renderCart(); });
  });

})();

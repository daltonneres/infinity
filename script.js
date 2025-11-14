// script.js — versão com modal, validação ViaCEP, export JSON e admin integration
(function(){
  // Produtos com SKU e peso (kg)
  const products = [
    { id: 'p1', sku: 'ODX-P001', title: 'Pulseira Minimal', price: 59.9, img: 'https://images.tcdn.com.br/img/img_prod/1253358/pulseira_snake_prateada_4012_1_d717bd01b87245f4acda7b2e9876bac2.jpg', stock: 12, weight: 0.03, desc: 'Pulseira em aço inox com acabamento premium.' },
    { id: 'p2', sku: 'ODX-P002', title: 'Colar Elegance', price: 129.9, img: 'https://images.tcdn.com.br/img/img_prod/1044174/colar_elegance_personalizado_1111_2_cc291d2817a286c041888b03a51b4cea.jpg', stock: 8, weight: 0.04, desc: 'Colar delicado com pingente banhado.' },
    { id: 'p3', sku: 'ODX-P003', title: 'Óculos Solar', price: 199.0, img: 'https://safine.com.br/wp-content/uploads/2022/10/safine_com_br-oculos-de-sol-redondo-caramelo-sophia-5.jpg', stock: 6, weight: 0.18, desc: 'Óculos com lente UV e armação leve.' },
    { id: 'p4', sku: 'ODX-P004', title: 'Anel Clássico', price: 89.0, img: 'https://images.tcdn.com.br/img/img_prod/746079/anel_abaulado_classico_banhado_a_ouro_18k_131_1_4579b7025a70ed076b965ce2dbf41346.jpg', stock: 15, weight: 0.02, desc: 'Anel em aço com acabamento escovado.' },
    { id: 'p5', sku: 'ODX-P005', title: 'Brinco Delicado', price: 49.5, img: 'https://images.tcdn.com.br/img/img_prod/1022170/brinco_delicado_mini_flor_dourada_cravejada_e_perola_3646_3_321ea23027f4e5218cf37d44d7892b5a.jpg', stock: 20, weight: 0.01, desc: 'Brinco leve, perfeito para o dia a dia.' },
    { id: 'p6', sku: 'ODX-P006', title: 'Carteira Slim', price: 109.9, img: 'https://www.lojafasolo.com.br/arquivos/PRODUTOS/1991616779741329518/273_GG_Carteira-de-couro-Fasolo-Super-Slim.jpg', stock: 10, weight: 0.12, desc: 'Carteira compacta em material sintético premium.' },
    { id: 'p7', sku: 'ODX-P007', title: 'Relógio Neo', price: 349.0, img: 'https://d13p5wuxy0ioj8.cloudfront.net/Custom/Content/Products/18/10/1810518_relogio-orient-neo-sports-masculino-mgss1262-p2kx-pretoip404358-166716_m3_638696838582142169.webp', stock: 5, weight: 0.25, desc: 'Relógio com pulseira em aço e resistência à água.' },
    { id: 'p8', sku: 'ODX-P008', title: 'Bolsa Tote', price: 279.9, img: 'https://constance.vtexassets.com/arquivos/ids/2313166/Bolsa-Tote-Bege-Couro_3.jpg?v=638623501902100000', stock: 7, weight: 0.45, desc: 'Bolsa tote em material premium, ideal para o dia a dia.' },
    { id: 'p9', sku: 'ODX-P009', title: 'Cinto Couro', price: 89.9, img: 'https://31004.cdn.simplo7.net/static/31004/sku/roupas-country-cinto-cinto-country-de-couro-legitimo-personalizado-mcs7148--p-1669314070698.png', stock: 18, weight: 0.15, desc: 'Cinto em couro sintético com fivela sofisticada.' },
    { id: 'p10', sku: 'ODX-P010', title: 'Chaveiro Luxe', price: 29.9, img: 'https://cordolario.com.br/cdn/shop/files/IMG_4008.jpg?v=1724852450&width=2048', stock: 50, weight: 0.02, desc: 'Chaveiro metálico com acabamento premium.' }
  ];

  // Utilities
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const storageKey = 'infinity_demo_cart_v1'; // compatibilidade
  const ordersKey = 'onix_orders_v1';

  function formatBRL(value){
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function getCart(){
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch(e){ return {}; }
  }
  function saveCart(cart){
    localStorage.setItem(storageKey, JSON.stringify(cart));
    updateMiniCounts();
  }

  function updateMiniCounts(){
    const cart = getCart();
    const qty = Object.values(cart).reduce((s,v)=>s+v.qty,0);
    $$('#mini-count, #mini-count-2, #mini-count-3').forEach(el=>{ if(el) el.textContent = qty; });
  }

  // Renderers (home, grid, product, cart)
  function renderHome(){
    const container = $('#home-products'); if(!container) return;
    container.innerHTML = '';
    products.slice(0,4).forEach(p=>{
      const el = document.createElement('div'); el.className='product';
      el.innerHTML = `
        <img src="${p.img}" alt="${p.title}">
        <h3>${p.title}</h3>
        <div class="muted">${p.sku}</div>
        <div class="price">${formatBRL(p.price)}</div>
        <p class="muted" style="margin-top:8px">${p.desc}</p>
        <div class="add-to-cart">
          <a class="btn ghost" href="produto.html?id=${p.id}">Ver</a>
          <button class="btn primary" data-add="${p.id}">Adicionar</button>
        </div>
      `;
      container.appendChild(el);
    });
  }

  function renderProductsGrid(){
    const grid = $('#products-grid'); if(!grid) return;
    grid.innerHTML = '';
    products.forEach(p=>{
      const el = document.createElement('div'); el.className='product';
      el.innerHTML = `
        <img src="${p.img}" alt="${p.title}">
        <h3>${p.title}</h3>
        <div class="muted">${p.sku}</div>
        <div class="price">${formatBRL(p.price)}</div>
        <p class="muted">${p.desc}</p>
        <div class="add-to-cart">
          <a class="btn ghost" href="produto.html?id=${p.id}">Detalhes</a>
          <button class="btn primary" data-add="${p.id}">Adicionar</button>
        </div>
      `;
      grid.appendChild(el);
    });
  }

  function renderProductView(){
    const view = $('#produto-view'); if(!view) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || products[0].id;
    const p = products.find(x=>x.id===id);
    if(!p){ view.innerHTML = '<p>Produto não encontrado.</p>'; return; }
    view.innerHTML = `
      <div class="grid-3" style="grid-template-columns:1fr 1fr;">
        <div><img src="${p.img}" alt="${p.title}" style="width:100%;border-radius:12px"></div>
        <div>
          <h1>${p.title}</h1>
          <div class="muted">${p.sku}</div>
          <div class="price" style="font-size:1.6rem">${formatBRL(p.price)}</div>
          <p class="muted" style="margin-top:10px">${p.desc}</p>
          <div style="margin-top:12px"><label>Quantidade: <input type="number" id="qty" value="1" min="1" max="${p.stock}"></label></div>
          <div style="margin-top:14px">
            <button class="btn primary" id="add-now">Adicionar ao carrinho</button>
            <a class="btn ghost" href="produtos.html" style="margin-left:8px">Voltar</a>
          </div>
          <div style="margin-top:18px" class="muted">
            <p><strong>Estoque:</strong> ${p.stock}</p>
            <p><strong>Peso (aprox.):</strong> ${p.weight} kg</p>
            <p><strong>Pagamento seguro:</strong> Pix, cartão e boleto (simulado).</p>
          </div>
        </div>
      </div>
    `;
    $('#add-now').addEventListener('click', ()=> {
      const q = parseInt($('#qty').value,10) || 1;
      const ok = addToCart(p.id, q);
      if(ok) location.href = 'carrinho.html';
    });
  }

  function renderCart(){
    const container = $('#cart'); if(!container) return;
    const cart = getCart(); const ids = Object.keys(cart);
    if(ids.length===0){ container.innerHTML = '<p>Seu carrinho está vazio.</p>'; return; }
    let html = ''; let total = 0; let totalWeight = 0;
    ids.forEach(id=>{
      const entry = cart[id]; const p = products.find(x=>x.id===id);
      if(!p) return;
      const subtotal = p.price * entry.qty;
      total += subtotal;
      totalWeight += (p.weight||0) * entry.qty;
      html += `
        <div class="cart-item" data-id="${id}">
          <img src="${p.img}" alt="${p.title}">
          <div style="flex:1">
            <strong>${p.title}</strong>
            <div class="muted">${p.sku} • ${formatBRL(p.price)} • Subtotal: ${formatBRL(subtotal)}</div>
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

    html += `
      <div style="margin-top:12px">
        <div><strong>Subtotal:</strong> ${formatBRL(total)}</div>
        <div style="margin-top:8px">
          <label>CEP para cálculo de frete: <input type="text" id="cep-input" placeholder="Ex: 01001-000" maxlength="10" style="width:140px"></label>
          <button id="calc-shipping" class="btn ghost" style="margin-left:8px">Calcular frete</button>
        </div>
        <div id="shipping-result" class="muted" style="margin-top:8px"></div>

        <div style="margin-top:12px">
          <label>Forma de pagamento:
            <select id="payment-method">
              <option value="pix">Pix (sem taxa)</option>
              <option value="boleto">Boleto (1% taxa)</option>
              <option value="card">Cartão de Crédito (2.5% taxa)</option>
            </select>
          </label>
        </div>

        <div style="margin-top:12px"><strong>Total (sem frete): ${formatBRL(total)}</strong></div>
      </div>
    `;

    html += `<div style="margin-top:12px"><button id="open-checkout-modal" class="btn primary">Finalizar pedido</button> <button id="clear-cart" class="btn ghost">Esvaziar carrinho</button></div>`;

    container.innerHTML = html;

    // quantity inputs
    container.querySelectorAll('input[data-qty]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const id = inp.getAttribute('data-qty');
        let qty = parseInt(inp.value,10) || 1;
        const p = products.find(x=>x.id===id);
        if(qty > p.stock){ qty = p.stock; inp.value = qty; showToast('Quantidade ajustada ao estoque disponível.'); }
        updateQty(id, qty); renderCart();
      });
    });

    container.querySelectorAll('button[data-remove]').forEach(btn=>{
      btn.addEventListener('click', ()=> { removeFromCart(btn.getAttribute('data-remove')); renderCart(); });
    });

    const calcBtn = document.getElementById('calc-shipping');
    if(calcBtn) calcBtn.addEventListener('click', async ()=>{
      const cepRaw = (document.getElementById('cep-input').value || '').replace(/\D/g,'');
      if(!cepRaw){ showToast('Informe um CEP válido para calcular o frete (ou deixe em branco para estimativa).'); return; }
      const valid = await validateCep(cepRaw);
      const shipping = calculateShipping(cepRaw, totalWeight, total);
      const el = document.getElementById('shipping-result');
      if(!valid) el.textContent = 'CEP não encontrado — frete apresentado como estimativa.';
      if(shipping === 0) el.textContent = 'Frete gratuito (promoção).';
      else el.textContent = `Frete estimado: ${formatBRL(shipping)} • Prazo estimado: ${estimateDeliveryDays(cepRaw)} dias úteis.`;
    });

    const clearBtn = document.getElementById('clear-cart');
    if(clearBtn) clearBtn.addEventListener('click', ()=> { clearCart(); renderCart(); });

    const openModalBtn = document.getElementById('open-checkout-modal');
    if(openModalBtn) openModalBtn.addEventListener('click', ()=> openCheckoutModal(total, totalWeight));
  }

  // Shipping logic (mesma heurística)
  function calculateShipping(cep, totalWeight, subtotal){
    if(subtotal >= 300) return 0;
    const cepClean = (cep || '').replace(/\D/g,'');
    if(cepClean && cepClean.length === 8){
      const first = cepClean.charAt(0);
      let base = 0;
      if(totalWeight <= 0.2) base = 12.9;
      else if(totalWeight <= 1) base = 18.9;
      else if(totalWeight <= 3) base = 29.9;
      else base = 49.9;
      if(['6','7','8','9'].includes(first)) base *= 1.25;
      return Math.round(base * 100) / 100;
    } else {
      if(totalWeight <= 0.2) return 14.9;
      if(totalWeight <= 1) return 22.9;
      if(totalWeight <= 3) return 34.9;
      return 59.9;
    }
  }

  function estimateDeliveryDays(cep){
    if(!cep || cep.length !== 8) return '5-10';
    const first = cep.charAt(0);
    if(['0','1','2','3','4'].includes(first)) return '3-6';
    if(['5'].includes(first)) return '4-8';
    return '7-12';
  }

  // Cart actions
  function addToCart(id, qty=1){
    const cart = getCart();
    const p = products.find(x=>x.id===id);
    if(!p){ showToast('Produto inválido.'); return false; }
    const existing = cart[id] ? cart[id].qty : 0;
    if(existing + qty > p.stock){ showToast(`Quantidade excede o estoque disponível (${p.stock}).`); return false; }
    if(!cart[id]) cart[id] = { qty: 0 };
    cart[id].qty += qty;
    saveCart(cart);
    showToast('Produto adicionado ao carrinho (demo).');
    return true;
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

  // Orders helper
  function saveOrder(order){
    try{
      const list = JSON.parse(localStorage.getItem(ordersKey)) || [];
      list.push(order);
      localStorage.setItem(ordersKey, JSON.stringify(list));
    }catch(e){
      console.warn('Não foi possível salvar o pedido localmente.', e);
    }
  }

  // ViaCEP validation
  async function validateCep(cep){
    try{
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if(!res.ok) return false;
      const data = await res.json();
      return !data.erro;
    }catch(e){
      console.warn('ViaCEP fetch error', e);
      return false;
    }
  }

  // ---- Modal: cria DOM do modal globalmente (uma vez)
  function createModalShell(){
    if(document.getElementById('odx-modal-shell')) return;
    const shell = document.createElement('div');
    shell.id = 'odx-modal-shell';
    shell.innerHTML = `
      <div id="odx-modal-backdrop" class="odx-backdrop" aria-hidden="true"></div>
      <div id="odx-modal" class="odx-modal" role="dialog" aria-modal="true" aria-hidden="true">
        <header class="odx-modal-header">
          <h3 id="odx-modal-title">Finalizar pedido</h3>
          <button id="odx-modal-close" class="btn ghost">Fechar</button>
        </header>
        <div id="odx-modal-body" class="odx-modal-body"></div>
        <footer class="odx-modal-footer">
          <button id="odx-modal-confirm" class="btn primary">Confirmar pedido</button>
          <button id="odx-modal-cancel" class="btn ghost">Cancelar</button>
        </footer>
      </div>
    `;
    document.body.appendChild(shell);

    // close handlers
    document.getElementById('odx-modal-close').addEventListener('click', closeModal);
    document.getElementById('odx-modal-cancel').addEventListener('click', closeModal);
    document.getElementById('odx-modal-backdrop').addEventListener('click', closeModal);
  }

  function openModal(title, bodyHtml, onConfirm){
    createModalShell();
    const modal = document.getElementById('odx-modal');
    const body = document.getElementById('odx-modal-body');
    const titleEl = document.getElementById('odx-modal-title');
    const confirmBtn = document.getElementById('odx-modal-confirm');

    titleEl.textContent = title || 'Modal';
    body.innerHTML = bodyHtml || '';
    modal.setAttribute('aria-hidden','false');
    document.getElementById('odx-modal-backdrop').setAttribute('aria-hidden','false');
    modal.classList.add('odx-open');

    const confirmHandler = async () => {
      try{ await onConfirm(); } catch(e){ console.error(e); }
      finally{ /* keep close managed by onConfirm if needed */ }
    };

    confirmBtn.onclick = confirmHandler;
  }

  function closeModal(){
    const modal = document.getElementById('odx-modal');
    if(!modal) return;
    modal.setAttribute('aria-hidden','true');
    document.getElementById('odx-modal-backdrop').setAttribute('aria-hidden','true');
    modal.classList.remove('odx-open');
  }

  // Checkout modal flow
  function openCheckoutModal(subtotal, totalWeight){
    const cart = getCart();
    const items = Object.keys(cart);
    if(items.length === 0){ showToast('Carrinho vazio.'); return; }

    // montar form HTML
    const itemsHtml = items.map(id=>{
      const p = products.find(x=>x.id===id);
      return `<div style="margin-bottom:6px"><strong>${cart[id].qty}× ${p.title}</strong> <span class="muted">(${p.sku})</span></div>`;
    }).join('');

    const bodyHtml = `
      <div style="display:grid;gap:10px">
        <div><strong>Itens:</strong>${itemsHtml}</div>
        <label>Nome completo:<input id="odx-customer-name" type="text" style="width:100%;margin-top:6px;padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08)"></label>
        <label>Telefone (WhatsApp):<input id="odx-customer-phone" type="text" placeholder="5511999998888" style="width:100%;margin-top:6px;padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08)"></label>
        <label>CEP:<input id="odx-cep" type="text" placeholder="01001-000" style="width:160px;margin-top:6px;padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08)"></label>
        <div style="display:flex;gap:8px;align-items:center">
          <button id="odx-validate-cep" class="btn ghost">Validar CEP (ViaCEP)</button>
          <div id="odx-cep-result" class="muted" style="margin-left:8px"></div>
        </div>
        <label>Forma de pagamento:
          <select id="odx-payment" style="width:100%;margin-top:6px;padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08)">
            <option value="pix">Pix (sem taxa)</option>
            <option value="boleto">Boleto (1%)</option>
            <option value="card">Cartão (2.5%)</option>
          </select>
        </label>

        <div id="odx-order-summary" class="muted" style="margin-top:6px">
          Subtotal: ${formatBRL(subtotal)} • Peso total: ${totalWeight.toFixed(2)} kg
        </div>

        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="odx-download-json" class="btn ghost">Baixar pedidos (JSON)</button>
          <button id="odx-open-admin" class="btn ghost">Abrir Admin</button>
        </div>
      </div>
    `;

    openModal('Finalizar pedido — Ônix Deluxe', bodyHtml, async ()=>{ /* placeholder, confirm handled below */ });

    // wire modal inner controls after open
    setTimeout(()=>{ // pequeno timeout para garantir DOM criado
      document.getElementById('odx-validate-cep').addEventListener('click', async ()=>{
        const cepRaw = (document.getElementById('odx-cep').value || '').replace(/\D/g,'');
        if(!cepRaw || cepRaw.length !== 8){ document.getElementById('odx-cep-result').textContent = 'CEP inválido.'; return; }
        document.getElementById('odx-cep-result').textContent = 'Validando...';
        const ok = await validateCep(cepRaw);
        document.getElementById('odx-cep-result').textContent = ok ? 'CEP válido.' : 'CEP não encontrado.';
      });

      document.getElementById('odx-download-json').addEventListener('click', ()=> {
        const data = localStorage.getItem(ordersKey) || '[]';
        downloadBlob(data, `onix_pedidos_${(new Date()).toISOString().slice(0,10)}.json`);
      });

      document.getElementById('odx-open-admin').addEventListener('click', ()=>{
        window.open('admin.html', '_blank');
      });

      // override modal confirm to perform order creation
      const confirmBtn = document.getElementById('odx-modal-confirm');
      confirmBtn.onclick = async function(){
        await confirmOrderFromModal(subtotal, totalWeight);
      };
    }, 50);
  }

  // Confirm order: valida campos, calcula frete/taxa, salva e abre WhatsApp; fecha modal ao final
  async function confirmOrderFromModal(subtotal, totalWeight){
    const name = (document.getElementById('odx-customer-name') || {}).value || '';
    const phone = (document.getElementById('odx-customer-phone') || {}).value || '';
    const cepRaw = ((document.getElementById('odx-cep') || {}).value || '').replace(/\D/g,'');
    const payment = (document.getElementById('odx-payment') || {}).value || 'pix';

    if(!name.trim()){ showToast('Informe o nome do cliente.'); return; }

    const cart = getCart();
    const ids = Object.keys(cart);
    if(ids.length === 0){ showToast('Carrinho vazio.'); closeModal(); return; }

    // checar estoque
    for(const id of ids){
      const qty = cart[id].qty;
      const p = products.find(x=>x.id===id);
      if(!p){ showToast('Produto inválido no carrinho.'); return; }
      if(qty > p.stock){ showToast(`Estoque insuficiente para ${p.title}.`); return; }
    }

    // validar CEP (tentar ViaCEP se preenchido)
    let cepValid = false;
    if(cepRaw && cepRaw.length === 8){
      cepValid = await validateCep(cepRaw);
      if(!cepValid){
        if(!confirm('CEP não encontrado via ViaCEP. Deseja prosseguir com estimativa de frete?')) return;
      }
    }

    // calc frete + taxa
    const shipping = calculateShipping(cepRaw, totalWeight, subtotal);
    let fee = 0;
    let feeLabel = '';
    if(payment === 'pix'){ fee = 0; feeLabel = 'Pix (sem taxa)'; }
    else if(payment === 'boleto'){ fee = +(subtotal * 0.01).toFixed(2); feeLabel = 'Boleto (1%)'; }
    else if(payment === 'card'){ fee = +(subtotal * 0.025).toFixed(2); feeLabel = 'Cartão (2.5%)'; }
    const total = Math.round((subtotal + shipping + fee) * 100) / 100;

    // preparar items e decrementar estoque localmente
    const orderItems = [];
    for(const id of ids){
      const qty = cart[id].qty;
      const p = products.find(x=>x.id===id);
      orderItems.push({ sku: p.sku, title: p.title, qty, price: p.price, subtotal: +(p.price * qty) });
      p.stock = Math.max(0, p.stock - qty); // decrementar no catálogo simulado
    }

    const orderId = 'ODX' + Date.now();

    const order = {
      id: orderId,
      date: new Date().toISOString(),
      customer: { name: name.trim(), phone: phone.trim() || null, cep: cepRaw || null },
      items: orderItems,
      subtotal: +subtotal,
      shipping: shipping,
      fee: fee,
      paymentMethod: payment,
      total: total,
      status: 'pending' // status inicial
    };

    saveOrder(order);
    clearCart();
    renderCart();
    closeModal();
    showToast('Pedido simulado criado com sucesso — abrindo WhatsApp...');

    // montar mensagem WhatsApp
    const lines = [
      `🧾 *Novo pedido - Ônix Deluxe*`,
      `Pedido: ${orderId}`,
      `Cliente: ${order.customer.name}${order.customer.phone ? ' • ' + order.customer.phone : ''}`,
      `Pagamento: ${feeLabel}`,
      `Subtotal: ${formatBRL(order.subtotal)}`,
      order.shipping === 0 ? 'Frete: Grátis' : `Frete: ${formatBRL(order.shipping)}`,
      order.fee > 0 ? `Taxa: ${formatBRL(order.fee)}` : null,
      `*Total: ${formatBRL(order.total)}*`,
      '',
      'Itens:'
    ].filter(Boolean);
    order.items.forEach(it => lines.push(`${it.qty}x ${it.title} (${it.sku}) — ${formatBRL(it.price)} cada`));

    const waText = encodeURIComponent(lines.join('\n'));
    const waUrl = order.customer.phone ? `https://wa.me/${order.customer.phone}?text=${waText}` : `https://wa.me/?text=${waText}`;
    window.open(waUrl, '_blank');
  }

  // toast simples
  function showToast(msg, ms=2500){
    let toast = document.getElementById('odx-toast');
    if(!toast){
      toast = document.createElement('div'); toast.id='odx-toast';
      toast.style.position='fixed'; toast.style.right='18px'; toast.style.bottom='18px';
      toast.style.background='rgba(0,0,0,0.6)'; toast.style.color='#fff'; toast.style.padding='12px 16px';
      toast.style.borderRadius='12px'; toast.style.zIndex='99999'; toast.style.backdropFilter='blur(4px)';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(()=>{ toast.style.opacity = '0'; }, ms);
  }

  // download helper
  function downloadBlob(text, filename='data.json'){
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // Event delegation for add buttons
  function setupAddButtons(){
    document.body.addEventListener('click', function(e){
      const btn = e.target.closest('button[data-add]');
      if(btn){
        const id = btn.getAttribute('data-add');
        addToCart(id, 1);
      }
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function(){
    updateMiniCounts();
    const y = new Date().getFullYear();
    ['year','year-2','year-3','year-4'].forEach(id=>{ const el = document.getElementById(id); if(el) el.textContent = y; });

    renderHome(); renderProductsGrid(); renderProductView(); renderCart(); setupAddButtons();

    // legacy hooks
    const clearBtn = document.getElementById('clear-cart');
    if(clearBtn) clearBtn.addEventListener('click', ()=> { clearCart(); renderCart(); });

    // If someone calls the global function to export orders
    window.onixExportOrders = function(){
      const data = localStorage.getItem(ordersKey) || '[]';
      downloadBlob(data, `onix_pedidos_${(new Date()).toISOString().slice(0,10)}.json`);
    };
  });

  // expose some helpers for admin page
  window.onixShared = {
    ordersKey,
    getOrders: ()=> JSON.parse(localStorage.getItem(ordersKey) || '[]'),
    setOrders: (list)=> localStorage.setItem(ordersKey, JSON.stringify(list))
  };

})();

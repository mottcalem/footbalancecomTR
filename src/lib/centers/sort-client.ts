export const SORT_CLIENT = String.raw`
(() => {
  const form = document.getElementById('center-order');
  if (!form) return;
  const body = document.getElementById('center-rows');
  const save = form.querySelector('button[type="submit"]');
  const reset = document.getElementById('reset-order');
  const status = document.getElementById('order-status');
  const original = JSON.parse(form.elements.original.value);
  const ids = () => Array.from(body.rows, row => row.dataset.id);
  let dirty = false, busy = false, drag = null;
  function changed() {
    dirty = JSON.stringify(ids()) !== JSON.stringify(original);
    save.disabled = !dirty || busy;
    reset.hidden = !dirty;
    status.textContent = dirty ? 'Sıralama değişti. Kaydetmek için “Sıralamayı kaydet” düğmesine basın.' : '';
  }
  body.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-sort-handle]');
    if (!handle || busy || event.button !== 0) return;
    const row = handle.closest('tr');
    drag = { row, pointer: event.pointerId, start: event.clientY, moved: false };
    handle.focus();
    handle.setPointerCapture(event.pointerId);
  });
  document.addEventListener('pointermove', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    if (Math.abs(event.clientY-drag.start) < 5 && !drag.moved) return;
    drag.moved = true;
    drag.row.classList.add('sorting');
    const target = document.elementFromPoint(event.clientX,event.clientY)?.closest('#center-rows tr');
    if (!target || target === drag.row) return;
    const rect = target.getBoundingClientRect();
    body.insertBefore(drag.row,event.clientY < rect.top+rect.height/2 ? target : target.nextSibling);
    drag.row.querySelector('[data-sort-handle]').setPointerCapture(event.pointerId);
  });
  function end(event) {
    if (!drag || drag.pointer !== event.pointerId) return;
    drag.row.classList.remove('sorting');
    drag = null;
    changed();
  }
  document.addEventListener('pointerup',end);
  document.addEventListener('pointercancel',end);
  body.addEventListener('keydown',event => {
    const handle = event.target.closest('[data-sort-handle]');
    if (!handle || busy || !['ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const row = handle.closest('tr');
    if (event.key === 'ArrowUp' && row.previousElementSibling) body.insertBefore(row,row.previousElementSibling);
    if (event.key === 'ArrowDown' && row.nextElementSibling) body.insertBefore(row.nextElementSibling,row);
    handle.focus(); changed();
  });
  reset.addEventListener('click',() => { dirty=false; location.reload(); });
  window.addEventListener('beforeunload',event => { if(dirty) { event.preventDefault(); event.returnValue=''; } });
  form.addEventListener('submit',async event => {
    event.preventDefault();
    if (!dirty || busy) return;
    busy=true; save.disabled=true; reset.disabled=true;
    body.querySelectorAll('[data-sort-handle]').forEach(handle => {handle.disabled=true;});
    status.textContent='Sıralama kaydediliyor…';
    try {
      const data = new URLSearchParams(new FormData(form));
      data.set('order',JSON.stringify(ids()));
      const response=await fetch('/admin/reorder',{method:'POST',body:data});
      if (!response.ok || !(await response.json()).ok) throw new Error(response.status===409 ? 'Liste başka bir işlemde değişti. Sayfayı yenileyip tekrar sıralayın.' : 'Sıralama kaydedilemedi. Oturumunuzu ve bağlantınızı kontrol edin.');
      dirty=false;
      const url=new URL(location.href); url.searchParams.set('reordered','1'); location.replace(url);
    } catch(error) {
      status.textContent=error.message || 'Sıralama kaydedilemedi. Tekrar deneyin.';
      busy=false; save.disabled=false; reset.disabled=false;
      body.querySelectorAll('[data-sort-handle]').forEach(handle => {handle.disabled=false;});
    }
  });
})();
`;

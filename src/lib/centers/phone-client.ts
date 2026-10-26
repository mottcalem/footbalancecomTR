export const PHONE_CLIENT = String.raw`
(() => {
  const list=document.getElementById('phone-inputs');
  const add=document.getElementById('add-phone');
  const template=document.getElementById('phone-template');
  if (!list || !add || !template) return;
  function refresh() {
    const rows=Array.from(list.children);
    rows.forEach((row,index) => {
      row.querySelector('span').textContent='Telefon '+(index+1);
      row.querySelector('button').setAttribute('aria-label','Telefon '+(index+1)+' alanını kaldır');
    });
    add.disabled=rows.length>=5;
  }
  add.addEventListener('click',() => {
    if(list.children.length>=5) return;
    list.append(template.content.cloneNode(true)); refresh();
    list.lastElementChild.querySelector('input').focus();
  });
  list.addEventListener('click',event => {
    const remove=event.target.closest('[data-remove-phone]');
    if(!remove) return;
    const row=remove.closest('.phone-row');
    if(list.children.length===1) row.querySelector('input').value='';
    else row.remove();
    refresh();
  });
  refresh();
})();
`;

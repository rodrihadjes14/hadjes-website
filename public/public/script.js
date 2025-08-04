document.addEventListener("DOMContentLoaded", () => {
  const radioButtons = document.querySelectorAll('input[name="operation"]');
  const typeSelect = document.querySelector('.property-type');
  const input = document.querySelector('.search-input');
  const button = document.querySelector('.search-button');

  const routes = [
    { op:'venta', type:'departamento', keyword:'palermo', page:'palermo.html' },
    { op:'alquiler', type:'casa', keyword:'vicente lopez', page:'vicente-lopez.html' },
    { op:'venta', type:'comercial', keyword:'mar del plata', page:'mar-del-plata.html' }
  ];

  function doSearch() {
    const op = Array.from(radioButtons).find(r => r.checked).value;
    const type = typeSelect.value;
    const kw = input.value.toLowerCase().trim();

    const found = routes.find(r =>
      r.op === op &&
      (type === '' || r.type === type) &&
      (kw === '' || r.keyword.includes(kw))
    );
    if (found) window.location.href = found.page;
    else alert("No se encontraron propiedades que coincidan con tu búsqueda.");
  }

  button.addEventListener('click', doSearch);
  input.addEventListener('keyup', e => e.key === 'Enter' && doSearch());
});

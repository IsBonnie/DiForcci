const API_URL = 'api/remessas.php';
const modal = document.querySelector('#shipment-modal');
const form = document.querySelector('#shipment-form');
const tableBody = document.querySelector('#shipments-table tbody');
const modalTitle = document.querySelector('#modal-title');
const submitButton = document.querySelector('#submit-button');
const detailsTitle = document.querySelector('#products-title');
const detailStatus = document.querySelector('#detail-status');
const details = document.querySelector('#empty-state');
const activeCount = document.querySelector('#active-count');
let shipments = [];
let lastFocusedElement;

function showMessage(message, type = 'success') {
  const toast = document.querySelector('#toast');
  toast.textContent = message; toast.className = `toast ${type} show`;
  clearTimeout(showMessage.timer); showMessage.timer = setTimeout(() => toast.classList.remove('show'), 4000);
}

async function apiRequest(options = {}) {
  const response = await fetch(API_URL, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, ...options });
  let result; try { result = await response.json(); } catch { throw new Error('A API retornou uma resposta inválida.'); }
  if (!response.ok || !result.sucesso) throw new Error(result.mensagem || 'Não foi possível concluir a operação.');
  return result;
}

function formatDate(date) {
  return date ? new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : '—';
}

function addTextCell(row, text, strong = false) {
  const cell = document.createElement('td');
  if (strong) { const element = document.createElement('strong'); element.textContent = text; cell.append(element); } else cell.textContent = text;
  row.append(cell);
}

function renderTable() {
  tableBody.replaceChildren(); activeCount.textContent = `${shipments.filter(item => item.status === 'Ativa').length} ativas`;
  if (!shipments.length) {
    const row = document.createElement('tr'); const cell = document.createElement('td'); cell.colSpan = 6; cell.className = 'loading-cell'; cell.textContent = 'Nenhuma remessa cadastrada.'; row.append(cell); tableBody.append(row); return;
  }
  shipments.forEach(shipment => {
    const row = document.createElement('tr'); row.className = 'selectable'; row.tabIndex = 0; row.dataset.id = shipment.id; row.setAttribute('aria-selected', 'false');
    addTextCell(row, `#${shipment.numero}`, true); addTextCell(row, formatDate(shipment.data_recebimento)); addTextCell(row, `${Number(shipment.quantidade_itens).toLocaleString('pt-BR')} itens`); addTextCell(row, shipment.fornecedor);
    const statusCell = document.createElement('td'); const badge = document.createElement('span'); badge.className = `status ${shipment.status === 'Ativa' ? 'green' : 'amber'}`; badge.textContent = shipment.status; statusCell.append(badge); row.append(statusCell);
    const actions = document.createElement('td'); actions.className = 'row-actions';
    for (const [action, label] of [['edit', 'Editar'], ['delete', 'Excluir']]) { const button = document.createElement('button'); button.type = 'button'; button.className = `action-button ${action}`; button.dataset.action = action; button.textContent = label; actions.append(button); }
    row.append(actions); tableBody.append(row);
  });
}

async function loadShipments() {
  try { const result = await apiRequest(); shipments = result.dados || []; renderTable(); }
  catch (error) { tableBody.innerHTML = '<tr><td colspan="6" class="loading-cell error-text">Não foi possível carregar as remessas.</td></tr>'; activeCount.textContent = 'Erro ao carregar'; showMessage(error.message, 'error'); }
}

function selectShipment(row) {
  document.querySelectorAll('.selectable').forEach(item => { const selected = item === row; item.classList.toggle('selected', selected); item.setAttribute('aria-selected', String(selected)); });
  const shipment = shipments.find(item => String(item.id) === row.dataset.id); if (!shipment) return;
  detailsTitle.textContent = `Remessa #${shipment.numero}`; detailStatus.hidden = false; detailStatus.textContent = shipment.status; detailStatus.className = `status ${shipment.status === 'Ativa' ? 'green' : 'amber'}`;
  details.textContent = `${shipment.fornecedor} · recebida em ${formatDate(shipment.data_recebimento)} · ${Number(shipment.quantidade_itens).toLocaleString('pt-BR')} produtos.`;
}

function openModal(shipment = null) {
  lastFocusedElement = document.activeElement; form.reset(); form.elements.id.value = shipment?.id || ''; form.elements.numero.value = shipment?.numero || ''; form.elements.date.value = shipment?.data_recebimento || new Date().toISOString().slice(0, 10); form.elements.fornecedor.value = shipment?.fornecedor || ''; form.elements.quantidade_itens.value = shipment?.quantidade_itens ?? ''; form.elements.status.value = shipment?.status || 'Ativa';
  modalTitle.textContent = shipment ? 'Editar remessa' : 'Nova remessa'; submitButton.textContent = shipment ? 'Salvar alterações' : 'Salvar remessa'; modal.hidden = false; document.body.style.overflow = 'hidden'; setTimeout(() => form.elements.numero.focus(), 0);
}
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; if (lastFocusedElement) lastFocusedElement.focus(); }

async function deleteShipment(shipment) {
  if (!confirm(`Deseja realmente excluir a remessa #${shipment.numero}? Esta ação não pode ser desfeita.`)) return;
  try { const result = await apiRequest({ method: 'DELETE', body: JSON.stringify({ id: shipment.id }) }); shipments = shipments.filter(item => String(item.id) !== String(shipment.id)); renderTable(); detailsTitle.textContent = 'Detalhes da remessa'; detailStatus.hidden = true; details.textContent = 'Selecione uma remessa para visualizar seus dados.'; showMessage(result.mensagem); }
  catch (error) { showMessage(error.message, 'error'); }
}

document.querySelector('#shipments-table').addEventListener('click', event => {
  const button = event.target.closest('[data-action]'); const row = event.target.closest('.selectable'); if (!row) return;
  const shipment = shipments.find(item => String(item.id) === row.dataset.id); if (!shipment) return;
  if (!button) return selectShipment(row); event.stopPropagation();
  if (button.dataset.action === 'edit') openModal(shipment); else deleteShipment(shipment);
});
document.querySelector('#shipments-table').addEventListener('keydown', event => { const row = event.target.closest('.selectable'); if (row && event.target === row && ['Enter', ' '].includes(event.key)) { event.preventDefault(); selectShipment(row); } });

form.addEventListener('submit', async event => {
  event.preventDefault(); submitButton.disabled = true; submitButton.textContent = 'Salvando...'; const data = Object.fromEntries(new FormData(form));
  const payload = { numero: data.numero.trim(), fornecedor: data.fornecedor.trim(), data_recebimento: data.date, quantidade_itens: Number(data.quantidade_itens), status: data.status }; if (data.id) payload.id = Number(data.id);
  try { const result = await apiRequest({ method: data.id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); closeModal(); showMessage(result.mensagem); await loadShipments(); }
  catch (error) { showMessage(error.message, 'error'); }
  finally { submitButton.disabled = false; submitButton.textContent = data.id ? 'Salvar alterações' : 'Salvar remessa'; }
});

document.querySelector('#new-shipment').addEventListener('click', () => openModal()); document.querySelector('#close-modal').addEventListener('click', closeModal); document.querySelector('#cancel-modal').addEventListener('click', closeModal); modal.addEventListener('click', event => { if (event.target === modal) closeModal(); }); document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
const sidebar = document.querySelector('#sidebar'); const overlay = document.querySelector('#sidebar-overlay'); const menuButton = document.querySelector('#mobile-menu');
function toggleMenu(open) { sidebar.classList.toggle('open', open); overlay.classList.toggle('show', open); menuButton.setAttribute('aria-expanded', String(open)); }
menuButton.addEventListener('click', () => toggleMenu(!sidebar.classList.contains('open'))); overlay.addEventListener('click', () => toggleMenu(false));
loadShipments();

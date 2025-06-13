/**
 * @file Lógica da página 'Meus Horários', para Fisioterapeutas.
 * @description Gerencia a grade de trabalho semanal, incluindo turnos pré-definidos,
 * e a geração da agenda mensal de horários disponíveis.
 */
let usuarioLogado;

/**
 * Ponto de entrada do script. Roda quando o HTML da página é carregado.
 */
document.addEventListener('DOMContentLoaded', function() {
    usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado || !usuarioLogado.tipoUsuario.includes('FISIOTERAPEUTA')) {
        alert('Acesso negado. Esta página é apenas para Fisioterapeutas.');
        window.location.href = '../../pages/dashboard/dashboard.html';
        return;
    }

    document.getElementById('userName').textContent = usuarioLogado.nome;
    document.getElementById('welcomeHeader').textContent = `Meus Horários de Trabalho - ${usuarioLogado.nome}`;
    renderizarSidebar(usuarioLogado.tipoUsuario);
    carregarHorarios();

    const hoje = new Date();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const ano = hoje.getFullYear();
    document.getElementById('mesAnoInput').value = `${ano}-${mes}`;

    document.getElementById('formNovoHorario').addEventListener('submit', adicionarHorario);
    document.getElementById('gerarAgendaBtn').addEventListener('click', gerarAgenda);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });

    // BLOCO ADICIONADO: Listeners para os botões de turno.
    document.getElementById('turnoManhaBtn').addEventListener('click', () => preencherTurno('08:00', '12:00'));
    document.getElementById('turnoTardeBtn').addEventListener('click', () => preencherTurno('13:00', '18:00'));
    document.getElementById('turnoIntegralBtn').addEventListener('click', () => preencherTurno('08:00', '18:00'));
});

/**
 * (FUNÇÃO NOVA) Preenche os campos de hora com base no turno clicado.
 * @param {string} inicio - A hora de início do turno (ex: "08:00").
 * @param {string} fim - A hora de fim do turno (ex: "12:00").
 */
function preencherTurno(inicio, fim) {
    document.getElementById('horaInicio').value = inicio;
    document.getElementById('horaFim').value = fim;
}

/**
 * Renderiza os links do menu lateral, marcando 'Meus Horários' como a página ativa.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = '';
    if (tipoUsuario.includes('ADMIN')) {
        // ... (links de admin, se necessário)
    }
    if (tipoUsuario.includes('FISIOTERAPEUTA')) {
        sidebarContainer.innerHTML += `<li class="nav-item active"><a class="nav-link" href="meus-horarios.html"><i class="fas fa-fw fa-clock"></i><span>Meus Horários</span></a></li>`;
    }
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Cria um elemento <li> para a lista de horários.
 */
function criarElementoHorario(horario) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.id = `horario-${horario.id}`;
    li.innerHTML = `
        <span><strong>${horario.nomeDiaSemana}:</strong> das ${horario.horaInicio.substring(0,5)} às ${horario.horaFim.substring(0,5)}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="removerHorario(${horario.id})">&times;</button>
    `;
    return li;
}

/**
 * Busca e exibe a grade de trabalho semanal do fisioterapeuta logado.
 */
async function carregarHorarios() {
    const listaEl = document.getElementById('listaHorarios');
    const loadingEl = document.getElementById('loading');
    loadingEl.style.display = 'block';
    listaEl.innerHTML = '';
    try {
        const response = await fetch(`/horarios-trabalho/fisioterapeuta/${usuarioLogado.usuarioId}`);
        if (!response.ok) throw new Error('Falha ao carregar horários.');
        const horarios = await response.json();
        if (horarios.length === 0) {
            listaEl.innerHTML = '<li class="list-group-item text-muted" id="horario-placeholder">Nenhum horário de trabalho definido.</li>';
        } else {
            horarios.sort((a, b) => a.diaDaSemana.localeCompare(b.diaDaSemana) || a.horaInicio.localeCompare(b.horaInicio));
            horarios.forEach(h => listaEl.appendChild(criarElementoHorario(h)));
        }
    } catch (error) {
        listaEl.innerHTML = `<li class="list-group-item text-danger">${error.message}</li>`;
    } finally {
        loadingEl.style.display = 'none';
    }
}

/**
 * Adiciona um novo horário na grade semanal.
 */
async function adicionarHorario(event) {
    event.preventDefault();
    const resultadoDiv = document.getElementById('resultadoAdicao');
    const requestBody = {
        idFisioterapeuta: usuarioLogado.usuarioId,
        diaDaSemana: document.getElementById('diaDaSemana').value,
        horaInicio: document.getElementById('horaInicio').value,
        horaFim: document.getElementById('horaFim').value,
    };
    if (!requestBody.diaDaSemana) {
        alert('Por favor, selecione um dia da semana.');
        return;
    }
    resultadoDiv.className = '';
    resultadoDiv.textContent = '';
    try {
        const response = await fetch('/horarios-trabalho', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if(!response.ok) {
            // Tenta ler a mensagem de erro da API
            const erro = await response.json();
            throw new Error(erro.message || 'Não foi possível adicionar o horário.');
        }
        await carregarHorarios();
        document.getElementById('formNovoHorario').reset();
        resultadoDiv.className = 'alert alert-success mt-3';
        resultadoDiv.textContent = 'Horário adicionado com sucesso!';
        setTimeout(() => resultadoDiv.innerHTML = '', 3000);
    } catch (error) {
        resultadoDiv.className = 'alert alert-danger mt-3';
        resultadoDiv.textContent = error.message;
    }
}

/**
 * Remove um horário da grade semanal.
 */
async function removerHorario(id) {
    if (!confirm('Tem certeza que deseja remover este horário da sua grade?')) return;
    try {
        const response = await fetch(`/horarios-trabalho/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao remover o horário.');
        document.getElementById(`horario-${id}`).remove();
        const listaEl = document.getElementById('listaHorarios');
        if (listaEl.children.length === 0) {
            listaEl.innerHTML = '<li class="list-group-item text-muted" id="horario-placeholder">Nenhum horário de trabalho definido.</li>';
        }
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Envia o comando para o backend gerar a agenda disponível para um mês.
 */
async function gerarAgenda() {
    if (!confirm('Isso irá apagar e recriar toda a sua agenda para o mês selecionado. Deseja continuar?')) return;
    const mesAno = document.getElementById('mesAnoInput').value;
    const [ano, mes] = mesAno.split('-');
    const resultadoDiv = document.getElementById('resultadoGeracao');
    const btn = document.getElementById('gerarAgendaBtn');
    btn.disabled = true;
    resultadoDiv.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Gerando...';
    resultadoDiv.className = 'alert alert-info mt-3';
    try {
        const response = await fetch(`/horarios-trabalho/gerar-disponibilidade?idFisioterapeuta=${usuarioLogado.usuarioId}&ano=${ano}&mes=${mes}`, {
            method: 'POST'
        });
        if (!response.ok) {
            const erro = await response.text();
            throw new Error(erro || 'Falha ao gerar agenda.');
        }
        resultadoDiv.className = 'alert alert-success mt-3';
        resultadoDiv.textContent = 'Agenda gerada com sucesso para ' + mesAno.split('-').reverse().join('/') + '!';
    } catch (error) {
        resultadoDiv.className = 'alert alert-danger mt-3';
        resultadoDiv.textContent = error.message;
    } finally {
        btn.disabled = false;
    }
}
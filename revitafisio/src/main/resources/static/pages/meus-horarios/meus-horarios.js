/**
 * @file Lógica da página 'Meus Horários', para Fisioterapeutas.
 * @description Gerencia a grade de trabalho semanal recorrente e a geração
 * da agenda mensal de horários disponíveis.
 */

// Variável global para armazenar os dados do usuário logado
let usuarioLogado;

/**
 * Ponto de entrada do script. Roda quando o HTML da página é carregado.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Pega os dados do usuário do localStorage
    usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Proteção de Rota: Apenas Fisioterapeutas podem acessar esta página
    if (!usuarioLogado || !usuarioLogado.tipoUsuario.includes('FISIOTERAPEUTA')) {
        alert('Acesso negado. Esta página é apenas para Fisioterapeutas.');
        window.location.href = '../../pages/dashboard/dashboard.html';
        return;
    }

    // Preenche os elementos do template
    document.getElementById('userName').textContent = usuarioLogado.nome;
    document.getElementById('welcomeHeader').textContent = `Meus Horários de Trabalho - ${usuarioLogado.nome}`;
    renderizarSidebar(usuarioLogado.tipoUsuario);

    // Carrega a grade de horários do fisioterapeuta
    carregarHorarios();

    // Define o valor padrão do seletor de mês/ano para o mês atual
    const hoje = new Date();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const ano = hoje.getFullYear();
    document.getElementById('mesAnoInput').value = `${ano}-${mes}`;

    // Adiciona os "ouvintes" de eventos aos formulários e botões
    document.getElementById('formNovoHorario').addEventListener('submit', adicionarHorario);
    document.getElementById('gerarAgendaBtn').addEventListener('click', gerarAgenda);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });
});

/**
 * Renderiza os links do menu lateral, marcando 'Meus Horários' como a página ativa.
 * @param {string} tipoUsuario - Os cargos do usuário logado.
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
 * @param {object} horario - O objeto de horário vindo da API.
 * @returns {HTMLLIElement} O elemento da lista pronto para ser adicionado ao DOM.
 */
function criarElementoHorario(horario) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.id = `horario-${horario.id}`; // ID para facilitar a remoção posterior
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
            // Ordena os horários por dia da semana e hora
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
 * @param {Event} event - O evento de submissão do formulário.
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
        if(!response.ok) throw new Error('Não foi possível adicionar o horário.');

        // Em vez de recarregar a página, apenas atualiza a lista
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
 * @param {number} id - O ID do horário a ser removido.
 */
async function removerHorario(id) {
    if (!confirm('Tem certeza que deseja remover este horário da sua grade?')) return;
    try {
        const response = await fetch(`/horarios-trabalho/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao remover o horário.');

        // Remove dinamicamente o item da lista na tela
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
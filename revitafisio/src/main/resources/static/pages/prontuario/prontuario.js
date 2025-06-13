/**
 * @file Lógica completa para a página de prontuário do paciente.
 */

// Variáveis globais para armazenar dados da página
let pacienteAtual = {};
let usuarioLogado;

// Ponto de entrada do script
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pacienteId = urlParams.get('pacienteId');
    usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!pacienteId || !usuarioLogado) {
        alert('Acesso inválido ou sessão expirada.');
        window.location.href = '../../login.html';
        return;
    }

    // Configura elementos visuais do template
    document.getElementById('userName').textContent = usuarioLogado.nome;
    renderizarSidebar(usuarioLogado.tipoUsuario);
    configurarVisibilidadePorPerfil();

    // Carrega todos os dados necessários da API
    carregarDadosPaciente(pacienteId);
    carregarEvolucoes(pacienteId);
    carregarStatusAvaliacoes(pacienteId);

    // Adiciona eventos aos botões
    document.getElementById('logoutButton').addEventListener('click', () => { localStorage.clear(); window.location.href = '../../login.html'; });
    document.getElementById('formNovaEvolucao').addEventListener('submit', (e) => salvarEvolucao(e, pacienteId));
});

// =======================================================
// RENDERIZAÇÃO E CONTROLE DE VISIBILIDADE
// =======================================================

function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = ''; // Limpa o menu
    if (tipoUsuario.includes('ADMIN')) {
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../funcionarios/funcionarios.html"><i class="fas fa-fw fa-users-cog"></i><span>Gerenciar Equipe</span></a></li>`;
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../relatorios/relatorios.html"><i class="fas fa-fw fa-chart-bar"></i><span>Relatórios</span></a></li>`;
    }
    if (tipoUsuario.includes('FISIOTERAPEUTA')) {
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../meus-horarios/meus-horarios.html"><i class="fas fa-fw fa-clock"></i><span>Meus Horários</span></a></li>`;
    }
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

function configurarVisibilidadePorPerfil() {
    const isFisio = usuarioLogado.tipoUsuario.includes('FISIOTERAPEUTA');
    const isAdmin = usuarioLogado.tipoUsuario.includes('ADMIN');

    document.getElementById('card-evolucao-form').style.display = isFisio ? 'block' : 'none';
    document.getElementById('card-avaliacoes').style.display = isFisio ? 'block' : 'none';
    document.getElementById('botoes-edicao-paciente').style.display = isAdmin ? 'block' : 'none';
}

function preencherDadosNaTela(paciente) {
    document.getElementById('nomePacienteView').textContent = `Prontuário de: ${paciente.nome}`;

    document.getElementById('viewMode').innerHTML = `
        <p class="mb-1"><strong>CPF:</strong> ${paciente.cpf}</p>
        <p class="mb-1"><strong>Data de Nascimento:</strong> ${new Date(paciente.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
        <p class="mb-0"><strong>Status:</strong> <span class="badge ${paciente.ativo ? 'bg-success' : 'bg-danger'}">${paciente.ativo ? 'Ativo' : 'Inativo'}</span></p>
    `;
    document.getElementById('editMode').innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3"><label for="nomeInput" class="form-label">Nome</label><input type="text" class="form-control" id="nomeInput" value="${paciente.nome}"></div>
            <div class="col-md-6 mb-3"><label for="nascimentoInput" class="form-label">Data de Nascimento</label><input type="date" class="form-control" id="nascimentoInput" value="${paciente.dataNascimento}"></div>
        </div>
    `;
    document.getElementById('botoes-edicao-paciente').innerHTML = `
        <button class="btn btn-sm btn-secondary" id="editButton"><i class="fas fa-edit"></i> Editar</button>
        <button class="btn btn-sm btn-success d-none" id="saveButton"><i class="fas fa-save"></i> Salvar</button>
        <button class="btn btn-sm btn-light d-none" id="cancelButton">Cancelar</button>
        <button class="btn btn-sm btn-danger ${!paciente.ativo ? 'd-none' : ''}" id="inativarBtn"><i class="fas fa-trash"></i> Inativar</button>
        <button class="btn btn-sm btn-success ${paciente.ativo ? 'd-none' : ''}" id="ativarBtn">Reativar</button>
    `;

    // Adiciona os listeners aos botões que foram recriados
    document.getElementById('editButton').addEventListener('click', () => toggleEditMode(true));
    document.getElementById('saveButton').addEventListener('click', salvarAlteracoes);
    document.getElementById('cancelButton').addEventListener('click', () => toggleEditMode(false));
    document.getElementById('inativarBtn').addEventListener('click', () => inativarPaciente(paciente.id));
    document.getElementById('ativarBtn').addEventListener('click', () => ativarPaciente(paciente.id));
}

function toggleEditMode(isEditing) {
    document.getElementById('viewMode').classList.toggle('d-none', isEditing);
    document.getElementById('editMode').classList.toggle('d-none', !isEditing);
    document.getElementById('editButton').classList.toggle('d-none', isEditing);
    document.getElementById('saveButton').classList.toggle('d-none', !isEditing);
    document.getElementById('cancelButton').classList.toggle('d-none', !isEditing);
}

// =======================================================
// FUNÇÕES DE INTERAÇÃO COM API (FETCH)
// =======================================================

async function carregarDadosPaciente(id) {
    try {
        const response = await fetch(`/pacientes/${id}`);
        if (!response.ok) throw new Error('Paciente não encontrado.');
        pacienteAtual = await response.json();

        preencherDadosNaTela(pacienteAtual);

        document.getElementById('loading').classList.add('d-none');
        document.getElementById('patient-details').classList.remove('d-none');
    } catch (error) {
        alert(error.message);
        window.location.href = '../dashboard/dashboard.html';
    }
}

async function salvarAlteracoes() {
    const dadosParaAtualizar = {
        nome: document.getElementById('nomeInput').value,
        dataNascimento: document.getElementById('nascimentoInput').value
    };
    try {
        const response = await fetch(`/pacientes/${pacienteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaAtualizar)
        });
        if (!response.ok) throw new Error('Falha ao atualizar o paciente.');

        pacienteAtual = await response.json();
        preencherDadosNaTela(pacienteAtual);
        toggleEditMode(false);
        alert('Paciente atualizado com sucesso!');
    } catch (error) { alert(error.message); }
}

async function inativarPaciente(id) {
    if (!confirm('Tem certeza?')) return;
    try {
        await fetch(`/pacientes/${id}`, { method: 'DELETE' });
        pacienteAtual.ativo = false;
        preencherDadosNaTela(pacienteAtual);
    } catch (error) { alert(error.message); }
}

async function ativarPaciente(id) {
    if (!confirm('Tem certeza?')) return;
    try {
        await fetch(`/pacientes/${id}/ativar`, { method: 'PATCH' });
        pacienteAtual.ativo = true;
        preencherDadosNaTela(pacienteAtual);
    } catch (error) { alert(error.message); }
}

async function carregarStatusAvaliacoes(idPaciente) {
    const linkOrto = `../avaliacao-ortopedia/avaliacao-ortopedia.html?pacienteId=${idPaciente}`;
    const linkRpg = `../avaliacao-rpg/avaliacao-rpg.html?pacienteId=${idPaciente}`;
    const containerOrto = document.getElementById('container-avaliacao-ortopedia');
    const containerRpg = document.getElementById('container-avaliacao-rpg');

    // Ortopedia
    try {
        const resOrto = await fetch(`/avaliacoes/ortopedia/paciente/${idPaciente}`);
        containerOrto.innerHTML = resOrto.ok ? `<span>Avaliação de Ortopedia</span><a href="${linkOrto}" class="btn btn-secondary btn-sm">Ver / Editar</a>` : `<span>Avaliação de Ortopedia</span><a href="${linkOrto}" class="btn btn-outline-primary btn-sm">Realizar Avaliação</a>`;
    } catch (e) { containerOrto.innerHTML = '<span>Avaliação de Ortopedia</span> <span class="text-danger small">Erro ao carregar</span>'; }

    // RPG
    try {
        const resRpg = await fetch(`/avaliacoes/rpg/paciente/${idPaciente}`);
        containerRpg.innerHTML = resRpg.ok ? `<span>Avaliação de RPG</span><a href="${linkRpg}" class="btn btn-secondary btn-sm">Ver / Editar</a>` : `<span>Avaliação de RPG</span><a href="${linkRpg}" class="btn btn-outline-success btn-sm">Realizar Avaliação</a>`;
    } catch (e) { containerRpg.innerHTML = '<span>Avaliação de RPG</span><span class="text-danger small">Erro</span>';}
}

async function carregarEvolucoes(idPaciente) {
    const historicoDiv = document.getElementById('historicoEvolucoes');
    historicoDiv.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm"></div></div>';
    try {
        const response = await fetch(`/evolucoes/paciente/${idPaciente}`);
        const evolucoes = await response.json();
        if (evolucoes.length === 0) {
            historicoDiv.innerHTML = '<p class="text-muted text-center">Nenhuma evolução registrada.</p>';
            return;
        }
        historicoDiv.innerHTML = '';
        evolucoes.forEach(evo => {
            const dataFormatada = new Date(evo.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            historicoDiv.innerHTML += `
                <div class="evolution-entry">
                    <p class="mb-1">${evo.descricao.replace(/\n/g, '<br>')}</p>
                    <small class="text-muted">Por <strong>${evo.nomeFisioterapeuta}</strong> em ${dataFormatada}</small>
                </div>`;
        });
    } catch (error) { historicoDiv.innerHTML = `<p class="text-danger text-center">Falha ao carregar o histórico.</p>`; }
}

async function salvarEvolucao(event, idPaciente) {
    event.preventDefault();
    const resultadoDiv = document.getElementById('resultadoEvolucao');
    const descricao = document.getElementById('descricaoEvolucao').value;
    resultadoDiv.innerHTML = '';

    if (!usuarioLogado || !usuarioLogado.tipoUsuario.includes('FISIOTERAPEUTA')) return;

    const requestBody = { idPaciente, idFisioterapeuta: usuarioLogado.usuarioId, descricao };
    try {
        const response = await fetch('/evolucoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) throw new Error('Falha ao salvar.');

        document.getElementById('descricaoEvolucao').value = '';
        resultadoDiv.innerHTML = '<div class="alert alert-success">Evolução salva!</div>';
        setTimeout(() => resultadoDiv.innerHTML = '', 3000);
        carregarEvolucoes(idPaciente);
    } catch (error) {
        resultadoDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}
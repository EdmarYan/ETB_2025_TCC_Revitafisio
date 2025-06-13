/**
 * @file Lógica para a Ficha de Avaliação de RPG.
 * @description Carrega dados, preenche o formulário e gerencia o salvamento com validação e redirecionamento.
 * @version 2.0 (Correção de Envio de Enums)
 */

const urlParams = new URLSearchParams(window.location.search);
const pacienteId = urlParams.get('pacienteId');
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

/**
 * Ponto de entrada: Roda quando a página carrega.
 */
document.addEventListener('DOMContentLoaded', function() {
    if (!pacienteId || !usuarioLogado || !usuarioLogado.tipoUsuario.includes('FISIOTERAPEUTA')) {
        alert('Acesso inválido ou não autorizado.');
        window.location.href = '../../dashboard.html';
        return;
    }

    document.getElementById('userName').textContent = usuarioLogado.nome;
    document.getElementById('voltarProntuario').href = `../prontuario/prontuario.html?pacienteId=${pacienteId}`;
    renderizarSidebar(usuarioLogado.tipoUsuario);
    document.getElementById('formAvaliacaoRpg').addEventListener('submit', salvar);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });
    carregarDados();
});

/**
 * Renderiza o menu lateral.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Carrega o nome do paciente e os dados da avaliação existente (se houver).
 */
async function carregarDados() {
    try {
        const pacienteResponse = await fetch(`/pacientes/${pacienteId}`);
        const paciente = await pacienteResponse.json();
        document.getElementById('nomePaciente').textContent = paciente.nome;
    } catch(e) {
        document.getElementById('nomePaciente').textContent = "Paciente não encontrado";
    }

    try {
        const avaliacaoResponse = await fetch(`/avaliacoes/rpg/paciente/${pacienteId}`);
        if (avaliacaoResponse.ok) {
            const data = await avaliacaoResponse.json();
            preencherFormulario(data);
        }
    } catch(error) {
        console.error("Erro ao buscar avaliação de RPG:", error);
    }
}

/**
 * Preenche todos os campos do formulário com os dados de uma avaliação existente.
 * @param {object} data - Objeto com os dados da avaliação.
 */
function preencherFormulario(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key) && data[key] !== null) { // Adicionado 'data[key] !== null'
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        }
    }
}

/**
 * Coleta os dados do formulário, envia para a API e redireciona.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function salvar(event) {
    event.preventDefault();
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '<div class="alert alert-info">Salvando...</div>';

    const form = document.getElementById('formAvaliacaoRpg');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // =======================================================
    // LÓGICA DE CORREÇÃO ADICIONADA
    // =======================================================
    // Garante que o valor do checkbox seja booleano (true/false)
    data.ressonancia_magnetica = document.getElementById('ressonancia_magnetica').checked;
    data.raio_x = document.getElementById('raio_x').checked;
    data.tomografia = document.getElementById('tomografia').checked;
    data.uso_medicamentos = document.getElementById('uso_medicamentos').checked;

    // Converte strings vazias de campos <select> para null, para evitar o erro 400 no backend.
    const enumFields = ['grau_dor', 'cabeca', 'ombros', 'maos', 'eias', 'joelhos', 'lombar', 'pelve', 'escapulas'];
    for (const field of enumFields) {
        if (data[field] === "") {
            data[field] = null;
        }
    }
    // =======================================================

    data.idPaciente = parseInt(pacienteId);
    data.idFisioterapeuta = usuarioLogado.usuarioId;

    try {
        const response = await fetch('/avaliacoes/rpg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.message || 'Falha ao salvar avaliação de RPG.');
        }
        resultadoDiv.className = 'alert alert-success';
        resultadoDiv.innerHTML = 'Avaliação salva com sucesso! Redirecionando para o prontuário...';

        setTimeout(() => {
            window.location.href = `../prontuario/prontuario.html?pacienteId=${pacienteId}`;
        }, 2000);

    } catch(error) {
        resultadoDiv.className = 'alert alert-danger';
        resultadoDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}
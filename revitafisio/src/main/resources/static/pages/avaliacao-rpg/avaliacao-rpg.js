/**
 * @file Lógica para a Ficha de Avaliação de RPG.
 * @description Carrega dados do paciente e da avaliação (se existir),
 * preenche o formulário e gerencia o salvamento dos dados.
 */

// Pega IDs da URL e dados do usuário do localStorage
const urlParams = new URLSearchParams(window.location.search);
const pacienteId = urlParams.get('pacienteId');
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

/**
 * Ponto de entrada: Roda quando a página carrega.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Validação de segurança
    if (!pacienteId || !usuarioLogado || !usuarioLogado.tipoUsuario.includes('FISIOTERAPEUTA')) {
        alert('Acesso inválido ou não autorizado.');
        window.location.href = '../../dashboard.html';
        return;
    }

    // Configura elementos do template
    document.getElementById('userName').textContent = usuarioLogado.nome;
    document.getElementById('voltarProntuario').href = `../prontuario/prontuario.html?pacienteId=${pacienteId}`;
    renderizarSidebar(usuarioLogado.tipoUsuario);

    // Adiciona o listener para o formulário
    document.getElementById('formAvaliacaoRpg').addEventListener('submit', salvar);

    // Listener do botão de logout
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });

    // Inicia o carregamento dos dados
    carregarDados();
});

/**
 * Renderiza o menu lateral.
 * @param {string} tipoUsuario - Cargos do usuário logado.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = '';
    // Adicione os links conforme a necessidade, marcando a página atual como 'active' se desejar
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Carrega o nome do paciente e os dados da avaliação existente (se houver).
 */
async function carregarDados() {
    // Busca o nome do paciente para exibir no cabeçalho do card
    try {
        const pacienteResponse = await fetch(`/pacientes/${pacienteId}`);
        const paciente = await pacienteResponse.json();
        document.getElementById('nomePaciente').textContent = paciente.nome;
    } catch(e) {
        document.getElementById('nomePaciente').textContent = "Paciente não encontrado";
    }

    // Busca a avaliação de RPG existente para este paciente
    try {
        const avaliacaoResponse = await fetch(`/avaliacoes/rpg/paciente/${pacienteId}`);
        if (avaliacaoResponse.ok) {
            const data = await avaliacaoResponse.json();
            preencherFormulario(data);
        } else {
            console.log("Nenhuma avaliação de RPG encontrada. Exibindo formulário em branco.");
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
    // Itera sobre todos os dados recebidos da API
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = document.getElementById(key);
            // Se o elemento existe no formulário...
            if (element) {
                // Se for um checkbox, marca como 'checked'
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                    // Para todos os outros (text, textarea, select), define o 'value'
                } else {
                    element.value = data[key];
                }
            }
        }
    }
}

/**
 * Coleta os dados do formulário e envia para a API salvar.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function salvar(event) {
    event.preventDefault(); // Previne o recarregamento da página
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '<div class="alert alert-info">Salvando...</div>';
    resultadoDiv.className = '';

    const form = document.getElementById('formAvaliacaoRpg');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Converte os valores dos checkboxes (que podem ser 'on' ou ausentes) para booleanos
    data.ressonancia_magnetica = document.getElementById('ressonancia_magnetica').checked;
    data.raio_x = document.getElementById('raio_x').checked;
    data.tomografia = document.getElementById('tomografia').checked;
    data.uso_medicamentos = document.getElementById('uso_medicamentos').checked;

    // Adiciona os IDs necessários para a requisição
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
        resultadoDiv.innerHTML = '<div class="alert alert-success">Avaliação salva com sucesso!</div>';
        setTimeout(() => resultadoDiv.innerHTML = '', 4000);
    } catch(error) {
        resultadoDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}
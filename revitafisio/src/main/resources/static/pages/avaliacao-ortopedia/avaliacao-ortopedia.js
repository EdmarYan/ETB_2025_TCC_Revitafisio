/**
 * @file Lógica para a Ficha de Avaliação de Ortopedia.
 * @description Carrega dados do paciente e da avaliação, preenche o formulário e gerencia o salvamento.
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
    document.getElementById('formAvaliacaoOrtopedia').addEventListener('submit', salvar);

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
    // Adicione os links conforme a necessidade
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Carrega o nome do paciente e os dados da avaliação existente, se houver.
 */
async function carregarDados() {
    // Busca o nome do paciente
    try {
        const pacienteResponse = await fetch(`/pacientes/${pacienteId}`);
        const paciente = await pacienteResponse.json();
        document.getElementById('nomePaciente').textContent = paciente.nome;
    } catch(e) {
        document.getElementById('nomePaciente').textContent = "Paciente não encontrado";
    }

    // Busca a avaliação de ortopedia existente para este paciente
    try {
        const avaliacaoResponse = await fetch(`/avaliacoes/ortopedia/paciente/${pacienteId}`);
        if (avaliacaoResponse.ok) {
            const data = await avaliacaoResponse.json();
            // Preenche todos os campos do formulário com os dados retornados
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const element = document.getElementById(key);
                    if (element) {
                        element.value = data[key];
                    }
                }
            }
        }
    } catch(error) {
        console.error("Erro ao buscar avaliação de ortopedia:", error);
    }
}

/**
 * Coleta os dados do formulário e envia para a API salvar.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function salvar(event) {
    event.preventDefault();
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '<div class="alert alert-info">Salvando...</div>';

    const form = document.getElementById('formAvaliacaoOrtopedia');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Adiciona os IDs necessários para a requisição
    data.idPaciente = parseInt(pacienteId);
    data.idFisioterapeuta = usuarioLogado.usuarioId;

    try {
        const response = await fetch('/avaliacoes/ortopedia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.message || 'Falha ao salvar avaliação.');
        }

        resultadoDiv.className = 'alert alert-success';
        resultadoDiv.textContent = 'Avaliação salva com sucesso!';
        setTimeout(() => resultadoDiv.innerHTML = '', 4000);

    } catch(error) {
        resultadoDiv.className = 'alert alert-danger';
        resultadoDiv.textContent = error.message;
    }
}
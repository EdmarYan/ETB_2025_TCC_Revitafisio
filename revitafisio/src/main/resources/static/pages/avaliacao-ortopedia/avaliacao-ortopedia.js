/**
 * @file Lógica para a Ficha de Avaliação de Ortopedia.
 * @description Carrega dados do paciente, da avaliação e gerencia o salvamento com redirecionamento.
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

    document.getElementById('formAvaliacaoOrtopedia').addEventListener('submit', salvar);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });
    carregarDados();
});

/**
 * Renderiza o menu lateral.
 * @param {string} tipoUsuario - Cargos do usuário logado.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Carrega o nome do paciente e os dados da avaliação existente, se houver.
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
        const avaliacaoResponse = await fetch(`/avaliacoes/ortopedia/paciente/${pacienteId}`);
        if (avaliacaoResponse.ok) {
            const data = await avaliacaoResponse.json();
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
 * Coleta os dados do formulário, envia para a API e redireciona em caso de sucesso.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function salvar(event) {
    event.preventDefault();
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '<div class="alert alert-info">Salvando...</div>';

    const form = document.getElementById('formAvaliacaoOrtopedia');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

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
        resultadoDiv.textContent = 'Avaliação salva com sucesso! Redirecionando para o prontuário...';

        // LÓGICA DE REDIRECIONAMENTO ADICIONADA
        setTimeout(() => {
            window.location.href = `../prontuario/prontuario.html?pacienteId=${pacienteId}`;
        }, 2000); // Aguarda 2 segundos para o usuário ler a mensagem

    } catch(error) {
        resultadoDiv.className = 'alert alert-danger';
        resultadoDiv.textContent = error.message;
    }
}
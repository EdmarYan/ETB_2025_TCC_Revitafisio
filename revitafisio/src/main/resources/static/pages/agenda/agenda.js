/**
 * @file Lógica completa para a página de agendamentos (agenda.html)
 * @description Gerencia a exibição da agenda, agendamento de consultas,
 * atualização de status e o sistema de notificações.
 */

// =================================================================================
// VARIÁVEIS GLOBAIS
// =================================================================================
let todosPacientes = []; // Armazena a lista de todos os pacientes para uso no modal
let agendamentoModalInstance; // Guarda a instância do modal do Bootstrap para controle
let horarioSelecionado = {}; // Guarda a hora de início e fim quando um slot livre é clicado

// =================================================================================
// INICIALIZAÇÃO DA PÁGINA
// =================================================================================

/**
 * Evento que roda assim que o conteúdo HTML da página é totalmente carregado.
 * É o ponto de entrada para o nosso script.
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Pega os dados do usuário logado, que foram salvos no localStorage na tela de login
    const dadosUsuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!dadosUsuario) {
        alert('Sessão inválida. Por favor, faça o login novamente.');
        window.location.href = '../../login.html'; // Redireciona se não houver login
        return;
    }

    // Preenche informações do template (nome do usuário e menu lateral)
    document.getElementById('userName').textContent = dadosUsuario.nome;
    renderizarSidebar(dadosUsuario.tipoUsuario);

    // Inicializa o modal do Bootstrap
    agendamentoModalInstance = new bootstrap.Modal(document.getElementById('agendamentoModal'));

    // Carrega dados essenciais da API antes da página ser utilizada
    await Promise.all([
        carregarFisioterapeutas(),
        carregarPacientes()
    ]);

    // Configura a data padrão do seletor para o dia de hoje
    document.getElementById('dataSelect').valueAsDate = new Date();

    // Adiciona os "ouvintes" de eventos aos botões e seletores da página
    document.getElementById('fisioterapeutaSelect').addEventListener('change', handleFisioterapeutaChange);
    document.getElementById('buscarAgendaBtn').addEventListener('click', renderizarAgenda);
    document.getElementById('confirmarAgendamentoBtn').addEventListener('click', confirmarAgendamento);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });

    // Inicia o sistema que verifica por consultas passadas para notificar
    verificarConsultasAtivas();
    setInterval(verificarConsultasAtivas, 60000); // Repete a verificação a cada 1 minuto
});


// =================================================================================
// FUNÇÕES DE RENDERIZAÇÃO E LÓGICA DA INTERFACE (UI)
// =================================================================================

/**
 * Renderiza os links do menu lateral de acordo com o perfil do usuário.
 * @param {string} tipoUsuario - O tipo de usuário logado.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = '';

    if (tipoUsuario.includes('ADMIN')) {
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../funcionarios/funcionarios.html"><i class="fas fa-fw fa-users-cog"></i><span>Gerenciar Equipe</span></a></li>`;
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../relatorios/relatorios.html"><i class="fas fa-fw fa-chart-bar"></i><span>Relatórios</span></a></li>`;
    }
    if (tipoUsuario.includes('FISIOTERAPEUTA')) {
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../meus-horarios/meus-horarios.html"><i class="fas fa-fw fa-clock"></i><span>Meus Horários</span></a></li>`;
    }
    sidebarContainer.innerHTML += `<li class="nav-item active"><a class="nav-link" href="agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Função principal que busca e desenha a grade de horários na tela.
 */
async function renderizarAgenda() {
    const fisioId = document.getElementById('fisioterapeutaSelect').value;
    const data = document.getElementById('dataSelect').value;
    const container = document.getElementById('agenda-container');
    const loadingEl = document.getElementById('loading');

    container.innerHTML = '';
    if (!fisioId) {
        alert('Por favor, selecione um fisioterapeuta.');
        return;
    }
    loadingEl.classList.remove('d-none');

    try {
        // Busca simultaneamente os horários disponíveis e os agendamentos marcados
        const [horariosResponse, agendamentosResponse] = await Promise.all([
            fetch(`/horarios-disponiveis?idFisioterapeuta=${fisioId}&data=${data}`),
            fetch(`/agendamentos?idFisioterapeuta=${fisioId}&inicio=${data}T00:00:00&fim=${data}T23:59:59`)
        ]);

        if (!horariosResponse.ok) throw new Error("Agenda do mês não gerada para este profissional ou data.");

        const horariosTrabalho = await horariosResponse.json();
        const agendamentos = await agendamentosResponse.json();

        if (horariosTrabalho.length === 0 && agendamentos.length === 0) {
            container.innerHTML = '<div class="alert alert-warning col-12">Nenhum horário de trabalho ou consulta para este dia.</div>';
            return;
        }

        // Junta os horários disponíveis e ocupados em uma única estrutura de dados para facilitar a renderização
        const todosOsSlots = new Map();
        horariosTrabalho.forEach(h => todosOsSlots.set(h.horaInicio.substring(0, 5), { tipo: 'disponivel', dados: h }));
        agendamentos.forEach(a => todosOsSlots.set(a.inicio.substring(11, 16), { tipo: 'ocupado', dados: a }));

        const slotsOrdenados = Array.from(todosOsSlots.values()).sort((a, b) => {
            const timeA = a.tipo === 'disponivel' ? a.dados.horaInicio : a.dados.inicio;
            const timeB = b.tipo === 'disponivel' ? b.dados.horaInicio : b.dados.inicio;
            return timeA.localeCompare(timeB);
        });

        container.innerHTML = ''; // Limpa antes de desenhar
        slotsOrdenados.forEach(slot => {
            const slotWrapper = document.createElement('div');
            slotWrapper.className = 'col-lg-4 col-md-6';
            let slotHTML = '';

            if (slot.tipo === 'ocupado') {
                const agendamento = slot.dados;
                const statusClass = `slot-${agendamento.status.toLowerCase().replace('_', '-')}`; // Define a classe CSS para a cor
                slotHTML = `
                    <div class="slot ${statusClass}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${agendamento.inicio.substring(11, 16)}</strong> - ${agendamento.nomePaciente}
                                <small class="d-block badge bg-dark text-white text-uppercase mt-1">${agendamento.status.replace('_', ' ')}</small>
                            </div>
                            ${ agendamento.status === 'CONFIRMADO' ? `
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown">Ações</button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="atualizarStatus(${agendamento.id}, 'REALIZADO')">Realizado</a></li>
                                    <li><a class="dropdown-item" href="#" onclick="atualizarStatus(${agendamento.id}, 'NAO_COMPARECEU')">Não Compareceu</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="atualizarStatus(${agendamento.id}, 'CANCELADO')">Cancelar</a></li>
                                </ul>
                            </div>` : '' }
                        </div>
                    </div>`;
            } else if (slot.dados.disponivel) {
                const horario = slot.dados;
                slotHTML = `<div class="slot slot-disponivel text-center" onclick="abrirModalAgendamento('${horario.horaInicio}', '${horario.horaFim}')"><strong>${horario.horaInicio.substring(0, 5)}</strong> - Disponível</div>`;
            }

            if (slotHTML) {
                slotWrapper.innerHTML = slotHTML;
                container.appendChild(slotWrapper);
            }
        });
    } catch(error) {
        container.innerHTML = `<div class="alert alert-danger col-12">${error.message}</div>`;
    } finally {
        loadingEl.classList.add('d-none');
    }
}


// =================================================================================
// FUNÇÕES DE INTERAÇÃO COM A API (BACKEND)
// =================================================================================

/**
 * Busca todos os fisioterapeutas cadastrados para popular o seletor principal.
 */
async function carregarFisioterapeutas() {
    try {
        const response = await fetch('/funcionarios?tipo=FISIOTERAPEUTA');
        const fisios = await response.json();
        const select = document.getElementById('fisioterapeutaSelect');
        select.innerHTML = '<option value="">Selecione um profissional...</option>';
        fisios.forEach(fisio => select.add(new Option(fisio.nome, fisio.idUsuario)));
    } catch (error) { console.error('Erro ao carregar fisioterapeutas:', error); }
}

/**
 * Busca todos os pacientes para popular o seletor no modal de agendamento.
 */
async function carregarPacientes() {
    try {
        const response = await fetch('/pacientes');
        todosPacientes = await response.json();
    } catch (error) { console.error('Erro ao carregar pacientes:', error); }
}

/**
 * Abre o modal de agendamento e preenche os dados iniciais.
 */
function abrirModalAgendamento(horaInicio, horaFim) {
    horarioSelecionado = { horaInicio, horaFim };
    const fisioSelect = document.getElementById('fisioterapeutaSelect');
    const dataFormatada = new Date(document.getElementById('dataSelect').value + 'T00:00:00').toLocaleDateString('pt-BR');

    document.getElementById('modalFisioNome').textContent = fisioSelect.options[fisioSelect.selectedIndex].text;
    document.getElementById('modalHorario').textContent = `${dataFormatada} das ${horaInicio.substring(0, 5)} às ${horaFim.substring(0, 5)}`;

    const pacienteSelect = document.getElementById('pacienteSelect');
    pacienteSelect.innerHTML = '<option value="">Selecione...</option>';
    todosPacientes.forEach(p => pacienteSelect.add(new Option(p.nome, p.idPaciente)));

    document.getElementById('formAgendamento').reset();
    document.getElementById('resultadoModal').innerHTML = '';
    agendamentoModalInstance.show();
}

/**
 * Pega os dados do modal e envia para a API criar um novo agendamento.
 */
async function confirmarAgendamento() {
    const requestBody = {
        idPaciente: document.getElementById('pacienteSelect').value,
        idFisioterapeuta: document.getElementById('fisioterapeutaSelect').value,
        idEspecialidade: document.getElementById('especialidadeSelect').value,
        dataHoraInicio: `${document.getElementById('dataSelect').value}T${horarioSelecionado.horaInicio}`,
        dataHoraFim: `${document.getElementById('dataSelect').value}T${horarioSelecionado.horaFim}`,
    };
    try {
        const response = await fetch('/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) throw new Error('Falha ao agendar. Verifique se todos os campos estão preenchidos.');
        agendamentoModalInstance.hide();
        renderizarAgenda();
    } catch (error) {
        document.getElementById('resultadoModal').innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

/**
 * Envia uma requisição para o backend para alterar o status de uma consulta.
 * @param {number} agendamentoId - O ID do agendamento a ser atualizado.
 * @param {string} novoStatus - O novo status (ex: 'REALIZADO', 'CANCELADO').
 */
async function atualizarStatus(agendamentoId, novoStatus) {
    if (!confirm(`Tem certeza que deseja marcar esta consulta como "${novoStatus.replace('_', ' ')}"?`)) return;
    try {
        const response = await fetch(`/agendamentos/${agendamentoId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoStatus: novoStatus.toUpperCase() })
        });
        if (!response.ok) throw new Error(`Falha ao atualizar o status.`);
        renderizarAgenda();
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Verifica no backend se existem consultas que já passaram e ainda não tiveram o status atualizado.
 */
async function verificarConsultasAtivas() {
    try {
        const response = await fetch('/agendamentos/pendentes-status');
        if(response.ok) {
            const agendamentos = await response.json();
            agendamentos.forEach(criarNotificacao);
        }
    } catch(error) { console.error("Erro ao verificar consultas ativas:", error); }
}

/**
 * Cria e exibe uma notificação "toast" do Bootstrap para o usuário.
 * @param {object} agendamento - O objeto de agendamento para o qual criar a notificação.
 */
function criarNotificacao(agendamento) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    const toastId = `toast-${agendamento.id}`;
    if (document.getElementById(toastId)) return;

    const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header"><strong class="me-auto">Lembrete de Consulta</strong><small>${agendamento.inicio.substring(11, 16)}</small><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div>
        <div class="toast-body">
            A consulta com <strong>${agendamento.nomePaciente}</strong> já ocorreu. Por favor, atualize o status.
            <div class="mt-2 pt-2 border-top">
                <button type="button" class="btn btn-success btn-sm" onclick="atualizarStatusToast(${agendamento.id}, 'REALIZADO', this)">Realizada</button>
                <button type="button" class="btn btn-warning btn-sm" onclick="atualizarStatusToast(${agendamento.id}, 'NAO_COMPARECEU', this)">Não Compareceu</button>
            </div>
        </div>
    </div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

/**
 * Atualiza o status de uma consulta a partir de um botão na notificação toast.
 */
async function atualizarStatusToast(agendamentoId, novoStatus, button) {
    try {
        button.disabled = true;
        await fetch(`/agendamentos/${agendamentoId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoStatus: novoStatus.toUpperCase() })
        });
        const toastElement = document.getElementById(`toast-${agendamentoId}`);
        if(toastElement) bootstrap.Toast.getInstance(toastElement).hide();

        // Se o usuário estiver na página da agenda, atualiza a visualização
        if(window.location.pathname.includes('agenda.html')) {
            renderizarAgenda();
        }
    } catch(error) {
        alert(error.message);
        button.disabled = false;
    }
}
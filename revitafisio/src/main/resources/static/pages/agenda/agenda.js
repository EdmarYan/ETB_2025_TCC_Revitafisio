/**
 * @file Lógica da Agenda - Versão Clássica e Estável
 * @description Gerencia a exibição da agenda em lista de horários diários,
 * acionada por um botão, garantindo funcionalidade e simplicidade.
 */

// Variáveis globais
let todosPacientes = [];
let todasEspecialidades = [];
let agendamentoInfo = {};

// =================================================================================
// INICIALIZAÇÃO DA PÁGINA
// =================================================================================
document.addEventListener('DOMContentLoaded', async () => {
    const dadosUsuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!dadosUsuario) {
        alert('Sessão inválida.');
        window.location.href = '../../login.html';
        return;
    }
    renderizarComponentesBasicos(dadosUsuario);
    await carregarDadosIniciais();

    // Regra de negócio para Fisioterapeuta: pré-seleciona e desabilita o filtro
    if (dadosUsuario.tipoUsuario.includes('FISIOTERAPEUTA')) {
        const fisioSelect = document.getElementById('fisioterapeutaSelect');
        fisioSelect.value = dadosUsuario.usuarioId;
        fisioSelect.disabled = true;
    }

    document.getElementById('dataSelect').valueAsDate = new Date();
    document.getElementById('buscarAgendaBtn').addEventListener('click', renderizarSlotsDoDia);
    document.getElementById('confirmarAgendamentoBtn').addEventListener('click', confirmarAgendamento);
});

// =================================================================================
// RENDERIZAÇÃO DA INTERFACE
// =================================================================================
function renderizarComponentesBasicos(dadosUsuario) {
    document.getElementById('userName').textContent = dadosUsuario.nome;
    renderizarSidebar(dadosUsuario.tipoUsuario);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });
}

async function renderizarSlotsDoDia() {
    const fisioId = document.getElementById('fisioterapeutaSelect').value;
    const dataSelecionada = document.getElementById('dataSelect').value;
    const container = document.getElementById('agenda-container');
    const loadingEl = document.getElementById('loading');

    container.innerHTML = '';
    if (!fisioId || !dataSelecionada) {
        alert('Por favor, selecione um fisioterapeuta e uma data.');
        return;
    }

    loadingEl.classList.remove('d-none');

    try {
        const [horariosRes, agendamentosRes] = await Promise.all([
            fetch(`/horarios-disponiveis?idFisioterapeuta=${fisioId}&start=${dataSelecionada}&end=${dataSelecionada}`),
            fetch(`/agendamentos?idFisioterapeuta=${fisioId}&inicio=${dataSelecionada}T00:00:00&fim=${dataSelecionada}T23:59:59`)
        ]);
        if (!horariosRes.ok || !agendamentosRes.ok) throw new Error('Falha ao buscar dados da agenda.');
        const horarios = await horariosRes.json();
        const agendamentos = await agendamentosRes.json();
        const slotsMap = new Map();

        horarios.forEach(h => { if (h.disponivel) slotsMap.set(h.horaInicio, { tipo: 'disponivel', dados: h }); });
        agendamentos.forEach(a => { const horaInicio = new Date(a.inicio).toTimeString().substring(0, 8); slotsMap.set(horaInicio, { tipo: 'ocupado', dados: a }); });

        if (slotsMap.size === 0) {
            container.innerHTML = '<div class="col-12"><div class="alert alert-warning">Nenhum horário de trabalho ou consulta para este dia.</div></div>';
            return;
        }

        const slotsOrdenados = Array.from(slotsMap.values()).sort((a, b) => (a.dados.horaInicio || a.dados.inicio).localeCompare(b.dados.horaInicio || b.dados.inicio));

        container.innerHTML = ''; // Limpa antes de adicionar os novos slots
        slotsOrdenados.forEach(slot => {
            const wrapper = document.createElement('div');
            wrapper.className = 'col-lg-4 col-md-6';
            if (slot.tipo === 'disponivel') {
                const h = slot.dados;
                wrapper.innerHTML = `<div class="slot slot-disponivel" onclick="abrirModalAgendamento('${h.data}', '${h.horaInicio}', '${h.horaFim}')"><strong>${h.horaInicio.substring(0, 5)}</strong><span>Disponível</span></div>`;
            } else {
                const a = slot.dados;
                const hora = new Date(a.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const statusClass = `status-${a.status.toLowerCase().replace('_', '-')}`;
                wrapper.innerHTML = `<div class="slot slot-ocupado ${statusClass}" onclick="abrirModalDetalhes('${a.nomePaciente}', '${a.status.replace(/_/g, ' ')}')"><strong>${hora}</strong><span>${a.nomePaciente}</span></div>`;
            }
            container.appendChild(wrapper);
        });
    } catch (error) {
        container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${error.message}</div></div>`;
    } finally {
        loadingEl.classList.add('d-none');
    }
}

// =================================================================================
// MODAIS E FUNÇÕES AUXILIARES
// =================================================================================
function abrirModalAgendamento(data, horaInicio, horaFim) {
    const start = new Date(`${data}T${horaInicio}`);
    agendamentoInfo = { start: start.toISOString(), end: new Date(`${data}T${horaFim}`).toISOString() };
    const fisioSelect = document.getElementById('fisioterapeutaSelect');
    document.getElementById('modalFisioNome').textContent = fisioSelect.options[fisioSelect.selectedIndex].text;
    document.getElementById('modalHorario').textContent = start.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });
    const pacienteSelect = document.getElementById('pacienteSelect');
    pacienteSelect.innerHTML = '<option value="">Selecione...</option>';
    todosPacientes.forEach(p => pacienteSelect.add(new Option(p.nome, p.id)));
    const especialidadeSelect = document.getElementById('especialidadeSelect');
    especialidadeSelect.innerHTML = '<option value="">Selecione...</option>';
    todasEspecialidades.forEach(e => especialidadeSelect.add(new Option(e.nome, e.idEspecialidade)));
    document.getElementById('resultadoModal').innerHTML = '';
    $('#agendamentoModal').modal('show');
}

function abrirModalDetalhes(paciente, status) {
    document.getElementById('detalhe-paciente').textContent = paciente;
    document.getElementById('detalhe-status').textContent = status;
    $('#detalhesConsultaModal').modal('show');
}

async function confirmarAgendamento() {
    const requestBody = { idPaciente: document.getElementById('pacienteSelect').value, idFisioterapeuta: document.getElementById('fisioterapeutaSelect').value, idEspecialidade: document.getElementById('especialidadeSelect').value, dataHoraInicio: agendamentoInfo.start, dataHoraFim: agendamentoInfo.end };
    try {
        if (!requestBody.idPaciente || !requestBody.idEspecialidade) throw new Error('Selecione paciente e especialidade.');
        const response = await fetch('/agendamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (!response.ok) throw new Error((await response.json()).message || 'Falha ao agendar.');
        $('#agendamentoModal').modal('hide');
        renderizarSlotsDoDia();
    } catch (error) {
        document.getElementById('resultadoModal').innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

async function carregarDadosIniciais() { await Promise.all([carregarFisioterapeutas(), carregarPacientes(), carregarEspecialidades()]); }
async function carregarFisioterapeutas() { try { const r = await fetch('/funcionarios'); const d = await r.json(); const s = document.getElementById('fisioterapeutaSelect'); s.innerHTML = '<option value="">Selecione...</option>'; d.filter(f => f.tipo === 'FISIOTERAPEUTA').forEach(f => s.add(new Option(f.nome, f.id))); } catch (e) { console.error('Erro ao carregar Fisioterapeutas:', e); } }
async function carregarPacientes() { try { const r = await fetch('/pacientes'); todosPacientes = await r.json(); } catch (e) { console.error('Erro ao carregar Pacientes:', e); } }
async function carregarEspecialidades() { try { const r = await fetch('/especialidades'); todasEspecialidades = await r.json(); } catch (e) { console.error('Erro ao carregar Especialidades:', e); } }
function renderizarSidebar(t) { const c = document.getElementById('sidebar-links'); c.innerHTML = ''; if (t.includes('ADMIN')) { c.innerHTML += `<li class="nav-item"><a class="nav-link" href="../funcionarios/funcionarios.html"><i class="fas fa-fw fa-users-cog"></i><span>Gerenciar Equipe</span></a></li>`; c.innerHTML += `<li class="nav-item"><a class="nav-link" href="../relatorios/relatorios.html"><i class="fas fa-fw fa-chart-bar"></i><span>Relatórios</span></a></li>`; } if (t.includes('FISIOTERAPEUTA')) { c.innerHTML += `<li class="nav-item"><a class="nav-link" href="../meus-horarios/meus-horarios.html"><i class="fas fa-fw fa-clock"></i><span>Meus Horários</span></a></li>`; } c.innerHTML += `<li class="nav-item active"><a class="nav-link" href="agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`; }
// Este evento garante que o script só rode depois que a página HTML inteira for carregada
document.addEventListener('DOMContentLoaded', function() {
    const dadosUsuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!dadosUsuario || !dadosUsuario.nome) {
        window.location.href = '../../login.html';
        return;
    }

    // Preenche informações do template
    document.getElementById('userName').textContent = dadosUsuario.nome;
    renderizarComponentes(dadosUsuario.tipoUsuario);
    carregarPacientesIniciais();

    // Adiciona os "ouvintes" de eventos aos botões
    document.getElementById('logoutButton').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '../../login.html';
    });
    document.getElementById('formBuscaPaciente').addEventListener('submit', (e) => {
        e.preventDefault();
        buscarPacientes();
    });
});

/**
 * Função que desenha os componentes visuais (cards e links do menu)
 * de acordo com o perfil do usuário logado.
 * @param {string} tipoUsuario - O tipo do usuário (ex: 'ADMIN', 'FISIOTERAPEUTA').
 */
function renderizarComponentes(tipoUsuario) {
    const cardsContainer = document.getElementById('cards-container');
    const sidebarContainer = document.getElementById('sidebar-links');
    cardsContainer.innerHTML = '';
    sidebarContainer.innerHTML = '';

    // Renderiza Cards de Atalho
    if (tipoUsuario.includes('ADMIN') || tipoUsuario.includes('RECEPCIONISTA')) {
        cardsContainer.innerHTML += createCard('Pacientes', 'Novo Cadastro', '../cadastro-paciente/cadastro-paciente.html', 'primary', 'user-plus');
    }
    if (tipoUsuario.includes('ADMIN')) {
        cardsContainer.innerHTML += createCard('Equipe', 'Gerenciar', '../funcionarios/funcionarios.html', 'danger', 'users-cog');
        cardsContainer.innerHTML += createCard('Relatórios', 'Ver Desempenho', '../relatorios/relatorios.html', 'warning', 'chart-line');
    }
    if (tipoUsuario.includes('FISIOTERAPEUTA')) {
        cardsContainer.innerHTML += createCard('Minha Área', 'Definir Horários', '../meus-horarios/meus-horarios.html', 'info', 'id-badge');
    }
    // Card de Agenda é visível para todos os funcionários
    cardsContainer.innerHTML += createCard('Agenda', 'Acessar', '../agenda/agenda.html', 'success', 'calendar-alt');

    // Renderiza Links da Sidebar
    if (tipoUsuario.includes('ADMIN')) {
        sidebarContainer.innerHTML += createSidebarLink('Gerenciar Equipe', '../funcionarios/funcionarios.html', 'users-cog', false);
        sidebarContainer.innerHTML += createSidebarLink('Relatórios', '../relatorios/relatorios.html', 'chart-bar', false);
    }
    if (tipoUsuario.includes('FISIOTERAPEUTA')) {
        sidebarContainer.innerHTML += createSidebarLink('Meus Horários', '../meus-horarios/meus-horarios.html', 'clock', false);
    }
    // #### LINHA CORRIGIDA - ADICIONANDO O LINK DA AGENDA ####
    sidebarContainer.innerHTML += createSidebarLink('Agenda', '../agenda/agenda.html', 'calendar-alt', false);
}

// Funções auxiliares para criar os componentes dinâmicos
function createCard(titulo, texto, link, cor, icone) {
    return `
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-${cor} shadow h-100 py-2">
                <a href="${link}" class="text-decoration-none">
                    <div class="card-body"><div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-${cor} text-uppercase mb-1">${titulo}</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">${texto}</div>
                        </div>
                        <div class="col-auto"><i class="fas fa-${icone} fa-2x text-gray-300"></i></div>
                    </div></div>
                </a>
            </div>
        </div>`;
}

function createSidebarLink(texto, link, icone, ativo) {
    const activeClass = ativo ? 'active' : '';
    return `<li class="nav-item ${activeClass}"><a class="nav-link" href="${link}"><i class="fas fa-fw fa-${icone}"></i><span>${texto}</span></a></li>`;
}

// Funções para buscar e exibir os pacientes na tabela
async function carregarPacientesIniciais() { await buscarPacientesNaApi('/pacientes'); }
async function buscarPacientes() {
    const busca = document.getElementById('buscaInput').value;
    const url = busca ? `/pacientes?nome=${encodeURIComponent(busca)}` : '/pacientes';
    await buscarPacientesNaApi(url);
}

async function buscarPacientesNaApi(url) {
    const tbody = document.getElementById('listaResultados');
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Buscando...</td></tr>';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na requisição');
        const pacientes = await response.json();
        tbody.innerHTML = '';
        if (pacientes.length > 0) {
            pacientes.forEach(paciente => {
                tbody.innerHTML += `
                    <tr>
                        <td>${paciente.nome}</td>
                        <td>${paciente.cpf}</td>
                        <td><a href="../prontuario/prontuario.html?pacienteId=${paciente.id}" class="btn btn-sm btn-outline-primary">Ver Prontuário</a></td>
                    </tr>`;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum paciente encontrado.</td></tr>';
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Erro ao carregar pacientes.</td></tr>';
    }
}
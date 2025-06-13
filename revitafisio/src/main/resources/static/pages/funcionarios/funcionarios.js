/**
 * @file Lógica para a página de gerenciamento de funcionários.
 * @description Garante que apenas Admins acessem, carrega a lista de funcionários
 * e monta os menus de navegação.
 */
document.addEventListener('DOMContentLoaded', function() {
    const dadosUsuario = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Proteção de Rota: Apenas Admins podem acessar esta página
    if (!dadosUsuario || !dadosUsuario.tipoUsuario.includes('ADMIN')) {
        alert('Acesso negado. Esta página é apenas para Administradores.');
        window.location.href = '../../pages/dashboard/dashboard.html';
        return;
    }

    // Preenche dados do template
    document.getElementById('userName').textContent = dadosUsuario.nome;
    renderizarSidebar(dadosUsuario.tipoUsuario);

    // Carrega a lista de funcionários
    carregarFuncionarios();

    // Configura o botão de logout
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });
});

/**
 * Renderiza os links do menu lateral, marcando o link da página atual como ativo.
 * @param {string} tipoUsuario - Os cargos do usuário logado.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = '';

    if (tipoUsuario.includes('ADMIN')) {
        sidebarContainer.innerHTML += `<li class="nav-item active"><a class="nav-link" href="funcionarios.html"><i class="fas fa-fw fa-users-cog"></i><span>Gerenciar Equipe</span></a></li>`;
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../relatorios/relatorios.html"><i class="fas fa-fw fa-chart-bar"></i><span>Relatórios</span></a></li>`;
    }
    // ... (outros links de sidebar, se necessário)
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Busca a lista de todos os funcionários na API e popula a tabela.
 */
async function carregarFuncionarios() {
    const tbody = document.getElementById('listaFuncionarios');
    const loadingEl = document.getElementById('loading');
    tbody.innerHTML = ''; // Limpa a tabela
    loadingEl.style.display = 'block'; // Mostra o spinner

    try {
        const response = await fetch('/funcionarios');
        if (!response.ok) throw new Error('Falha ao carregar a lista de funcionários.');

        const funcionarios = await response.json();

        loadingEl.style.display = 'none'; // Esconde o spinner

        if (funcionarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhum funcionário cadastrado.</td></tr>`;
            return;
        }

        funcionarios.forEach(func => {
            const row = tbody.insertRow();
            // O link de "Ver Detalhes" aponta para a futura página refatorada
            row.innerHTML = `
                <td>${func.nome}</td>
                <td>${func.tipo}</td>
                <td><a href="../prontuario-funcionario/prontuario-funcionario.html?id=${func.id}" class="btn btn-sm btn-outline-primary"><i class="fas fa-eye"></i> Ver Detalhes</a></td>
            `;
        });

    } catch (error) {
        loadingEl.style.display = 'none';
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${error.message}</td></tr>`;
    }
}
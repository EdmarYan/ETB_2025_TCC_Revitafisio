/**
 * @file Lógica para a página de relatórios.
 * @description Garante que apenas Admins acessem, busca os dados do relatório
 * e popula a tabela com os resultados.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Pega os dados do usuário logado do armazenamento local do navegador
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Proteção de Rota: Se não for admin, volta para o dashboard
    if (!usuarioLogado || !usuarioLogado.tipoUsuario.includes('ADMIN')) {
        alert('Acesso negado. Esta página é apenas para Administradores.');
        window.location.href = '../dashboard/dashboard.html';
        return;
    }

    // Preenche o nome do usuário na barra superior e renderiza o menu lateral
    document.getElementById('userName').textContent = usuarioLogado.nome;
    renderizarSidebar(usuarioLogado.tipoUsuario);

    // Define o valor padrão do seletor de data para o mês e ano atuais
    const hoje = new Date();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const ano = hoje.getFullYear();
    document.getElementById('mesAnoInput').value = `${ano}-${mes}`;

    // Adiciona os "ouvintes" de eventos aos botões
    document.getElementById('gerarRelatorioBtn').addEventListener('click', gerarRelatorio);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });
});

/**
 * Renderiza os links do menu lateral, marcando o link de relatórios como ativo.
 * @param {string} tipoUsuario - Os cargos do usuário logado.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = '';

    if (tipoUsuario.includes('ADMIN')) {
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../funcionarios/funcionarios.html"><i class="fas fa-fw fa-users-cog"></i><span>Gerenciar Equipe</span></a></li>`;
        sidebarContainer.innerHTML += `<li class="nav-item active"><a class="nav-link" href="relatorios.html"><i class="fas fa-fw fa-chart-bar"></i><span>Relatórios</span></a></li>`;
    }
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Pega o mês/ano selecionado, chama a API do backend e exibe os resultados na tabela.
 */
async function gerarRelatorio() {
    const mesAno = document.getElementById('mesAnoInput').value;
    if (!mesAno) { alert('Por favor, selecione um mês e ano.'); return; }
    const [ano, mes] = mesAno.split('-');

    const loadingEl = document.getElementById('loading');
    const tabela = document.getElementById('tabela-relatorio');
    const corpoTabela = document.getElementById('corpo-tabela');
    const tituloRelatorio = document.getElementById('titulo-relatorio');

    loadingEl.classList.remove('d-none');
    tabela.classList.add('d-none');
    corpoTabela.innerHTML = '';

    try {
        const response = await fetch(`/relatorios/atendimentos-mensal?ano=${ano}&mes=${mes}`);
        if (!response.ok) throw new Error('Falha ao gerar o relatório.');

        const dados = await response.json();

        tituloRelatorio.classList.remove('d-none');
        tituloRelatorio.querySelector('span').textContent = `${mes}/${ano}`;

        if (dados.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Nenhum atendimento realizado neste período.</td></tr>';
        } else {
            dados.forEach(item => {
                const row = corpoTabela.insertRow();
                row.innerHTML = `<td>${item.nomeFisioterapeuta}</td><td class="text-end fw-bold">${item.totalAtendimentos}</td>`;
            });
        }
        tabela.classList.remove('d-none');

    } catch (error) {
        corpoTabela.innerHTML = `<tr><td colspan="2" class="text-center text-danger">${error.message}</td></tr>`;
        tabela.classList.remove('d-none');
    } finally {
        loadingEl.classList.add('d-none');
    }
}
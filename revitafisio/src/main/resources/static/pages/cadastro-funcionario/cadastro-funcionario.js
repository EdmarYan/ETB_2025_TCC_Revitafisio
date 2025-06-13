/**
 * @file Lógica da página de cadastro de funcionários.
 * @description Garante que apenas Admins acessem, aplica máscara de CPF
 * e envia os dados do novo funcionário para a API.
 */
document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Proteção de Rota: Apenas Admins podem acessar esta página
    if (!usuarioLogado || !usuarioLogado.tipoUsuario.includes('ADMIN')) {
        alert('Acesso negado. Esta página é apenas para Administradores.');
        window.location.href = '../../pages/dashboard/dashboard.html';
        return;
    }

    // Preenche informações do template
    document.getElementById('userName').textContent = usuarioLogado.nome;
    renderizarSidebar(usuarioLogado.tipoUsuario);

    // Adiciona listener ao formulário de cadastro
    document.getElementById('formCadastroFuncionario').addEventListener('submit', cadastrarFuncionario);

    // Adiciona listener ao botão de sair
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });

    // Aplica a máscara de formatação no campo de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.setAttribute('maxlength', '14');
        cpfInput.addEventListener('input', aplicarMascaraCpf);
    }
});

/**
 * Renderiza os links do menu lateral, marcando o link correto como ativo.
 * @param {string} tipoUsuario - Os cargos do usuário logado.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = '';

    if (tipoUsuario.includes('ADMIN')) {
        // Marca "Gerenciar Equipe" como ativo, pois esta página pertence a esse fluxo
        sidebarContainer.innerHTML += `<li class="nav-item active"><a class="nav-link" href="../funcionarios/funcionarios.html"><i class="fas fa-fw fa-users-cog"></i><span>Gerenciar Equipe</span></a></li>`;
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../relatorios/relatorios.html"><i class="fas fa-fw fa-chart-bar"></i><span>Relatórios</span></a></li>`;
    }
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Pega os dados do formulário e os envia para a API criar um novo funcionário.
 * @param {Event} event - O evento de submissão do formulário.
 */
async function cadastrarFuncionario(event) {
    event.preventDefault(); // Previne o recarregamento da página
    const resultadoDiv = document.getElementById('resultado');

    const dadosParaEnviar = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''), // Envia só os números do CPF
        dataNascimento: document.getElementById('dataNascimento').value,
        senha: document.getElementById('senha').value,
        tipo: document.getElementById('tipo').value
    };

    try {
        const response = await fetch('/funcionarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaEnviar)
        });

        resultadoDiv.className = 'alert';
        if (response.ok) {
            resultadoDiv.textContent = 'Funcionário cadastrado com sucesso!';
            resultadoDiv.classList.add('alert-success');
            document.getElementById('formCadastroFuncionario').reset();
        } else {
            const erro = await response.json();
            resultadoDiv.textContent = `Erro: ${erro.message || 'Não foi possível cadastrar.'}`;
            resultadoDiv.classList.add('alert-danger');
        }
    } catch (error) {
        resultadoDiv.className = 'alert alert-danger';
        resultadoDiv.textContent = 'Erro de conexão com a API.';
    }
}

/**
 * Aplica a máscara de formatação (xxx.xxx.xxx-xx) em um campo de input de CPF.
 * @param {Event} event - O evento de input.
 */
function aplicarMascaraCpf(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    let formattedValue = value;
    if (value.length > 9) {
        formattedValue = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
        formattedValue = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
        formattedValue = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    input.value = formattedValue;
}
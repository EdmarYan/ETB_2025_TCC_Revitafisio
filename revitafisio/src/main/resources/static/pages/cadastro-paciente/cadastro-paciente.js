/**
 * @file Lógica da página de cadastro de pacientes.
 * @description Garante que usuários autorizados acessem, aplica máscara de CPF
 * e envia os dados do novo paciente (incluindo contatos) para a API.
 */
document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado || !(usuarioLogado.tipoUsuario.includes('ADMIN') || usuarioLogado.tipoUsuario.includes('RECEPCIONISTA'))) {
        alert('Acesso negado.');
        window.location.href = '../../pages/dashboard/dashboard.html';
        return;
    }

    document.getElementById('userName').textContent = usuarioLogado.nome;
    renderizarSidebar(usuarioLogado.tipoUsuario);
    document.getElementById('formCadastroPaciente').addEventListener('submit', cadastrarPaciente);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });

    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.setAttribute('maxlength', '14');
        cpfInput.addEventListener('input', aplicarMascaraCpf);
    }
});

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
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * (FUNÇÃO ATUALIZADA) Pega os dados do formulário, incluindo os contatos, e os envia para a API.
 */
async function cadastrarPaciente(event) {
    event.preventDefault();
    const resultadoDiv = document.getElementById('resultado');

    // BLOCO ADICIONADO: Monta a lista de contatos para enviar.
    const contatos = [];
    const celular = document.getElementById('celular').value;
    const email = document.getElementById('email').value;

    // Se o campo de celular foi preenchido, adiciona à lista como WHATSAPP principal.
    if (celular) {
        contatos.push({ tipo: 'WHATSAPP', valor: celular, principal: true });
    }
    // Se o campo de email foi preenchido, adiciona à lista.
    if (email) {
        // Define email como principal apenas se o celular não for fornecido.
        contatos.push({ tipo: 'EMAIL', valor: email, principal: !celular });
    }

    // Corpo da requisição agora inclui a lista de contatos.
    const dadosParaEnviar = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        dataNascimento: document.getElementById('dataNascimento').value,
        contatos: contatos
    };

    try {
        const response = await fetch('/pacientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaEnviar)
        });
        resultadoDiv.className = 'alert';
        if (response.status === 201) {
            resultadoDiv.textContent = 'Paciente cadastrado com sucesso!';
            resultadoDiv.classList.add('alert-success');
            document.getElementById('formCadastroPaciente').reset();
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

function aplicarMascaraCpf(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    let formattedValue = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    input.value = formattedValue;
}
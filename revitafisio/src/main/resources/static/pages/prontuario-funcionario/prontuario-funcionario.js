/**
 * @file Lógica da página de detalhes do funcionário (prontuario-funcionario.html)
 * @description Gerencia a exibição de dados, edição, status e associação de especialidades.
 */

// =================================================================================
// VARIÁVEIS GLOBAIS E INICIALIZAÇÃO
// =================================================================================

// Pega o ID do funcionário da URL (ex: ?id=4)
const urlParams = new URLSearchParams(window.location.search);
const funcionarioId = urlParams.get('id');

// Variáveis globais para armazenar dados carregados e evitar múltiplas chamadas à API
let funcionarioAtual = {};
let todasEspecialidades = [];
let usuarioLogado;

/**
 * Evento que roda assim que o conteúdo HTML da página é totalmente carregado.
 * É o ponto de entrada para o nosso script.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Pega os dados do usuário que fez login, salvos no navegador
    usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Validação de segurança: se não houver ID do funcionário ou usuário logado, redireciona para o login
    if (!funcionarioId || !usuarioLogado) {
        alert('Acesso inválido ou sessão expirada.');
        window.location.href = '../../login.html';
        return;
    }

    // Preenche informações do template (nome do usuário e menu lateral)
    document.getElementById('userName').textContent = usuarioLogado.nome;
    renderizarSidebar(usuarioLogado.tipoUsuario);
    configurarVisibilidadePorPerfil();

    // Carrega primeiro todas as especialidades, depois os dados do funcionário
    carregarTodasEspecialidades().then(() => {
        carregarDadosFuncionario(funcionarioId);
    });

    // Adiciona os "ouvintes" de eventos aos botões
    document.getElementById('salvarEspecialidadesBtn').addEventListener('click', salvarEspecialidades);
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });
});


// =================================================================================
// FUNÇÕES DE RENDERIZAÇÃO DA INTERFACE (UI)
// =================================================================================

/**
 * Monta o menu lateral de acordo com o perfil do usuário e marca o link ativo.
 * @param {string} tipoUsuario - Os cargos do usuário logado.
 */
function renderizarSidebar(tipoUsuario) {
    const sidebarContainer = document.getElementById('sidebar-links');
    sidebarContainer.innerHTML = '';

    if (tipoUsuario.includes('ADMIN')) {
        // Marca "Gerenciar Equipe" como a página ativa
        sidebarContainer.innerHTML += `<li class="nav-item active"><a class="nav-link" href="../funcionarios/funcionarios.html"><i class="fas fa-fw fa-users-cog"></i><span>Gerenciar Equipe</span></a></li>`;
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../relatorios/relatorios.html"><i class="fas fa-fw fa-chart-bar"></i><span>Relatórios</span></a></li>`;
    }
    if (tipoUsuario.includes('FISIOTERAPEUTA')) {
        sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../meus-horarios/meus-horarios.html"><i class="fas fa-fw fa-clock"></i><span>Meus Horários</span></a></li>`;
    }
    sidebarContainer.innerHTML += `<li class="nav-item"><a class="nav-link" href="../agenda/agenda.html"><i class="fas fa-fw fa-calendar-alt"></i><span>Agenda</span></a></li>`;
}

/**
 * Controla a visibilidade dos botões de edição com base no perfil do usuário logado.
 */
function configurarVisibilidadePorPerfil() {
    const ehAdmin = usuarioLogado.tipoUsuario.includes('ADMIN');
    document.getElementById('botoes-edicao-funcionario').style.display = ehAdmin ? 'flex' : 'none';
    document.getElementById('btn-editar-especialidades').style.display = ehAdmin ? 'block' : 'none';
}

/**
 * Preenche todos os campos da tela com os dados do funcionário.
 * @param {object} func - O objeto do funcionário vindo da API.
 */
function preencherDadosNaTela(func) {
    document.getElementById('nomeFuncionarioView').textContent = func.nome;

    // Preenche o modo de visualização
    document.getElementById('viewMode').innerHTML = `
        <p><strong>CPF:</strong> ${func.cpf}</p>
        <p><strong>Data de Nascimento:</strong> ${new Date(func.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
        <p><strong>Cargo(s):</strong> <span class="text-capitalize">${func.tipo_usuario.toLowerCase().replace('_', ' ')}</span></p>
        <p><strong>Status:</strong> <span class="badge ${func.ativo ? 'bg-success' : 'bg-danger'}">${func.ativo ? 'Ativo' : 'Inativo'}</span></p>
    `;

    // Preenche o formulário de edição
    document.getElementById('editMode').innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3"><label for="nomeInput" class="form-label">Nome</label><input type="text" class="form-control" id="nomeInput" value="${func.nome}"></div>
            <div class="col-md-6 mb-3"><label for="nascimentoInput" class="form-label">Data de Nascimento</label><input type="date" class="form-control" id="nascimentoInput" value="${func.dataNascimento}"></div>
        </div>
    `;

    // Recria os botões de ação para garantir que os listeners sejam adicionados corretamente
    const botoesContainer = document.getElementById('botoes-edicao-funcionario');
    botoesContainer.innerHTML = `
        <button class="btn btn-sm btn-secondary" id="editButton"><i class="fas fa-edit"></i> Editar</button>
        <button class="btn btn-sm btn-success d-none" id="saveButton"><i class="fas fa-save"></i> Salvar</button>
        <button class="btn btn-sm btn-light d-none" id="cancelButton">Cancelar</button>
        <button class="btn btn-sm btn-danger ${!func.ativo ? 'd-none' : ''}" id="inativarBtn"><i class="fas fa-trash"></i> Inativar</button>
        <button class="btn btn-sm btn-success ${func.ativo ? 'd-none' : ''}" id="ativarBtn">Reativar</button>
    `;

    // Re-adiciona os listeners aos botões recriados
    botoesContainer.querySelector('#editButton').addEventListener('click', () => toggleEditMode(true));
    botoesContainer.querySelector('#saveButton').addEventListener('click', salvarAlteracoes);
    botoesContainer.querySelector('#cancelButton').addEventListener('click', () => toggleEditMode(false));
    botoesContainer.querySelector('#inativarBtn').addEventListener('click', () => inativarFuncionario(func.idUsuario));
    botoesContainer.querySelector('#ativarBtn').addEventListener('click', () => ativarFuncionario(func.idUsuario));

    // Lógica para o card de especialidades
    const cardEspecialidades = document.getElementById('card-especialidades');
    if (func.tipo_usuario.includes('FISIOTERAPEUTA')) {
        cardEspecialidades.style.display = 'block';
        renderizarBadgesEspecialidades(func.especialidades);
        preencherModalEspecialidades(func.especialidades);
    } else {
        cardEspecialidades.style.display = 'none';
    }
}

/**
 * Alterna entre os modos de visualização e edição do card de dados cadastrais.
 * @param {boolean} isEditing - True para mostrar o formulário, false para mostrar os dados.
 */
function toggleEditMode(isEditing) {
    document.getElementById('viewMode').classList.toggle('d-none', isEditing);
    document.getElementById('editMode').classList.toggle('d-none', !isEditing);
    document.getElementById('editButton').classList.toggle('d-none', isEditing);
    document.getElementById('saveButton').classList.toggle('d-none', !isEditing);
    document.getElementById('cancelButton').classList.toggle('d-none', !isEditing);
}

// =================================================================================
// FUNÇÕES DE INTERAÇÃO COM A API (BACKEND)
// =================================================================================

/**
 * Carrega os dados detalhados do funcionário da API.
 * @param {number} id - O ID do funcionário a ser buscado.
 */
async function carregarDadosFuncionario(id) {
    const loadingEl = document.getElementById('loading');
    const detailsContainer = document.getElementById('details-container');
    loadingEl.classList.remove('d-none');
    detailsContainer.classList.add('d-none');

    try {
        const response = await fetch(`/funcionarios/${id}`);
        if (!response.ok) throw new Error('Funcionário não encontrado.');

        funcionarioAtual = await response.json();
        preencherDadosNaTela(funcionarioAtual);

        loadingEl.classList.add('d-none');
        detailsContainer.classList.remove('d-none');
    } catch (error) {
        alert(error.message);
        window.location.href = '../funcionarios/funcionarios.html';
    }
}

/**
 * Carrega a lista de todas as especialidades da clínica para usar no modal.
 */
async function carregarTodasEspecialidades() {
    try {
        const response = await fetch('/especialidades');
        if(!response.ok) throw new Error('Falha ao carregar especialidades');
        todasEspecialidades = await response.json();
    } catch (error) {
        console.error("Erro ao carregar especialidades:", error);
    }
}

/**
 * Salva as alterações feitas no formulário de edição do funcionário.
 */
async function salvarAlteracoes() {
    const dadosParaAtualizar = {
        nome: document.getElementById('nomeInput').value,
        dataNascimento: document.getElementById('nascimentoInput').value
    };
    try {
        const response = await fetch(`/funcionarios/${funcionarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaAtualizar)
        });
        if (!response.ok) throw new Error('Falha ao atualizar o funcionário.');

        funcionarioAtual = await response.json();
        preencherDadosNaTela(funcionarioAtual);
        toggleEditMode(false);
        alert('Dados atualizados com sucesso!');
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Envia um pedido para inativar o funcionário.
 * @param {number} id - O ID do funcionário.
 */
async function inativarFuncionario(id) {
    if (!confirm('Tem certeza que deseja INATIVAR este funcionário?')) return;
    try {
        const response = await fetch(`/funcionarios/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao inativar o funcionário.');

        alert('Funcionário inativado com sucesso!');
        funcionarioAtual.ativo = false;
        preencherDadosNaTela(funcionarioAtual);
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Envia um pedido para reativar o funcionário.
 * @param {number} id - O ID do funcionário.
 */
async function ativarFuncionario(id) {
    if (!confirm('Tem certeza que deseja REATIVAR este funcionário?')) return;
    try {
        const response = await fetch(`/funcionarios/${id}/ativar`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Falha ao reativar o funcionário.');

        alert('Funcionário reativado com sucesso!');
        funcionarioAtual.ativo = true;
        preencherDadosNaTela(funcionarioAtual);
    } catch (error) {
        alert(error.message);
    }
}

/**
 * Salva as especialidades selecionadas no modal.
 */
async function salvarEspecialidades() {
    const checkboxes = document.querySelectorAll('#checkbox-container-especialidades input[type="checkbox"]:checked');
    const idsSelecionados = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const resultadoDiv = document.getElementById('resultadoModal');
    resultadoDiv.innerHTML = '';

    try {
        const response = await fetch(`/funcionarios/${funcionarioId}/especialidades`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(idsSelecionados)
        });
        if (!response.ok) throw new Error('Falha ao atualizar especialidades.');

        const fisioAtualizado = await response.json();
        funcionarioAtual.especialidades = fisioAtualizado.especialidades;
        renderizarBadgesEspecialidades(fisioAtualizado.especialidades);

        const modalEl = document.getElementById('especialidadesModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    } catch(error) {
        resultadoDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}


// =================================================================================
// FUNÇÕES AUXILIARES
// =================================================================================

/**
 * Renderiza os "badges" coloridos das especialidades de um fisioterapeuta.
 * @param {Array} especialidadesDoFisio - A lista de especialidades do profissional.
 */
function renderizarBadgesEspecialidades(especialidadesDoFisio) {
    const container = document.getElementById('lista-especialidades-badges');
    container.innerHTML = '';
    if (especialidadesDoFisio && especialidadesDoFisio.length > 0) {
        especialidadesDoFisio.forEach(esp => {
            const corTexto = getContrastYIQ(esp.cor);
            container.innerHTML += `<span class="badge me-2 p-2" style="background-color: ${esp.cor}; color: ${corTexto};">${esp.nome}</span>`;
        });
    } else {
        container.innerHTML = '<p class="text-muted small m-0">Nenhuma especialidade associada.</p>';
    }
}

/**
 * Preenche o modal com a lista de todas as especialidades, marcando as que o fisioterapeuta já possui.
 * @param {Array} especialidadesDoFisio - A lista de especialidades do profissional.
 */
function preencherModalEspecialidades(especialidadesDoFisio = []) {
    const container = document.getElementById('checkbox-container-especialidades');
    container.innerHTML = '';
    const idsAtuais = new Set(especialidadesDoFisio.map(e => e.idEspecialidade));

    todasEspecialidades.forEach(esp => {
        const isChecked = idsAtuais.has(esp.idEspecialidade) ? 'checked' : '';
        container.innerHTML += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${esp.idEspecialidade}" id="esp-${esp.idEspecialidade}" ${isChecked}>
                <label class="form-check-label" for="esp-${esp.idEspecialidade}">${esp.nome}</label>
            </div>`;
    });
}

/**
 * Calcula se a cor do texto sobre um fundo colorido deve ser preta ou branca para melhor contraste.
 * @param {string} hexcolor - A cor de fundo em formato hexadecimal.
 * @returns 'black' ou 'white'
 */
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}
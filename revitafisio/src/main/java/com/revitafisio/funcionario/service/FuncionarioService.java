package com.revitafisio.funcionario.service;

import com.revitafisio.entities.usuarios.Admin;
import com.revitafisio.entities.usuarios.Fisioterapeuta;
import com.revitafisio.entities.usuarios.Recepcionista;
import com.revitafisio.entities.usuarios.Usuario;
import com.revitafisio.records.AtualizarFuncionarioRequest;
import com.revitafisio.records.CriarFuncionarioRequest;
import com.revitafisio.records.FuncionarioResponse;
import com.revitafisio.repository.FuncionarioRepository;
import com.revitafisio.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuncionarioService {

    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;

    public FuncionarioService(UsuarioRepository usuarioRepository, FuncionarioRepository funcionarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public Integer criarFuncionario(CriarFuncionarioRequest request) {
        if (usuarioRepository.findByCpf(request.cpf()).isPresent()) {
            throw new RuntimeException("CPF já cadastrado.");
        }
        Usuario novoFuncionario;
        switch (request.tipo()) {
            case FISIOTERAPEUTA -> novoFuncionario = new Fisioterapeuta();
            case RECEPCIONISTA -> novoFuncionario = new Recepcionista();
            case ADMIN -> novoFuncionario = new Admin();
            default -> throw new IllegalArgumentException("Tipo de funcionário inválido: " + request.tipo());
        }
        novoFuncionario.setNome(request.nome());
        novoFuncionario.setCpf(request.cpf());
        novoFuncionario.setDataNascimento(request.dataNascimento());
        novoFuncionario.setSenha(request.senha()); // Senha em texto puro por enquanto
        novoFuncionario.setAtivo(true); // Garante que o usuário é criado como ativo

        var funcionarioSalvo = usuarioRepository.save(novoFuncionario);
        return funcionarioSalvo.getIdUsuario();
    }

    /**
     * Retorna uma lista com todos os funcionários (excluindo pacientes).
     */
    public List<FuncionarioResponse> buscarTodos() {
        return funcionarioRepository.findAllFuncionarios().stream()
                .map(this::toFuncionarioResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca os dados detalhados de um funcionário específico pelo ID.
     */
    public Usuario buscarDetalhesPorId(Integer id) {
        return funcionarioRepository.findFuncionarioById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
    }

    /**
     * Atualiza os dados de um funcionário.
     */
    @Transactional
    public Usuario atualizarFuncionario(Integer id, AtualizarFuncionarioRequest request) {
        var funcionario = buscarDetalhesPorId(id); // Reutiliza a busca
        funcionario.setNome(request.nome());
        funcionario.setDataNascimento(request.dataNascimento());
        return usuarioRepository.save(funcionario);
    }

    /**
     * Realiza a inativação lógica de um funcionário.
     */
    @Transactional
    public void inativarFuncionario(Integer id) {
        var funcionario = buscarDetalhesPorId(id); // Reutiliza a busca
        funcionario.setAtivo(false);
        usuarioRepository.save(funcionario);
    }

    /**
     * Realiza a ativação lógica de um funcionário.
     */
    @Transactional
    public void ativarFuncionario(Integer id) {
        var funcionario = buscarDetalhesPorId(id); // Reutiliza a busca
        funcionario.setAtivo(true);
        usuarioRepository.save(funcionario);
    }

    /**
     * Converte uma entidade Usuario para um DTO de resposta.
     */
    private FuncionarioResponse toFuncionarioResponse(Usuario usuario) {
        // Pega o nome simples da classe (Fisioterapeuta, Admin, etc.)
        String tipo = usuario.getClass().getSimpleName().toUpperCase();
        return new FuncionarioResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                tipo
        );
    }
}
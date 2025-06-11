package com.revitafisio.funcionario.service;

import com.revitafisio.entities.usuarios.Admin;
import com.revitafisio.entities.usuarios.Fisioterapeuta;
import com.revitafisio.entities.usuarios.Recepcionista;
import com.revitafisio.entities.usuarios.Usuario;
import com.revitafisio.records.AtualizarFuncionarioRequest;
import com.revitafisio.records.CriarFuncionarioRequest;
import com.revitafisio.records.FuncionarioResponse;
import com.revitafisio.repository.EspecialidadeRepository; // VERIFIQUE SE ESTE IMPORT ESTÁ CORRETO
import com.revitafisio.repository.FuncionarioRepository;
import com.revitafisio.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuncionarioService {

    private final UsuarioRepository usuarioRepository;
    private final FuncionarioRepository funcionarioRepository;
    // 1. ADICIONAR O CAMPO PARA GUARDAR O REPOSITÓRIO
    private final EspecialidadeRepository especialidadeRepository;

    // 2. ATUALIZAR O CONSTRUTOR PARA RECEBER A DEPENDÊNCIA
    public FuncionarioService(UsuarioRepository usuarioRepository,
                              FuncionarioRepository funcionarioRepository,
                              EspecialidadeRepository especialidadeRepository) {
        this.usuarioRepository = usuarioRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.especialidadeRepository = especialidadeRepository;
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
        novoFuncionario.setSenha(request.senha());
        novoFuncionario.setAtivo(true);

        var funcionarioSalvo = usuarioRepository.save(novoFuncionario);
        return funcionarioSalvo.getIdUsuario();
    }

    // ... (métodos buscarTodos, buscarDetalhesPorId, etc. continuam iguais)

    @Transactional
    public Fisioterapeuta atualizarEspecialidades(Integer idFisioterapeuta, List<Integer> idEspecialidades) {
        var fisio = (Fisioterapeuta) funcionarioRepository.findFuncionarioById(idFisioterapeuta)
                .orElseThrow(() -> new RuntimeException("Fisioterapeuta não encontrado"));

        // 3. CORRIGIR A CHAMADA PARA USAR O OBJETO injetado ("this.especialidadeRepository")
        var especialidades = new HashSet<>(this.especialidadeRepository.findAllById(idEspecialidades));

        fisio.setEspecialidades(especialidades);
        return usuarioRepository.save(fisio);
    }

    // Demais métodos sem alteração...
    public List<FuncionarioResponse> buscarTodos() {
        return funcionarioRepository.findAllFuncionarios().stream()
                .map(this::toFuncionarioResponse)
                .collect(Collectors.toList());
    }

    public Usuario buscarDetalhesPorId(Integer id) {
        return funcionarioRepository.findFuncionarioById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
    }

    @Transactional
    public Usuario atualizarFuncionario(Integer id, AtualizarFuncionarioRequest request) {
        var funcionario = buscarDetalhesPorId(id);
        funcionario.setNome(request.nome());
        funcionario.setDataNascimento(request.dataNascimento());
        return usuarioRepository.save(funcionario);
    }

    @Transactional
    public void inativarFuncionario(Integer id) {
        var funcionario = buscarDetalhesPorId(id);
        funcionario.setAtivo(false);
        usuarioRepository.save(funcionario);
    }

    @Transactional
    public void ativarFuncionario(Integer id) {
        var funcionario = buscarDetalhesPorId(id);
        funcionario.setAtivo(true);
        usuarioRepository.save(funcionario);
    }

    private FuncionarioResponse toFuncionarioResponse(Usuario usuario) {
        String tipo = usuario.getClass().getSimpleName().toUpperCase();
        return new FuncionarioResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                tipo
        );
    }
}
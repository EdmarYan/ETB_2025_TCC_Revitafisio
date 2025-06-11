package com.revitafisio.funcionario.service;

import com.revitafisio.entities.usuarios.Admin;
import com.revitafisio.entities.usuarios.Fisioterapeuta;
import com.revitafisio.entities.usuarios.Recepcionista;
import com.revitafisio.entities.usuarios.Usuario;
import com.revitafisio.records.AtualizarFuncionarioRequest;
import com.revitafisio.records.CriarFuncionarioRequest;
import com.revitafisio.records.FuncionarioDetalhesResponse;
import com.revitafisio.records.FuncionarioResponse;
import com.revitafisio.repository.EspecialidadeRepository;
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
    private final EspecialidadeRepository especialidadeRepository;

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

    public List<FuncionarioResponse> buscarTodos() {
        return funcionarioRepository.findAllFuncionarios().stream()
                .map(this::toFuncionarioResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FuncionarioDetalhesResponse buscarDetalhesPorId(Integer id) {
        var funcionario = funcionarioRepository.findFuncionarioById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
        return FuncionarioDetalhesResponse.from(funcionario);
    }

    @Transactional
    public FuncionarioDetalhesResponse atualizarFuncionario(Integer id, AtualizarFuncionarioRequest request) {
        var funcionario = funcionarioRepository.findFuncionarioById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
        funcionario.setNome(request.nome());
        funcionario.setDataNascimento(request.dataNascimento());
        var salvo = usuarioRepository.save(funcionario);
        return FuncionarioDetalhesResponse.from(salvo);
    }

    @Transactional
    public void inativarFuncionario(Integer id) {
        var funcionario = funcionarioRepository.findFuncionarioById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
        funcionario.setAtivo(false);
        usuarioRepository.save(funcionario);
    }

    @Transactional
    public void ativarFuncionario(Integer id) {
        var funcionario = funcionarioRepository.findFuncionarioById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com o ID: " + id));
        funcionario.setAtivo(true);
        usuarioRepository.save(funcionario);
    }

    @Transactional
    public Fisioterapeuta atualizarEspecialidades(Integer idFisioterapeuta, List<Integer> idEspecialidades) {
        var fisio = (Fisioterapeuta) funcionarioRepository.findFuncionarioById(idFisioterapeuta)
                .orElseThrow(() -> new RuntimeException("Fisioterapeuta não encontrado"));
        var especialidades = new HashSet<>(this.especialidadeRepository.findAllById(idEspecialidades));
        fisio.setEspecialidades(especialidades);
        return usuarioRepository.save(fisio);
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
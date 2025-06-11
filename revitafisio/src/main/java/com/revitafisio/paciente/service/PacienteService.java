package com.revitafisio.paciente.service;

import com.revitafisio.entities.usuarios.Contato;
import com.revitafisio.entities.usuarios.Paciente;
import com.revitafisio.repository.PacienteRepository;
import com.revitafisio.records.AtualizarPacienteRequest;    // Import do novo DTO
import com.revitafisio.records.CriarContatoRequest;
import com.revitafisio.records.CriarPacienteRequest;
import com.revitafisio.records.PacienteDetalhesResponse;  // Import do novo DTO
import com.revitafisio.records.PacienteResponse;
import com.revitafisio.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PacienteService {

    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;

    public PacienteService(UsuarioRepository usuarioRepository, PacienteRepository pacienteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
    }

    @Transactional
    public Integer criarPaciente(CriarPacienteRequest request) {
        if (usuarioRepository.findByCpf(request.cpf()).isPresent()) {
            throw new RuntimeException("CPF já cadastrado.");
        }
        var novoPaciente = new Paciente();
        novoPaciente.setNome(request.nome());
        novoPaciente.setCpf(request.cpf());
        novoPaciente.setDataNascimento(request.dataNascimento());
        novoPaciente.setSenha(request.senha());

        if (request.contatos() != null && !request.contatos().isEmpty()) {
            var contatos = request.contatos().stream()
                    .map(dto -> toContatoEntity(dto, novoPaciente))
                    .collect(Collectors.toSet());
            novoPaciente.setContatos(contatos);
        }
        var pacienteSalvo = usuarioRepository.save(novoPaciente);
        return pacienteSalvo.getIdUsuario();
    }

    public List<PacienteResponse> buscarPorNome(String nome) {
        var pacientes = pacienteRepository.findByNomeContainingIgnoreCase(nome);
        return pacientes.stream()
                .map(this::toPacienteResponse)
                .toList();
    }

    public PacienteDetalhesResponse buscarPorId(Integer id) {
        var paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));
        return toPacienteDetalhesResponse(paciente);
    }

    @Transactional
    public PacienteDetalhesResponse atualizarPaciente(Integer id, AtualizarPacienteRequest request) {
        var paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));

        paciente.setNome(request.nome());
        paciente.setDataNascimento(request.dataNascimento());
        var pacienteSalvo = usuarioRepository.save(paciente);
        return toPacienteDetalhesResponse(pacienteSalvo);
    }

    @Transactional
    public void inativarPaciente(Integer id) {
        var paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));
        paciente.setAtivo(false);
        usuarioRepository.save(paciente);
    }
    @Transactional
    public void ativarPaciente(Integer id) {
        var paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));
        // A única diferença é que definimos 'ativo' como true
        paciente.setAtivo(true);
        usuarioRepository.save(paciente);
    }

    // Métodos auxiliares
    private Contato toContatoEntity(CriarContatoRequest dto, Paciente paciente) {
        var contato = new Contato();
        contato.setUsuario(paciente);
        contato.setTipo(dto.tipo());
        contato.setValor(dto.valor());
        contato.setPrincipal(dto.principal());
        return contato;
    }

    private PacienteResponse toPacienteResponse(Paciente paciente) {
        return new PacienteResponse(
                paciente.getIdUsuario(),
                paciente.getNome(),
                paciente.getCpf()
        );
    }

    private PacienteDetalhesResponse toPacienteDetalhesResponse(Paciente paciente) {
        return new PacienteDetalhesResponse(
                paciente.getIdUsuario(),
                paciente.getNome(),
                paciente.getCpf(),
                paciente.getDataNascimento(),
                paciente.isAtivo(),
                paciente.getContatos()
        );
    }
    // NOVO METODO - READ (Buscar Todos)
    public List<PacienteResponse> buscarTodos() {
        // Usa o metodo findAll() que já vem com o JpaRepository
        var pacientes = pacienteRepository.findAll();
        // Converte a lista de Entidades para a lista de DTOs
        return pacientes.stream()
                .map(this::toPacienteResponse)
                .toList();
    }
}
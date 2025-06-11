package com.revitafisio.paciente.service;

import com.revitafisio.entities.paciente.Evolucao;
import com.revitafisio.records.CriarEvolucaoRequest;
import com.revitafisio.records.EvolucaoResponse;
import com.revitafisio.repository.EvolucaoRepository;
import com.revitafisio.repository.FuncionarioRepository;
import com.revitafisio.repository.PacienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EvolucaoService {

    private final EvolucaoRepository evolucaoRepository;
    private final PacienteRepository pacienteRepository;
    private final FuncionarioRepository funcionarioRepository;

    public EvolucaoService(EvolucaoRepository evolucaoRepository, PacienteRepository pacienteRepository, FuncionarioRepository funcionarioRepository) {
        this.evolucaoRepository = evolucaoRepository;
        this.pacienteRepository = pacienteRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public EvolucaoResponse salvarEvolucao(CriarEvolucaoRequest request) {
        var paciente = pacienteRepository.findById(request.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));

        var fisioterapeuta = funcionarioRepository.findFuncionarioById(request.idFisioterapeuta())
                .orElseThrow(() -> new RuntimeException("Fisioterapeuta não encontrado."));

        var evolucao = new Evolucao();
        evolucao.setPaciente(paciente);
        evolucao.setFisioterapeuta(fisioterapeuta);
        evolucao.setDescricao(request.descricao());
        evolucao.setData(LocalDate.now()); // Pega a data atual
        evolucao.setPreenchida(true); // Marca como preenchida

        var evolucaoSalva = evolucaoRepository.save(evolucao);

        return new EvolucaoResponse(evolucaoSalva);
    }

    @Transactional(readOnly = true)
    public List<EvolucaoResponse> listarEvolucoesPorPaciente(Integer idPaciente) {
        return evolucaoRepository.findByPacienteIdUsuarioOrderByDataDesc(idPaciente)
                .stream()
                .map(EvolucaoResponse::new)
                .collect(Collectors.toList());
    }
}
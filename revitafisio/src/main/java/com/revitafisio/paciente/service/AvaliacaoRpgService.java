package com.revitafisio.paciente.service;

import com.revitafisio.entities.paciente.AvaliacaoRpg;
import com.revitafisio.records.AvaliacaoRpgRequest;
import com.revitafisio.repository.AvaliacaoRpgRepository;
import com.revitafisio.repository.FuncionarioRepository;
import com.revitafisio.repository.PacienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AvaliacaoRpgService {

    private final AvaliacaoRpgRepository avaliacaoRepository;
    private final PacienteRepository pacienteRepository;
    private final FuncionarioRepository funcionarioRepository;

    public AvaliacaoRpgService(AvaliacaoRpgRepository avaliacaoRepository, PacienteRepository pacienteRepository, FuncionarioRepository funcionarioRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.pacienteRepository = pacienteRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public AvaliacaoRpg salvar(AvaliacaoRpgRequest request) {
        var paciente = pacienteRepository.findById(request.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));
        var fisioterapeuta = funcionarioRepository.findById(request.idFisioterapeuta())
                .orElseThrow(() -> new RuntimeException("Fisioterapeuta não encontrado."));

        AvaliacaoRpg avaliacao = avaliacaoRepository.findByPacienteIdUsuario(request.idPaciente())
                .orElse(new AvaliacaoRpg());

        // Mapeamento de todos os campos do Request para a Entidade
        avaliacao.setPaciente(paciente);
        avaliacao.setFisioterapeuta(fisioterapeuta);
        if (avaliacao.getDataAvaliacao() == null) {
            avaliacao.setDataAvaliacao(LocalDate.now());
        }

        // Campos de Texto
        avaliacao.setDiagnostico_clinico(request.diagnostico_clinico());
        avaliacao.setHma(request.hma());
        avaliacao.setPosicao_dor(request.posicao_dor());
        avaliacao.setOutras_patologias(request.outras_patologias());
        avaliacao.setOutros_exames(request.outros_exames());
        avaliacao.setMedicamentos_descricao(request.medicamentos_descricao());
        avaliacao.setOutros_desequilibrios(request.outros_desequilibrios());
        avaliacao.setTratamento_proposto(request.tratamento_proposto());
        avaliacao.setObservacoes(request.observacoes());

        // Campos Booleanos
        avaliacao.setRessonancia_magnetica(request.ressonancia_magnetica());
        avaliacao.setRaio_x(request.raio_x());
        avaliacao.setTomografia(request.tomografia());
        avaliacao.setUso_medicamentos(request.uso_medicamentos());

        // Campos Enum
        avaliacao.setGrau_dor(request.grau_dor());
        avaliacao.setCabeca(request.cabeca());
        avaliacao.setOmbros(request.ombros());
        avaliacao.setMaos(request.maos());
        avaliacao.setEias(request.eias());
        avaliacao.setJoelhos(request.joelhos());
        avaliacao.setLombar(request.lombar());
        avaliacao.setPelve(request.pelve());
        avaliacao.setEscapulas(request.escapulas());

        return avaliacaoRepository.save(avaliacao);
    }

    @Transactional(readOnly = true)
    public Optional<AvaliacaoRpg> buscarPorPaciente(Integer idPaciente) {
        return avaliacaoRepository.findByPacienteIdUsuario(idPaciente);
    }
}
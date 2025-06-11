package com.revitafisio.paciente.service;

import com.revitafisio.entities.paciente.AvaliacaoOrtopedia;
import com.revitafisio.records.AvaliacaoOrtopediaRequest;
import com.revitafisio.repository.AvaliacaoOrtopediaRepository;
import com.revitafisio.repository.FuncionarioRepository;
import com.revitafisio.repository.PacienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AvaliacaoOrtopediaService {

    private final AvaliacaoOrtopediaRepository avaliacaoRepository;
    private final PacienteRepository pacienteRepository;
    private final FuncionarioRepository funcionarioRepository;

    public AvaliacaoOrtopediaService(AvaliacaoOrtopediaRepository avaliacaoRepository, PacienteRepository pacienteRepository, FuncionarioRepository funcionarioRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.pacienteRepository = pacienteRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public AvaliacaoOrtopedia salvar(AvaliacaoOrtopediaRequest request) {
        var paciente = pacienteRepository.findById(request.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));
        var fisioterapeuta = funcionarioRepository.findById(request.idFisioterapeuta())
                .orElseThrow(() -> new RuntimeException("Fisioterapeuta não encontrado."));

        // Verifica se já existe uma avaliação para este paciente para decidir se cria uma nova ou atualiza.
        AvaliacaoOrtopedia avaliacao = avaliacaoRepository.findByPacienteIdUsuario(request.idPaciente())
                .orElse(new AvaliacaoOrtopedia());

        // Mapeia todos os campos do DTO para a Entidade
        avaliacao.setPaciente(paciente);
        avaliacao.setFisioterapeuta(fisioterapeuta);
        if (avaliacao.getDataAvaliacao() == null) {
            avaliacao.setDataAvaliacao(LocalDate.now());
        }
        avaliacao.setProfissao(request.profissao());
        avaliacao.setPressao_arterial(request.pressao_arterial());
        avaliacao.setAvaliacao_postural(request.avaliacao_postural());
        avaliacao.setAlergias(request.alergias());
        avaliacao.setIndicacao_medica(request.indicacao_medica());
        avaliacao.setQueixa_principal(request.queixa_principal());
        avaliacao.setHda_hdp(request.hda_hdp());
        avaliacao.setDoencas_cardiacas(request.doencas_cardiacas());
        avaliacao.setComorbidades(request.comorbidades());
        avaliacao.setMedicacoes(request.medicacoes());
        avaliacao.setDiagnostico_fisioterapeutico(request.diagnostico_fisioterapeutico());
        avaliacao.setObjetivos(request.objetivos());
        avaliacao.setConduta(request.conduta());
        avaliacao.setObservacoes(request.observacoes());
        avaliacao.setFrequencia_cardiaca(request.frequencia_cardiaca());
        avaliacao.setFrequencia_respiratoria(request.frequencia_respiratoria());
        avaliacao.setTemperatura(request.temperatura());

        return avaliacaoRepository.save(avaliacao);
    }

    @Transactional(readOnly = true)
    public Optional<AvaliacaoOrtopedia> buscarPorPaciente(Integer idPaciente) {
        return avaliacaoRepository.findByPacienteIdUsuario(idPaciente);
    }
}
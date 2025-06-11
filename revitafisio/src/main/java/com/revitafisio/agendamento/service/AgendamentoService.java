package com.revitafisio.agendamento.service;

import com.revitafisio.entities.agendamentos.Agendamento;
import com.revitafisio.entities.agendamentos.HorarioDisponivel;
import com.revitafisio.records.AgendamentoResponse;
import com.revitafisio.records.CriarAgendamentoRequest;
import com.revitafisio.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final EspecialidadeRepository especialidadeRepository;
    private final HorarioDisponivelRepository horarioDisponivelRepository; // Repositório adicionado

    public AgendamentoService(AgendamentoRepository agendamentoRepository, PacienteRepository pacienteRepository, UsuarioRepository usuarioRepository, EspecialidadeRepository especialidadeRepository, HorarioDisponivelRepository horarioDisponivelRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.especialidadeRepository = especialidadeRepository;
        this.horarioDisponivelRepository = horarioDisponivelRepository;
    }

    @Transactional
    public AgendamentoResponse criarAgendamento(CriarAgendamentoRequest request) {
        var paciente = pacienteRepository.findById(request.idPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado."));
        var fisioterapeuta = usuarioRepository.findById(request.idFisioterapeuta())
                .orElseThrow(() -> new RuntimeException("Fisioterapeuta não encontrado."));
        var especialidade = especialidadeRepository.findById(request.idEspecialidade())
                .orElseThrow(() -> new RuntimeException("Especialidade não encontrada."));

        // 1. Encontra o slot de horário disponível correspondente
        List<HorarioDisponivel> horariosDoDia = horarioDisponivelRepository.findByFisioterapeutaIdUsuarioAndData(
                request.idFisioterapeuta(),
                request.dataHoraInicio().toLocalDate()
        );

        HorarioDisponivel slotParaAgendar = horariosDoDia.stream()
                .filter(h -> h.getHoraInicio().equals(request.dataHoraInicio().toLocalTime()) && h.isDisponivel())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Horário não está disponível."));

        // 2. Marca o slot como indisponível
        slotParaAgendar.setDisponivel(false);
        horarioDisponivelRepository.save(slotParaAgendar);

        // 3. Cria o agendamento
        var novoAgendamento = new Agendamento();
        novoAgendamento.setPaciente(paciente);
        novoAgendamento.setFisioterapeuta(fisioterapeuta);
        novoAgendamento.setEspecialidade(especialidade);
        novoAgendamento.setDataHoraInicio(request.dataHoraInicio());
        novoAgendamento.setDataHoraFim(request.dataHoraFim());
        novoAgendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);

        var agendamentoSalvo = agendamentoRepository.save(novoAgendamento);

        return new AgendamentoResponse(agendamentoSalvo);
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> buscarAgenda(Integer idFisioterapeuta, LocalDateTime inicio, LocalDateTime fim) {
        return agendamentoRepository.findByFisioterapeutaAndPeriodo(idFisioterapeuta, inicio, fim)
                .stream()
                .map(AgendamentoResponse::new)
                .collect(Collectors.toList());
    }
}
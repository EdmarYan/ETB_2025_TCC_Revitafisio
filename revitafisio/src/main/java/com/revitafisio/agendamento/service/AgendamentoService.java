package com.revitafisio.agendamento.service;

import com.revitafisio.entities.agendamentos.Agendamento;
import com.revitafisio.entities.agendamentos.HorarioDisponivel;
import com.revitafisio.records.AgendamentoResponse;
import com.revitafisio.records.CriarAgendamentoRequest;
import com.revitafisio.repository.*;
import jakarta.persistence.EntityNotFoundException;
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
    private final HorarioDisponivelRepository horarioDisponivelRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository, PacienteRepository pacienteRepository, UsuarioRepository usuarioRepository, EspecialidadeRepository especialidadeRepository, HorarioDisponivelRepository horarioDisponivelRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.especialidadeRepository = especialidadeRepository;
        this.horarioDisponivelRepository = horarioDisponivelRepository;
    }

    /**
     * (MÉTODO CORRIGIDO)
     * A lógica agora é compatível com a Lista de horários retornada pelo repositório.
     */
    @Transactional
    public AgendamentoResponse criarAgendamento(CriarAgendamentoRequest request) {
        // 1. A variável agora é uma Lista para receber o resultado do repositório.
        List<HorarioDisponivel> slotsEncontrados = horarioDisponivelRepository.findByFisioterapeutaIdUsuarioAndDataAndHoraInicio(
                request.idFisioterapeuta(),
                request.dataHoraInicio().toLocalDate(),
                request.dataHoraInicio().toLocalTime()
        );

        // 2. A lógica agora pega o primeiro item disponível da LISTA.
        HorarioDisponivel slotParaAgendar = slotsEncontrados.stream()
                .filter(HorarioDisponivel::isDisponivel)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Horário não está disponível ou não existe."));

        slotParaAgendar.setDisponivel(false);
        horarioDisponivelRepository.save(slotParaAgendar);

        try {
            var pacienteRef = pacienteRepository.getReferenceById(request.idPaciente());
            var fisioterapeutaRef = usuarioRepository.getReferenceById(request.idFisioterapeuta());
            var especialidadeRef = especialidadeRepository.getReferenceById(request.idEspecialidade());

            var novoAgendamento = new Agendamento();
            novoAgendamento.setPaciente(pacienteRef);
            novoAgendamento.setFisioterapeuta(fisioterapeutaRef);
            novoAgendamento.setEspecialidade(especialidadeRef);
            novoAgendamento.setDataHoraInicio(request.dataHoraInicio());
            novoAgendamento.setDataHoraFim(request.dataHoraFim());
            novoAgendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
            var agendamentoSalvo = agendamentoRepository.save(novoAgendamento);
            return new AgendamentoResponse(agendamentoSalvo);
        } catch (EntityNotFoundException e) {
            throw new RuntimeException("Falha ao criar agendamento: Paciente, Fisioterapeuta ou Especialidade não encontrado.", e);
        }
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> buscarAgenda(Integer idFisioterapeuta, LocalDateTime inicio, LocalDateTime fim) {
        return agendamentoRepository.findByFisioterapeuta_IdUsuarioAndDataHoraInicioGreaterThanEqualAndDataHoraFimLessThanEqual(idFisioterapeuta, inicio, fim)
                .stream().map(AgendamentoResponse::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponse> buscarAgendamentosPendentesDeStatus() {
        LocalDateTime agora = LocalDateTime.now();
        return agendamentoRepository.findAllByStatusAndDataHoraInicioBefore(
                        Agendamento.StatusAgendamento.CONFIRMADO, agora)
                .stream().map(AgendamentoResponse::new).collect(Collectors.toList());
    }

    @Transactional
    public void atualizarStatus(Integer agendamentoId, String novoStatusStr) {
        Agendamento.StatusAgendamento novoStatus = Agendamento.StatusAgendamento.valueOf(novoStatusStr.toUpperCase());
        var agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado."));
        Agendamento.StatusAgendamento statusAnterior = agendamento.getStatus();
        if (novoStatus == Agendamento.StatusAgendamento.CANCELADO && statusAnterior != Agendamento.StatusAgendamento.CANCELADO) {
            liberarHorario(agendamento);
        }

        agendamento.setStatus(novoStatus);
        agendamentoRepository.save(agendamento);
    }


     //A lógica agora espera e processa uma Lista de horários.

    private void liberarHorario(Agendamento agendamento) {
        List<HorarioDisponivel> slots = horarioDisponivelRepository.findByFisioterapeutaIdUsuarioAndDataAndHoraInicio(
                agendamento.getFisioterapeuta().getIdUsuario(),
                agendamento.getDataHoraInicio().toLocalDate(),
                agendamento.getDataHoraInicio().toLocalTime()
        );
        slots.forEach(slot -> slot.setDisponivel(true));
        if (!slots.isEmpty()) {
            horarioDisponivelRepository.saveAll(slots);
        }
    }
}
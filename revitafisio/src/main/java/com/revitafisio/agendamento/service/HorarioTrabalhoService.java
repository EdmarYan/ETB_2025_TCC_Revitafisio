package com.revitafisio.agendamento.service;

import com.revitafisio.entities.agendamentos.HorarioDisponivel;
import com.revitafisio.entities.agendamentos.HorarioTrabalho;
import com.revitafisio.records.HorarioTrabalhoRequest;
import com.revitafisio.records.HorarioTrabalhoResponse;
import com.revitafisio.repository.FuncionarioRepository;
import com.revitafisio.repository.HorarioDisponivelRepository;
import com.revitafisio.repository.HorarioTrabalhoRepository;
import org.slf4j.Logger; // Import do Logger
import org.slf4j.LoggerFactory; // Import do Logger
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HorarioTrabalhoService {

    // Adicionado um Logger para nos ajudar a depurar
    private static final Logger logger = LoggerFactory.getLogger(HorarioTrabalhoService.class);

    private final HorarioTrabalhoRepository horarioTrabalhoRepository;
    private final HorarioDisponivelRepository horarioDisponivelRepository;
    private final FuncionarioRepository funcionarioRepository;

    public HorarioTrabalhoService(HorarioTrabalhoRepository horarioTrabalhoRepository, HorarioDisponivelRepository horarioDisponivelRepository, FuncionarioRepository funcionarioRepository) {
        this.horarioTrabalhoRepository = horarioTrabalhoRepository;
        this.horarioDisponivelRepository = horarioDisponivelRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public HorarioTrabalhoResponse adicionarHorario(HorarioTrabalhoRequest request) {
        if (!request.horaFim().isAfter(request.horaInicio())) {
            throw new RuntimeException("O horário de fim deve ser posterior ao horário de início.");
        }
        List<HorarioTrabalho> horariosExistentes = horarioTrabalhoRepository.findByFisioterapeuta_IdUsuarioAndDiaDaSemana(
                request.idFisioterapeuta(),
                request.diaDaSemana()
        );
        for (HorarioTrabalho existente : horariosExistentes) {
            boolean haConflito = request.horaInicio().isBefore(existente.getHoraFim()) &&
                    existente.getHoraInicio().isBefore(request.horaFim());
            if (haConflito) {
                throw new RuntimeException(
                        "Conflito de horário! O período de " + request.horaInicio() + " às " + request.horaFim() +
                                " se sobrepõe ao horário já cadastrado de " + existente.getHoraInicio() + " às " + existente.getHoraFim() + "."
                );
            }
        }
        var fisioterapeuta = funcionarioRepository.getReferenceById(request.idFisioterapeuta());
        var novoHorario = new HorarioTrabalho();
        novoHorario.setFisioterapeuta(fisioterapeuta);
        novoHorario.setDiaDaSemana(request.diaDaSemana());
        novoHorario.setHoraInicio(request.horaInicio());
        novoHorario.setHoraFim(request.horaFim());
        var horarioSalvo = horarioTrabalhoRepository.save(novoHorario);
        return new HorarioTrabalhoResponse(horarioSalvo);
    }

    @Transactional
    public void gerarDisponibilidadeParaMes(Integer idFisioterapeuta, int ano, int mes) {
        logger.info("Iniciando geração de agenda para Fisioterapeuta ID: {}, Mês/Ano: {}/{}", idFisioterapeuta, mes, ano);
        var fisioterapeuta = funcionarioRepository.getReferenceById(idFisioterapeuta);
        YearMonth anoMes = YearMonth.of(ano, mes);
        LocalDate primeiroDiaDoMes = anoMes.atDay(1);
        LocalDate ultimoDiaDoMes = anoMes.atEndOfMonth();

        logger.info("Apagando horários existentes entre {} e {}", primeiroDiaDoMes, ultimoDiaDoMes);
        horarioDisponivelRepository.deleteByFisioterapeutaIdUsuarioAndDataBetween(idFisioterapeuta, primeiroDiaDoMes, ultimoDiaDoMes);

        List<HorarioTrabalho> gradeDeTrabalho = horarioTrabalhoRepository.findByFisioterapeutaIdUsuario(idFisioterapeuta);
        if (gradeDeTrabalho.isEmpty()) {
            logger.warn("Fisioterapeuta ID: {} não possui grade de trabalho. Nenhum horário será gerado.", idFisioterapeuta);
            throw new RuntimeException("O fisioterapeuta não possui uma grade de trabalho definida.");
        }
        logger.info("Encontrados {} templates de trabalho para o fisioterapeuta.", gradeDeTrabalho.size());

        List<HorarioDisponivel> novosHorarios = new ArrayList<>();
        for (LocalDate dataAtual = primeiroDiaDoMes; !dataAtual.isAfter(ultimoDiaDoMes); dataAtual = dataAtual.plusDays(1)) {
            DayOfWeek diaDaSemanaAtual = dataAtual.getDayOfWeek();
            for (HorarioTrabalho template : gradeDeTrabalho) {
                if (template.getDiaDaSemana() == diaDaSemanaAtual) {
                    logger.info("Combinou o dia {} ({}) com o template para {}", dataAtual, diaDaSemanaAtual, template.getDiaDaSemana());
                    LocalTime slot = template.getHoraInicio();
                    while (slot.isBefore(template.getHoraFim())) {
                        var horarioDisponivel = new HorarioDisponivel();
                        horarioDisponivel.setFisioterapeuta(fisioterapeuta);
                        horarioDisponivel.setData(dataAtual);
                        horarioDisponivel.setHoraInicio(slot);
                        horarioDisponivel.setHoraFim(slot.plusHours(1));
                        horarioDisponivel.setDisponivel(true);
                        novosHorarios.add(horarioDisponivel);
                        logger.info("-> Gerado slot em {} das {} às {}", dataAtual, slot, slot.plusHours(1));
                        slot = slot.plusHours(1);
                    }
                }
            }
        }
        horarioDisponivelRepository.saveAll(novosHorarios);
        logger.info("Geração finalizada. {} novos horários salvos no banco de dados.", novosHorarios.size());
    }

    // Métodos restantes do serviço (sem alterações)
    @Transactional(readOnly = true)
    public List<HorarioTrabalhoResponse> listarHorariosPorFisioterapeuta(Integer idFisioterapeuta) {
        return horarioTrabalhoRepository.findByFisioterapeutaIdUsuario(idFisioterapeuta)
                .stream()
                .map(HorarioTrabalhoResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removerHorario(Integer idHorario) {
        if (!horarioTrabalhoRepository.existsById(idHorario)) {
            throw new RuntimeException("Horário de trabalho não encontrado.");
        }
        horarioTrabalhoRepository.deleteById(idHorario);
    }
}
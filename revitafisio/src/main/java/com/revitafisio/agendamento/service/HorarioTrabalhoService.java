package com.revitafisio.agendamento.service;

import com.revitafisio.entities.agendamentos.HorarioDisponivel;
import com.revitafisio.entities.agendamentos.HorarioTrabalho;
import com.revitafisio.entities.usuarios.Fisioterapeuta;
import com.revitafisio.entities.usuarios.Usuario;
import com.revitafisio.records.HorarioTrabalhoRequest;
import com.revitafisio.records.HorarioTrabalhoResponse;
import com.revitafisio.repository.FuncionarioRepository;
import com.revitafisio.repository.HorarioDisponivelRepository;
import com.revitafisio.repository.HorarioTrabalhoRepository;
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
        // MUDANÇA IMPORTANTE: Em vez de buscar o objeto completo, pegamos uma "referência" gerenciada pelo JPA.
        // Isso é mais eficiente e garante a integridade da chave estrangeira.
        var fisioterapeuta = funcionarioRepository.getReferenceById(request.idFisioterapeuta());

        var novoHorario = new HorarioTrabalho();
        novoHorario.setFisioterapeuta(fisioterapeuta); // Associa a referência
        novoHorario.setDiaDaSemana(request.diaDaSemana());
        novoHorario.setHoraInicio(request.horaInicio());
        novoHorario.setHoraFim(request.horaFim());

        var horarioSalvo = horarioTrabalhoRepository.save(novoHorario);
        return new HorarioTrabalhoResponse(horarioSalvo);
    }

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

    @Transactional
    public void gerarDisponibilidadeParaMes(Integer idFisioterapeuta, int ano, int mes) {
        // A mesma mudança aqui para segurança
        var fisioterapeuta = funcionarioRepository.getReferenceById(idFisioterapeuta);

        YearMonth anoMes = YearMonth.of(ano, mes);
        LocalDate primeiroDiaDoMes = anoMes.atDay(1);
        LocalDate ultimoDiaDoMes = anoMes.atEndOfMonth();

        horarioDisponivelRepository.deleteByFisioterapeutaIdUsuarioAndDataBetween(idFisioterapeuta, primeiroDiaDoMes, ultimoDiaDoMes);

        List<HorarioTrabalho> gradeDeTrabalho = horarioTrabalhoRepository.findByFisioterapeutaIdUsuario(idFisioterapeuta);
        if (gradeDeTrabalho.isEmpty()) {
            throw new RuntimeException("O fisioterapeuta não possui uma grade de trabalho definida.");
        }

        List<HorarioDisponivel> novosHorarios = new ArrayList<>();
        for (LocalDate dataAtual = primeiroDiaDoMes; !dataAtual.isAfter(ultimoDiaDoMes); dataAtual = dataAtual.plusDays(1)) {
            DayOfWeek diaDaSemanaAtual = dataAtual.getDayOfWeek();

            for (HorarioTrabalho template : gradeDeTrabalho) {
                if (template.getDiaDaSemana() == diaDaSemanaAtual) {
                    LocalTime slot = template.getHoraInicio();
                    while (slot.isBefore(template.getHoraFim())) {
                        var horarioDisponivel = new HorarioDisponivel();
                        horarioDisponivel.setFisioterapeuta(fisioterapeuta);
                        horarioDisponivel.setData(dataAtual);
                        horarioDisponivel.setHoraInicio(slot);
                        horarioDisponivel.setHoraFim(slot.plusHours(1));
                        horarioDisponivel.setDisponivel(true);
                        novosHorarios.add(horarioDisponivel);
                        slot = slot.plusHours(1);
                    }
                }
            }
        }

        horarioDisponivelRepository.saveAll(novosHorarios);
    }
}
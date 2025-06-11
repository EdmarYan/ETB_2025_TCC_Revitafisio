package com.revitafisio.entities.paciente;

import com.revitafisio.entities.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "avaliacao_ortopedia")
@Table(name = "avaliacao_ortopedia")
public class AvaliacaoOrtopedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_avaliacao")
    private Integer idAvaliacao;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private Usuario paciente;

    @ManyToOne
    @JoinColumn(name = "id_fisioterapeuta", nullable = false)
    private Usuario fisioterapeuta;

    @Column(name = "data_avaliacao", nullable = false)
    private LocalDate dataAvaliacao;

    // --- Campos de Texto ---
    private String profissao;
    private String pressao_arterial;
    private String avaliacao_postural;
    @Lob private String alergias;
    @Lob private String indicacao_medica;
    @Lob private String queixa_principal;
    @Lob private String hda_hdp;
    @Lob private String doencas_cardiacas;
    @Lob private String comorbidades;
    @Lob private String medicacoes;
    @Lob private String diagnostico_fisioterapeutico;
    @Lob private String objetivos;
    @Lob private String conduta;
    @Lob private String observacoes;

    // --- Campos Numéricos ---
    private Integer frequencia_cardiaca;
    private Integer frequencia_respiratoria;
    private BigDecimal temperatura;
}
package com.revitafisio.entities.paciente;

import com.revitafisio.entities.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "avaliacao_rpg")
public class AvaliacaoRpg {

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
    private String diagnostico_clinico;
    @Column(columnDefinition = "TEXT") private String hma;
    private String posicao_dor;
    @Column(columnDefinition = "TEXT") private String outras_patologias;
    private String outros_exames;
    private String medicamentos_descricao;
    @Column(columnDefinition = "TEXT") private String outros_desequilibrios;
    @Column(columnDefinition = "TEXT") private String tratamento_proposto;
    @Column(columnDefinition = "TEXT") private String observacoes;

    // ### MUDANÇA AQUI: de 'boolean' para 'Boolean' ###
    private Boolean ressonancia_magnetica;
    private Boolean raio_x;
    private Boolean tomografia;
    private Boolean uso_medicamentos;

    // --- Campos com Enums (sem alteração) ---
    @Enumerated(EnumType.STRING) private GrauDor grau_dor;
    @Enumerated(EnumType.STRING) private PosicaoCabeca cabeca;
    @Enumerated(EnumType.STRING) private NivelamentoOmbros ombros;
    @Enumerated(EnumType.STRING) private SimetriaMaos maos;
    @Enumerated(EnumType.STRING) private SimetriaEias eias;
    @Enumerated(EnumType.STRING) private PosicaoJoelhos joelhos;
    @Enumerated(EnumType.STRING) private CurvaturaLombar lombar;
    @Enumerated(EnumType.STRING) private PosicaoPelve pelve;
    @Enumerated(EnumType.STRING) private PosicaoEscapulas escapulas;

    // Enums (sem alteração)
    public enum GrauDor { LEVE, MODERADA, INTENSA }
    public enum PosicaoCabeca { ALINHADA, RODADA_DIREITA, RODADA_ESQUERDA, INCLINADA_ESQUERDA, INCLINADA_DIREITA }
    public enum NivelamentoOmbros { NIVELADOS, ESQUERDO_ELEVADO, DIREITO_ELEVADO }
    public enum SimetriaMaos { SIMETRICOS, DIREITA_ALTA, ESQUERDA_ALTA }
    public enum SimetriaEias { SIMETRICAS, DIREITA_ALTA, ESQUERDA_ALTA }
    public enum PosicaoJoelhos { VALGO, VARO, NORMAL }
    public enum CurvaturaLombar { HIPERLORDOSE, RETIFICADA, NORMAL }
    public enum PosicaoPelve { ANTEVERSÃO, RETROVERSÃO, NORMAL }
    public enum PosicaoEscapulas { DIREITA_ALTA, ESQUERDA_ALTA }
}
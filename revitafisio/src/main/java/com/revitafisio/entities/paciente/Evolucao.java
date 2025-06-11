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
@Entity(name = "evolucao")
@Table(name = "evolucao")
public class Evolucao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evolucao")
    private Integer idEvolucao;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private Usuario paciente;

    @ManyToOne
    @JoinColumn(name = "id_fisioterapeuta", nullable = false)
    private Usuario fisioterapeuta;

    @Column(nullable = false)
    private LocalDate data;

    @Lob
    @Column(nullable = false)
    private String descricao;

    private boolean preenchida;
}
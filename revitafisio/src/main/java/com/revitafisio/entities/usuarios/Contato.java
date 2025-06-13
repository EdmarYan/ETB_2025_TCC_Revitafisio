package com.revitafisio.entities.usuarios;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.revitafisio.entities.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "contatos")
@Table(name = "contatos")
public class Contato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contato")
    private Integer idContato;

    @JsonBackReference
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoContato tipo;

    @Column(nullable = false)
    private String valor;

    private boolean principal;

    public enum TipoContato {
        TELEFONE, CELULAR, EMAIL, WHATSAPP
    }
}
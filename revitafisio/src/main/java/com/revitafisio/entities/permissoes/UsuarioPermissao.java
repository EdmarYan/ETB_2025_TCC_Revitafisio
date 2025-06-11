package com.revitafisio.entities.permissoes;

import com.revitafisio.entities.usuarios.Especialidade;
import com.revitafisio.entities.usuarios.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuario_permissoes")
public class UsuarioPermissao {

    @EmbeddedId
    private UsuarioPermissaoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId") // Diz ao JPA que este campo corresponde ao 'usuarioId' da chave embutida
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("permissaoId") // Diz ao JPA que este campo corresponde ao 'permissaoId' da chave embutida
    @JoinColumn(name = "permissao_id")
    private Permissao permissao;

    // Este é o campo extra que nos forçou a criar esta classe de entidade
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especialidade_id")
    private Especialidade especialidade;
}
package com.revitafisio.entities.permissoes;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class UsuarioPermissaoId implements Serializable {

    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "permissao_id")
    private Integer permissaoId;
}
package com.revitafisio.entities.usuarios;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("PACIENTE")
public class Paciente extends Usuario {
    // Esta classe pode ficar vazia por enquanto.
    // Futuramente, se houver campos que SÓ um paciente tem, eles serão adicionados aqui.
}
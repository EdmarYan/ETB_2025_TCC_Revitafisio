package com.revitafisio.entities.usuarios;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@DiscriminatorValue("RECEPCIONISTA")
public class Recepcionista extends Usuario {
}
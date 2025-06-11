package com.revitafisio.converters;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.DayOfWeek;

@Converter(autoApply = true) // Aplica o conversor a todos os campos DayOfWeek
public class DayOfWeekConverter implements AttributeConverter<DayOfWeek, Integer> {

    @Override
    public Integer convertToDatabaseColumn(DayOfWeek dayOfWeek) {
        if (dayOfWeek == null) {
            return null;
        }
        // DayOfWeek.getValue() retorna de 1 (MONDAY) a 7 (SUNDAY)
        return dayOfWeek.getValue();
    }

    @Override
    public DayOfWeek convertToEntityAttribute(Integer value) {
        if (value == null) {
            return null;
        }
        // DayOfWeek.of() aceita de 1 a 7
        return DayOfWeek.of(value);
    }
}
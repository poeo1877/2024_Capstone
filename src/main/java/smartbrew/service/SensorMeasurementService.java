package smartbrew.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smartbrew.component.CurrentBatchComponent;
import smartbrew.domain.Batch;
import smartbrew.domain.SensorMeasurement;
import smartbrew.dto.SensorMeasurementDTO;
import smartbrew.repository.BatchRepository;
import smartbrew.repository.SensorMeasurementRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;

@Service
public class SensorMeasurementService {

    @Autowired
    private SensorMeasurementRepository sensorMeasurementRepository;

    @Autowired
    private BatchService batchService;

    @Autowired
    private CurrentBatchComponent currentBatchComponent;
    public void saveMeasurement(SensorMeasurementDTO dto) {
        /*SensorMeasurement measurement = convertToEntity(dto);

        if (measurement.getPressureUpper() != null && measurement.getPressureLower() != null) {
            BigDecimal brix = calculateBrix(measurement.getPressureUpper(), measurement.getPressureLower());
            measurement.setBrix(brix);
        }

        sensorMeasurementRepository.save(measurement);*/

        Long currentBatchId = currentBatchComponent.getCurrentBatchId();
        if (currentBatchId == null) {
            throw new IllegalStateException("No batch is currently fermenting. Data cannot be stored.");
        }

        SensorMeasurement measurement = convertToEntity(dto, currentBatchId);
        measurement.setBrix(calculateBrix(dto.getPressureUpper(), dto.getPressureLower()));
        sensorMeasurementRepository.save(measurement);
    }
    private SensorMeasurement convertToEntity(SensorMeasurementDTO dto) {
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setOutTemperature(dto.getOutTemperature());
        sensorMeasurement.setInTemperature(dto.getInTemperature());
        sensorMeasurement.setPressureUpper(dto.getPressureUpper());
        sensorMeasurement.setPressureLower(dto.getPressureLower());
        sensorMeasurement.setCo2Concentration(dto.getCo2Concentration());
        sensorMeasurement.setPh(dto.getPh());
        sensorMeasurement.setMeasuredTime(dto.getMeasuredTime());
        return sensorMeasurement;
    }
    private SensorMeasurement convertToEntity(SensorMeasurementDTO dto, Long batchId) {
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setOutTemperature(dto.getOutTemperature());
        sensorMeasurement.setInTemperature(dto.getInTemperature());
        sensorMeasurement.setPressureUpper(dto.getPressureUpper());
        sensorMeasurement.setPressureLower(dto.getPressureLower());
        sensorMeasurement.setCo2Concentration(dto.getCo2Concentration());
        sensorMeasurement.setPh(dto.getPh());
        sensorMeasurement.setMeasuredTime(dto.getMeasuredTime());
        sensorMeasurement.setBatch(new Batch(batchId));
        return sensorMeasurement;
    }

    private BigDecimal calculateBrix(BigDecimal pressureUpper, BigDecimal pressureLower) {
        BigDecimal deltaP = pressureUpper.subtract(pressureLower);
        final BigDecimal g = BigDecimal.valueOf(9.8); // m/s²
        final BigDecimal deltaH = BigDecimal.valueOf(0.25); // distance between sensors in meters (250 mm)
        BigDecimal density = deltaP.divide(g.multiply(deltaH), RoundingMode.HALF_UP);
        final BigDecimal rhoWater = BigDecimal.valueOf(1000); // kg/m³
        BigDecimal sg = density.divide(rhoWater, RoundingMode.HALF_UP);
        return (sg.subtract(BigDecimal.ONE)).divide(BigDecimal.valueOf(0.004), RoundingMode.HALF_UP);
    }
}

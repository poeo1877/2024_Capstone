package smartbrew.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smartbrew.component.CurrentBatchComponent;
import smartbrew.domain.Batch;
import smartbrew.domain.SensorMeasurement;
import smartbrew.dto.SensorMeasurementDTO;
import smartbrew.repository.SensorMeasurementRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SensorMeasurementService {

    @Autowired
    private SensorMeasurementRepository sensorMeasurementRepository;

    @Autowired
    private BatchService batchService;

    @Autowired
    private CurrentBatchComponent currentBatchComponent;
    public void saveMeasurement(SensorMeasurementDTO dto) {
        Long currentBatchId = currentBatchComponent.getCurrentBatchId();
        if (currentBatchId == null) {
            throw new IllegalStateException("No batch is currently fermenting. Data cannot be stored.");
        }

        SensorMeasurement measurement = convertToEntity(dto, currentBatchId);
        measurement.setBrix(calculateBrix(dto.getPressureUpper(), dto.getPressureLower()));
        sensorMeasurementRepository.save(measurement);
    }

    public List<SensorMeasurementDTO> getMeasurementsByDateRange(Timestamp start, Timestamp end, Long batchId) {
        List<SensorMeasurement> measurements = sensorMeasurementRepository.findByMeasuredTimeBetweenAndBatchIdOrderByMeasuredTimeAsc(start, end, batchId);
        return measurements.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<SensorMeasurementDTO> getMeasurementsByBatchId(Long batchId) {
        List<SensorMeasurement> measurements = sensorMeasurementRepository.findByBatch_BatchIdOrderByMeasuredTimeAsc(batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
        return measurements.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<SensorMeasurementDTO> getMeasurementsByValueRange(BigDecimal min, BigDecimal max, String field, Long batchId) {
        List<SensorMeasurement> measurements;
        switch (field) {
            case "outTemperature":
                measurements = sensorMeasurementRepository.findByOutTemperatureBetweenAndBatchId(min, max, batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
                break;
            case "inTemperature":
                measurements = sensorMeasurementRepository.findByInTemperatureBetweenAndBatchId(min, max, batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
                break;
            case "pressureUpper":
                measurements = sensorMeasurementRepository.findByPressureUpperBetweenAndBatchId(min, max, batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
                break;
            case "pressureLower":
                measurements = sensorMeasurementRepository.findByPressureLowerBetweenAndBatchId(min, max, batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
                break;
            case "co2":
                measurements = sensorMeasurementRepository.findByCo2ConcentrationBetweenAndBatchId(min.intValue(), max.intValue(), batchId);
                break;
            case "ph":
                measurements = sensorMeasurementRepository.findByPhBetweenAndBatchId(min, max, batchId);
                break;
            case "brix":
                measurements = sensorMeasurementRepository.findByBrixBetweenAndBatchId(min, max, batchId);
                break;
            default:
                throw new IllegalArgumentException("Invalid parameter for value range search: " + field);

        }
        return measurements.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private SensorMeasurementDTO convertToDTO(SensorMeasurement measurement) {
        return new SensorMeasurementDTO(
                measurement.getOutTemperature(),
                measurement.getInTemperature(),
                measurement.getPressureUpper(),
                measurement.getPressureLower(),
                measurement.getCo2Concentration(),
                measurement.getPh(),
                measurement.getMeasuredTime(),
                measurement.getBatch().getBatchId(),
                measurement.getBrix()
        );
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
        sensorMeasurement.setBrix(dto.getBrix());
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
        sensorMeasurement.setBrix(calculateBrix(dto.getPressureUpper(), dto.getPressureLower()));
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

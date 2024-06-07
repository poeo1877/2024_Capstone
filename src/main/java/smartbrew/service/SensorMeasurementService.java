package smartbrew.service;

import org.slf4j.Logger;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SensorMeasurementService {

    @Autowired
    private Logger logger;
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

    public List<SensorMeasurement> findSensorMeasurementsWithinDateRange(Timestamp startTimestamp, Timestamp endTimestamp) {
        return sensorMeasurementRepository.findByMeasuredTimeBetween(startTimestamp, endTimestamp);
    }

   /* public List<SensorMeasurement> getMostRecentTwoMeasurementsByBatchId() {
        Long batchId = currentBatchComponent.getCurrentBatchId();
        if (batchId == null) {
            logger.error("Current batch ID is not set");
            throw new IllegalStateException("Current batch ID is not set");
        }
        List<SensorMeasurement> measurements = sensorMeasurementRepository.findTop2ByBatch_BatchIdOrderByMeasuredTimeDesc(batchId);
        if (measurements == null || measurements.isEmpty()) {
            logger.error("No measurements found for the current batch ID");
            throw new IllegalStateException("No measurements found for the current batch ID");
        }
        return measurements;
    }*/

   /* public Map<String, BigDecimal> getPercentagePointDifferences() {
        try {
            List<SensorMeasurement> measurements = getMostRecentTwoMeasurementsByBatchId();
            Map<String, BigDecimal> differences = new HashMap<>();

            if (measurements.size() == 2) {
                SensorMeasurement recent = measurements.get(0);
                SensorMeasurement previous = measurements.get(1);

                differences.put("outTemperature", calculatePercentageDifference(previous.getOutTemperature(), recent.getOutTemperature()));
                differences.put("inTemperature", calculatePercentageDifference(previous.getInTemperature(), recent.getInTemperature()));
                differences.put("brix", calculatePercentageDifference(previous.getBrix(), recent.getBrix()));
                differences.put("ph", calculatePercentageDifference(previous.getPh(), recent.getPh()));
                differences.put("co2Concentration", calculatePercentageDifference(
                        previous.getCo2Concentration() != null ? BigDecimal.valueOf(previous.getCo2Concentration()) : null,
                        recent.getCo2Concentration() != null ? BigDecimal.valueOf(recent.getCo2Concentration()) : null));
            }

            return differences;
        } catch (Exception e) {
            logger.error("Error occurred while calculating percentage point differences", e);
            throw e;
        }
    }*/

    /*private BigDecimal calculatePercentageDifference(BigDecimal previousValue, BigDecimal recentValue) {
        if (previousValue == null || previousValue.equals(BigDecimal.ZERO) || recentValue == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal difference = recentValue.subtract(previousValue);
        return difference.divide(previousValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
    }*/


    public Map<String, Object> getLatestSensorDataWithChanges() {
        Long batchId = currentBatchComponent.getCurrentBatchId();
        List<SensorMeasurement> latestMeasurements = sensorMeasurementRepository.findTop2ByBatch_BatchIdOrderByMeasuredTimeDesc(batchId);

        if (latestMeasurements.size() < 2) {
            throw new RuntimeException("Not enough data to calculate changes");
        }

        SensorMeasurement latest = latestMeasurements.get(0);
        SensorMeasurement previous = latestMeasurements.get(1);

        Map<String, Object> result = new HashMap<>();
        result.put("latest", convertToDTO(latest));
        result.put("changes", getPercentagePointDifferences(latest, previous));

        return result;
    }

    private Map<String, BigDecimal> getPercentagePointDifferences(SensorMeasurement latest, SensorMeasurement previous) {
        Map<String, BigDecimal> changes = new HashMap<>();
        changes.put("inTemperature", calculatePercentageChange(latest.getInTemperature(), previous.getInTemperature()));
        changes.put("brix", calculatePercentageChange(latest.getBrix(), previous.getBrix()));
        changes.put("co2Concentration", calculatePercentageChange(latest.getCo2Concentration(), previous.getCo2Concentration()));
        changes.put("ph", calculatePercentageChange(latest.getPh(), previous.getPh()));
        return changes;
    }

    private BigDecimal calculatePercentageChange(BigDecimal latest, BigDecimal previous) {
        if (latest == null || previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return latest.subtract(previous).divide(previous, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal calculatePercentageChange(Integer latest, Integer previous) {
        if (latest == null || previous == null || previous == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(latest - previous).divide(BigDecimal.valueOf(previous), RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
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

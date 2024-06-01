package smartbrew.service;

import smartbrew.domain.Batch;
import smartbrew.domain.SensorMeasurement;
import smartbrew.dto.TemperatureSensorDTO;
import smartbrew.repository.BatchRepository;
import smartbrew.repository.SensorMeasurementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TemperatureSensorMeasurementService {

    @Autowired
    private SensorMeasurementRepository repository;

    @Autowired
    private BatchRepository batchRepository;


    public List<TemperatureSensorDTO> getAllMeasurements() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TemperatureSensorDTO getMeasurementById(Long id) {
        Optional<SensorMeasurement> measurement = repository.findById(id);
        if (measurement.isPresent()) {
            return convertToDto(measurement.get());
        } else {
            throw new IllegalArgumentException("SensorMeasurement with ID " + id + " not found");
        }
    }

    public TemperatureSensorDTO createMeasurement(TemperatureSensorDTO dto) {
        SensorMeasurement measurement = convertToEntity(dto);
        if (dto.getBatchId() != null) {
            Optional<Batch> batch = batchRepository.findById(dto.getBatchId());
            batch.ifPresent(measurement::setBatch);
        }
        SensorMeasurement savedMeasurement = repository.save(measurement);
        return convertToDto(savedMeasurement);
    }

    public TemperatureSensorDTO updateMeasurement(Long id, TemperatureSensorDTO dto) {
        Optional<SensorMeasurement> optionalMeasurement = repository.findById(id);
        if (optionalMeasurement.isPresent()) {
            SensorMeasurement measurement = optionalMeasurement.get();
            measurement.setOutTemperature(dto.getOutTemperature());
            measurement.setInTemperature(dto.getInTemperature());
            measurement.setMeasuredTime(dto.getMeasuredTime());
            if (dto.getBatchId() != null) {
                Optional<Batch> batch = batchRepository.findById(dto.getBatchId());
                batch.ifPresent(measurement::setBatch);
            } else {
                measurement.setBatch(null);
            }
            SensorMeasurement updatedMeasurement = repository.save(measurement);
            return convertToDto(updatedMeasurement);
        } else {
            throw new IllegalArgumentException("SensorMeasurement with ID " + id + " not found");
        }
    }

    public void deleteMeasurement(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new IllegalArgumentException("SensorMeasurement with ID " + id + " not found");
        }
    }

    public List<TemperatureSensorDTO> getMeasurementsByDateRange(Timestamp start, Timestamp end) {
        List<SensorMeasurement> measurements;
        if (start != null && end != null) {
            measurements = repository.findByMeasuredTimeBetween(start, end);
        } else if (start != null) {
            measurements = repository.findByMeasuredTimeAfter(start);
        } else if (end != null) {
            measurements = repository.findByMeasuredTimeBefore(end);
        } else {
            measurements = repository.findAll();
        }

        return measurements.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<TemperatureSensorDTO> getMeasurementsByTemperatureRange(BigDecimal minTemp, BigDecimal maxTemp, String position) {
        List<SensorMeasurement> measurements;
        if ("in".equalsIgnoreCase(position)) {
            if (minTemp != null && maxTemp != null) {
                measurements = repository.findByInTemperatureBetween(minTemp, maxTemp);
            } else if (minTemp != null) {
                measurements = repository.findByInTemperatureGreaterThanEqual(minTemp);
            } else if (maxTemp != null) {
                measurements = repository.findByInTemperatureLessThanEqual(maxTemp);
            } else {
                measurements = repository.findAll();
            }
        } else if ("out".equalsIgnoreCase(position)) {
            if (minTemp != null && maxTemp != null) {
                measurements = repository.findByOutTemperatureBetween(minTemp, maxTemp);
            } else if (minTemp != null) {
                measurements = repository.findByOutTemperatureGreaterThanEqual(minTemp);
            } else if (maxTemp != null) {
                measurements = repository.findByOutTemperatureLessThanEqual(maxTemp);
            } else {
                measurements = repository.findAll();
            }
        } else {
            if (minTemp != null && maxTemp != null) {
                measurements = repository.findByInTemperatureBetween(minTemp, maxTemp);
                measurements.addAll(repository.findByOutTemperatureBetween(minTemp, maxTemp));
            } else if (minTemp != null) {
                measurements = repository.findByInTemperatureGreaterThanEqual(minTemp);
                measurements.addAll(repository.findByOutTemperatureGreaterThanEqual(minTemp));
            } else if (maxTemp != null) {
                measurements = repository.findByInTemperatureLessThanEqual(maxTemp);
                measurements.addAll(repository.findByOutTemperatureLessThanEqual(maxTemp));
            } else {
                measurements = repository.findAll();
            }
        }

        return measurements.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    private TemperatureSensorDTO convertToDto(SensorMeasurement sensorMeasurement) {
        if (sensorMeasurement == null) return null;
        return new TemperatureSensorDTO(
                sensorMeasurement.getDataId(),
                sensorMeasurement.getOutTemperature(),
                sensorMeasurement.getInTemperature(),
                sensorMeasurement.getMeasuredTime(),
                sensorMeasurement.getBatch() != null ? sensorMeasurement.getBatch().getBatchId() : null
        );
    }

    private SensorMeasurement convertToEntity(TemperatureSensorDTO dto) {
        if(dto == null) return null;
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setDataId(dto.getDataId());
        sensorMeasurement.setOutTemperature(dto.getOutTemperature());
        sensorMeasurement.setInTemperature(dto.getInTemperature());
        sensorMeasurement.setMeasuredTime(dto.getMeasuredTime());
        return sensorMeasurement;
    }

}

package smartbrew.service;

import smartbrew.domain.Batch;
import smartbrew.domain.SensorMeasurement;
import smartbrew.dto.PressureSensorDTO;
import smartbrew.repository.BatchRepository;
import smartbrew.repository.SensorMeasurementRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PressureSensorMeasurementService {

    @Autowired
    private SensorMeasurementRepository repository;

    @Autowired
    private BatchRepository batchRepository;


    public List<PressureSensorDTO> getAllMeasurements() {
        return repository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public PressureSensorDTO getMeasurementById(Long id) {
        Optional<SensorMeasurement> measurement = repository.findById(id);
        if (measurement.isPresent()) {
            return convertToDto(measurement.get());
        } else {
            throw new IllegalArgumentException("SensorMeasurement with ID " + id + " not found");
        }
    }


    public PressureSensorDTO createMeasurement(PressureSensorDTO dto) {
        SensorMeasurement measurement = convertToEntity(dto);
        if (dto.getBatchId() != null) {
            Optional<Batch> batch = batchRepository.findById(dto.getBatchId());
            batch.ifPresent(measurement::setBatch);
        }
        SensorMeasurement savedMeasurement = repository.save(measurement);
        return convertToDto(savedMeasurement);
    }

    public PressureSensorDTO updateMeasurement(Long id, PressureSensorDTO dto) {
        Optional<SensorMeasurement> optionalMeasurement = repository.findById(id);
        if (optionalMeasurement.isPresent()) {
            SensorMeasurement measurement = optionalMeasurement.get();
            measurement.setPressureUpper(dto.getPressureUpper());
            measurement.setPressureLower(dto.getPressureLower());
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

    public List<PressureSensorDTO> getMeasurementsByDateRange(Timestamp start, Timestamp end) {
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

    private PressureSensorDTO convertToDto(SensorMeasurement sensorMeasurement) {
        return new PressureSensorDTO(
                sensorMeasurement.getDataId(),
                sensorMeasurement.getPressureUpper(),
                sensorMeasurement.getPressureLower(),
                sensorMeasurement.getMeasuredTime(),
                sensorMeasurement.getBatch() != null ? sensorMeasurement.getBatch().getBatchId() : null,
                sensorMeasurement.getBrix() != null ? sensorMeasurement.getBrix() : null
                );
    }

    private SensorMeasurement convertToEntity(PressureSensorDTO dto) {
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setDataId(dto.getDataId());
        sensorMeasurement.setPressureUpper(dto.getPressureUpper());
        sensorMeasurement.setPressureLower(dto.getPressureLower());
        sensorMeasurement.setMeasuredTime(dto.getMeasuredTime());
        sensorMeasurement.setBrix(dto.getBrix());
        // Handle batch assignment if needed
        return sensorMeasurement;
    }


}

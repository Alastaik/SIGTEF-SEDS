package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.dto.energy.EnergyDashboardDTO;
import br.gov.go.seds.sigtef.dto.energy.EnergyGlobalEntitySummaryDTO;
import br.gov.go.seds.sigtef.dto.energy.EnergyRecordDTO;
import br.gov.go.seds.sigtef.dto.energy.GlobalEnergyDashboardDTO;
import br.gov.go.seds.sigtef.model.Competence;
import br.gov.go.seds.sigtef.model.EnergyConsumptionRecord;
import br.gov.go.seds.sigtef.model.LegalEntity;
import br.gov.go.seds.sigtef.model.LegalEntityConsumerUnit;
import br.gov.go.seds.sigtef.model.enums.TariffFlag;
import br.gov.go.seds.sigtef.repository.CompetenceRepository;
import br.gov.go.seds.sigtef.repository.EnergyConsumptionRecordRepository;
import br.gov.go.seds.sigtef.repository.LegalEntityConsumerUnitRepository;
import br.gov.go.seds.sigtef.repository.LegalEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnergyService {

    private final EnergyConsumptionRecordRepository energyRecordRepository;
    private final LegalEntityRepository legalEntityRepository;
    private final CompetenceRepository competenceRepository;
    private final LegalEntityConsumerUnitRepository consumerUnitRepository;

    @Transactional
    public EnergyRecordDTO saveRecord(EnergyRecordDTO dto) {
        LegalEntity legalEntity = legalEntityRepository.findById(dto.getLegalEntityId())
                .orElseThrow(() -> new IllegalArgumentException("Entidade não encontrada"));
                
        Competence competence = competenceRepository.findById(dto.getCompetenceId())
                .orElseThrow(() -> new IllegalArgumentException("Competência não encontrada"));

        LegalEntityConsumerUnit consumerUnit = null;
        if (dto.getConsumerUnitId() != null) {
            consumerUnit = consumerUnitRepository.findById(dto.getConsumerUnitId())
                    .orElseThrow(() -> new IllegalArgumentException("Unidade consumidora não encontrada"));
        }

        EnergyConsumptionRecord record;
        if (dto.getId() != null) {
            record = energyRecordRepository.findById(dto.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Registro não encontrado"));
        } else {
            // Validate duplicates
            if (consumerUnit != null) {
                if (energyRecordRepository.existsByLegalEntityIdAndCompetenceIdAndConsumerUnitId(legalEntity.getId(), competence.getId(), consumerUnit.getId())) {
                    throw new IllegalStateException("Já existe um registro para esta unidade consumidora nesta competência.");
                }
            } else {
                if (energyRecordRepository.existsByLegalEntityIdAndCompetenceIdAndConsumerUnitIdIsNull(legalEntity.getId(), competence.getId())) {
                    throw new IllegalStateException("Já existe um registro para esta entidade nesta competência.");
                }
            }
            record = new EnergyConsumptionRecord();
            record.setLegalEntity(legalEntity);
            record.setConsumerUnit(consumerUnit);
            record.setCompetence(competence);
        }

        record.setKwhAmount(dto.getKwhAmount());
        record.setTariffFlag(dto.getTariffFlag());
        record.setTotalValue(dto.getTotalValue());
        record.setNotes(dto.getNotes());

        record = energyRecordRepository.save(record);
        return mapToDTO(record);
    }

    @Transactional
    public void deleteRecord(UUID id) {
        energyRecordRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EnergyRecordDTO> getRecordsByEntity(UUID entityId) {
        return energyRecordRepository.findByLegalEntityIdOrderByCompetenceDesc(entityId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EnergyDashboardDTO getEntityDashboard(UUID entityId, int months) {
        LegalEntity entity = legalEntityRepository.findById(entityId)
                .orElseThrow(() -> new IllegalArgumentException("Entidade não encontrada"));

        List<EnergyConsumptionRecord> allRecords = energyRecordRepository.findByLegalEntityIdOrderByCompetenceDesc(entityId);
        List<EnergyConsumptionRecord> recentRecords = allRecords.stream().limit(months).collect(Collectors.toList());
        Collections.reverse(recentRecords); // chronological order

        EnergyDashboardDTO dashboard = new EnergyDashboardDTO();
        dashboard.setLegalEntityId(entity.getId());
        dashboard.setLegalEntityName(entity.getCorporateName());
        
        List<EnergyRecordDTO> dtos = recentRecords.stream().map(this::mapToDTO).collect(Collectors.toList());
        dashboard.setRecords(dtos);

        if (recentRecords.isEmpty()) {
            return dashboard;
        }

        BigDecimal sumTotal = BigDecimal.ZERO;
        BigDecimal sumKwh = BigDecimal.ZERO;
        Map<String, Integer> flagDist = new HashMap<>();

        for (EnergyConsumptionRecord r : recentRecords) {
            sumTotal = sumTotal.add(r.getTotalValue());
            sumKwh = sumKwh.add(r.getKwhAmount());
            flagDist.merge(r.getTariffFlag().name(), 1, Integer::sum);
        }

        dashboard.setTotalPeriod(sumTotal);
        BigDecimal count = BigDecimal.valueOf(recentRecords.size());
        dashboard.setAvgValue(sumTotal.divide(count, 2, RoundingMode.HALF_UP));
        dashboard.setAvgKwh(sumKwh.divide(count, 2, RoundingMode.HALF_UP));
        
        if (sumKwh.compareTo(BigDecimal.ZERO) > 0) {
            dashboard.setAvgUnitCost(sumTotal.divide(sumKwh, 4, RoundingMode.HALF_UP));
        } else {
            dashboard.setAvgUnitCost(BigDecimal.ZERO);
        }

        // Std Dev and Max/Min
        BigDecimal variance = BigDecimal.ZERO;
        BigDecimal max = null;
        BigDecimal min = null;
        for (EnergyConsumptionRecord r : recentRecords) {
            BigDecimal val = r.getTotalValue();
            if (max == null || val.compareTo(max) > 0) max = val;
            if (min == null || val.compareTo(min) < 0) min = val;
            
            BigDecimal diff = val.subtract(dashboard.getAvgValue());
            variance = variance.add(diff.multiply(diff));
        }
        
        dashboard.setMaxValue(max);
        dashboard.setMinValue(min);
        if (recentRecords.size() > 1) {
            dashboard.setStdDevValue(BigDecimal.valueOf(Math.sqrt(variance.divide(count, 4, RoundingMode.HALF_UP).doubleValue())));
        } else {
            dashboard.setStdDevValue(BigDecimal.ZERO);
        }

        // MoM Change
        if (recentRecords.size() >= 2) {
            BigDecimal current = recentRecords.get(recentRecords.size() - 1).getTotalValue();
            BigDecimal previous = recentRecords.get(recentRecords.size() - 2).getTotalValue();
            if (previous.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal change = current.subtract(previous).divide(previous, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                dashboard.setMomChangePercentage(change);
            }
        }

        dashboard.setFlagDistribution(flagDist);
        return dashboard;
    }

    @Transactional(readOnly = true)
    public GlobalEnergyDashboardDTO getGlobalDashboard(int year) {
        List<EnergyConsumptionRecord> yearRecords = energyRecordRepository.findByCompetenceYear(year);

        GlobalEnergyDashboardDTO dashboard = new GlobalEnergyDashboardDTO();
        dashboard.setYear(year);
        
        if (yearRecords.isEmpty()) {
            dashboard.setTotalSpentYear(BigDecimal.ZERO);
            dashboard.setTotalEntities(0L);
            dashboard.setTotalRecords(0L);
            dashboard.setMonthlyTotal(new java.util.LinkedHashMap<>());
            dashboard.setFlagDistribution(new java.util.HashMap<>());
            dashboard.setEntitySummaries(new java.util.ArrayList<>());
            return dashboard;
        }

        BigDecimal totalYear = BigDecimal.ZERO;
        Set<UUID> entities = new HashSet<>();
        Map<String, BigDecimal> monthlyTotal = new LinkedHashMap<>();
        Map<String, Integer> flagDist = new HashMap<>();

        Map<UUID, EnergyGlobalEntitySummaryDTO> entitySummaries = new HashMap<>();

        for (EnergyConsumptionRecord r : yearRecords) {
            totalYear = totalYear.add(r.getTotalValue());
            entities.add(r.getLegalEntity().getId());
            
            String monthKey = String.format("%02d/%d", r.getCompetence().getMonth(), r.getCompetence().getYear());
            monthlyTotal.merge(monthKey, r.getTotalValue(), BigDecimal::add);
            
            flagDist.merge(r.getTariffFlag().name(), 1, Integer::sum);

            EnergyGlobalEntitySummaryDTO summary = entitySummaries.computeIfAbsent(r.getLegalEntity().getId(), k -> {
                EnergyGlobalEntitySummaryDTO s = new EnergyGlobalEntitySummaryDTO();
                s.setLegalEntityId(r.getLegalEntity().getId());
                s.setLegalEntityName(r.getLegalEntity().getCorporateName());
                s.setTotalKwh(BigDecimal.ZERO);
                s.setTotalValue(BigDecimal.ZERO);
                s.setMonthsRecorded(0L);
                return s;
            });
            
            summary.setTotalKwh(summary.getTotalKwh().add(r.getKwhAmount()));
            summary.setTotalValue(summary.getTotalValue().add(r.getTotalValue()));
            summary.setMonthsRecorded(summary.getMonthsRecorded() + 1);
        }

        dashboard.setTotalSpentYear(totalYear);
        dashboard.setTotalEntities((long) entities.size());
        dashboard.setTotalRecords((long) yearRecords.size());
        dashboard.setMonthlyTotal(monthlyTotal);
        dashboard.setFlagDistribution(flagDist);
        dashboard.setEntitySummaries(new ArrayList<>(entitySummaries.values()));

        return dashboard;
    }

    private EnergyRecordDTO mapToDTO(EnergyConsumptionRecord record) {
        BigDecimal unitCost = BigDecimal.ZERO;
        if (record.getKwhAmount() != null && record.getKwhAmount().compareTo(BigDecimal.ZERO) > 0) {
            unitCost = record.getTotalValue().divide(record.getKwhAmount(), 4, RoundingMode.HALF_UP);
        }
        
        return EnergyRecordDTO.builder()
                .id(record.getId())
                .legalEntityId(record.getLegalEntity().getId())
                .legalEntityName(record.getLegalEntity().getCorporateName())
                .consumerUnitId(record.getConsumerUnit() != null ? record.getConsumerUnit().getId() : null)
                .consumerUnitNumber(record.getConsumerUnit() != null ? record.getConsumerUnit().getUnitNumber() : null)
                .competenceId(record.getCompetence().getId())
                .competenceMonth(record.getCompetence().getMonth())
                .competenceYear(record.getCompetence().getYear())
                .competenceDisplay(String.format("%02d/%d", record.getCompetence().getMonth(), record.getCompetence().getYear()))
                .kwhAmount(record.getKwhAmount())
                .tariffFlag(record.getTariffFlag())
                .totalValue(record.getTotalValue())
                .kwhUnitCost(unitCost)
                .notes(record.getNotes())
                .build();
    }
}

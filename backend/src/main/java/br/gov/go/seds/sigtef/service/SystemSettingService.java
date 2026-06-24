package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.SystemSetting;
import br.gov.go.seds.sigtef.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository repository;

    public List<SystemSetting> findAll() {
        return repository.findAll();
    }

    public List<SystemSetting> findByCategory(String category) {
        return repository.findByCategory(category);
    }

    public Optional<SystemSetting> findByKey(String key) {
        return repository.findById(key);
    }

    public String getValueOrDefault(String key, String defaultValue) {
        return repository.findById(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }

    @Transactional
    public void updateSettings(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            repository.findById(entry.getKey()).ifPresent(setting -> {
                setting.setValue(entry.getValue());
                repository.save(setting);
            });
        }
    }
}

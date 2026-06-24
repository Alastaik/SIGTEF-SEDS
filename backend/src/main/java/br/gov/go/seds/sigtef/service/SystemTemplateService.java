package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.SystemTemplate;
import br.gov.go.seds.sigtef.repository.SystemTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemTemplateService {

    private final SystemTemplateRepository repository;

    public List<SystemTemplate> findAll() {
        return repository.findAll();
    }

    public Optional<SystemTemplate> findByKey(String key) {
        return repository.findById(key);
    }

    @Transactional
    public SystemTemplate updateTemplate(String key, String subject, String content) {
        SystemTemplate template = repository.findById(key)
                .orElseThrow(() -> new RuntimeException("Template não encontrado: " + key));
        template.setSubject(subject);
        template.setContent(content);
        return repository.save(template);
    }
}

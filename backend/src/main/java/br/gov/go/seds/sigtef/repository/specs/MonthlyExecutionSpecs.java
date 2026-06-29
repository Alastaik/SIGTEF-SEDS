package br.gov.go.seds.sigtef.repository.specs;

import br.gov.go.seds.sigtef.dto.admin.ExecutionReportFilterDTO;
import br.gov.go.seds.sigtef.model.MonthlyExecution;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class MonthlyExecutionSpecs {

    private MonthlyExecutionSpecs() {}

    public static Specification<MonthlyExecution> withFilters(ExecutionReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String pattern = "%" + filter.getSearch().toLowerCase() + "%";
                Predicate byEntityName = cb.like(
                    cb.lower(root.get("partnershipAgreementProgram").get("partnershipAgreement").get("legalEntity").get("corporateName")), pattern
                );
                Predicate byNumber = cb.like(
                    cb.lower(root.get("partnershipAgreementProgram").get("partnershipAgreement").get("agreementNumber")), pattern
                );
                predicates.add(cb.or(byEntityName, byNumber));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getCompetence() != null && !filter.getCompetence().isBlank()) {
                predicates.add(cb.equal(root.get("competence"), filter.getCompetence()));
            }
            
            if (filter.getProgramId() != null) {
                predicates.add(cb.equal(
                    root.get("partnershipAgreementProgram").get("program").get("id"),
                    filter.getProgramId()
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

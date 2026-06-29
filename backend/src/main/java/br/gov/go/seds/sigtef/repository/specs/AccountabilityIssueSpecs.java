package br.gov.go.seds.sigtef.repository.specs;

import br.gov.go.seds.sigtef.dto.admin.IssueReportFilterDTO;
import br.gov.go.seds.sigtef.model.AccountabilityIssue;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class AccountabilityIssueSpecs {

    private AccountabilityIssueSpecs() {}

    public static Specification<AccountabilityIssue> withFilters(IssueReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String pattern = "%" + filter.getSearch().toLowerCase() + "%";
                Predicate byEntityName = cb.like(
                    cb.lower(root.get("accountability").get("monthlyExecution")
                        .get("partnershipAgreementProgram").get("partnershipAgreement")
                        .get("legalEntity").get("corporateName")), pattern
                );
                Predicate byNumber = cb.like(
                    cb.lower(root.get("accountability").get("monthlyExecution")
                        .get("partnershipAgreementProgram").get("partnershipAgreement")
                        .get("agreementNumber")), pattern
                );
                predicates.add(cb.or(byEntityName, byNumber));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }
            
            if (filter.getPriority() != null) {
                predicates.add(cb.equal(root.get("priority"), filter.getPriority()));
            }

            if (Boolean.TRUE.equals(filter.getOverdue())) {
                predicates.add(cb.lessThan(root.get("deadline"), LocalDate.now()));
                predicates.add(cb.notEqual(root.get("status"), br.gov.go.seds.sigtef.model.IssueStatus.RESOLVED));
                predicates.add(cb.notEqual(root.get("status"), br.gov.go.seds.sigtef.model.IssueStatus.CANCELED));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

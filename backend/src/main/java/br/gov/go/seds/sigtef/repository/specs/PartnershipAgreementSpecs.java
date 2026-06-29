package br.gov.go.seds.sigtef.repository.specs;

import br.gov.go.seds.sigtef.dto.admin.AgreementReportFilterDTO;
import br.gov.go.seds.sigtef.model.PartnershipAgreement;
import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PartnershipAgreementSpecs {

    private PartnershipAgreementSpecs() {}

    public static Specification<PartnershipAgreement> withFilters(AgreementReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String pattern = "%" + filter.getSearch().toLowerCase() + "%";
                Predicate byEntityName = cb.like(
                    cb.lower(root.get("legalEntity").get("corporateName")), pattern
                );
                Predicate byNumber = cb.like(
                    cb.lower(root.get("agreementNumber")), pattern
                );
                predicates.add(cb.or(byEntityName, byNumber));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getYear() != null) {
                predicates.add(cb.equal(root.get("year"), filter.getYear()));
            }

            if (filter.getCityId() != null) {
                predicates.add(cb.equal(
                    root.get("legalEntity").get("mainCity").get("id"),
                    filter.getCityId()
                ));
            }

            if (filter.getRegionId() != null) {
                predicates.add(cb.equal(
                    root.get("legalEntity").get("mainCity").get("region").get("id"),
                    filter.getRegionId()
                ));
            }

            // Filtro de vencimento
            LocalDate today = LocalDate.now();
            if (Boolean.TRUE.equals(filter.getExpired())) {
                predicates.add(cb.lessThan(root.get("endDate"), today));
            } else if (filter.getExpiresInDays() != null && filter.getExpiresInDays() > 0) {
                LocalDate limitDate = today.plusDays(filter.getExpiresInDays());
                predicates.add(cb.greaterThanOrEqualTo(root.get("endDate"), today));
                predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), limitDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

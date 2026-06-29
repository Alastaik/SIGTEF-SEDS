package br.gov.go.seds.sigtef.repository.specs;

import br.gov.go.seds.sigtef.dto.admin.ReportFilterDTO;
import br.gov.go.seds.sigtef.model.LegalEntity;
import br.gov.go.seds.sigtef.model.PartnershipAgreement;
import br.gov.go.seds.sigtef.model.PartnershipAgreementProgram;
import br.gov.go.seds.sigtef.model.enums.AgreementStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class LegalEntitySpecs {

    public static Specification<LegalEntity> withFilters(ReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String search = "%" + filter.getSearch().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("corporateName")), search);
                Predicate tradeNameLike = cb.like(cb.lower(root.get("tradeName")), search);
                Predicate cnpjLike = cb.like(root.get("cnpj"), search);
                predicates.add(cb.or(nameLike, tradeNameLike, cnpjLike));
            }

            if (filter.getEntityStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getEntityStatus()));
            }

            if (filter.getCityId() != null) {
                predicates.add(cb.equal(root.get("mainCity").get("id"), filter.getCityId()));
            }

            if (filter.getRegionId() != null) {
                // Assuming city belongs to a region in the model
                predicates.add(cb.equal(root.get("mainCity").get("region").get("id"), filter.getRegionId()));
            }

            // Filtragem avançada por Programas
            if (filter.getProgramIds() != null && !filter.getProgramIds().isEmpty()) {
                
                // Precisamos verificar os termos ativos desta entidade
                // E os programas vinculados a esses termos ativos.
                
                if (filter.getProgramMatchMode() == ReportFilterDTO.ProgramMatchMode.CONTAINS) {
                    // MODO CONTAINS: A entidade tem PELO MENOS UM dos programas informados (ou todos eles? Geralmente IN é OR, se quiser AND de todos os passados é diferente)
                    // Vamos assumir que se passou [A, B] e modo CONTAINS, ele quer entidades que tenham A OU B (ou A E B). Ou seja, intersecção > 0.
                    
                    Subquery<Long> sq = query.subquery(Long.class);
                    var papRoot = sq.from(PartnershipAgreementProgram.class);
                    var paJoin = papRoot.join("partnershipAgreement");
                    
                    sq.select(cb.count(papRoot));
                    sq.where(
                        cb.equal(paJoin.get("legalEntity"), root),
                        cb.equal(paJoin.get("status"), AgreementStatus.ACTIVE),
                        papRoot.get("program").get("id").in(filter.getProgramIds())
                    );
                    
                    predicates.add(cb.greaterThan(sq, 0L));
                    
                } else {
                    
                    Subquery<Long> sqOtherPrograms = query.subquery(Long.class);
                    var papRoot = sqOtherPrograms.from(PartnershipAgreementProgram.class);
                    var paJoin = papRoot.join("partnershipAgreement");
                    
                    sqOtherPrograms.select(cb.count(papRoot));
                    sqOtherPrograms.where(
                        cb.equal(paJoin.get("legalEntity"), root),
                        cb.equal(paJoin.get("status"), AgreementStatus.ACTIVE),
                        cb.not(papRoot.get("program").get("id").in(filter.getProgramIds()))
                    );
                    
                    predicates.add(cb.equal(sqOtherPrograms, 0L));
                    
                    Subquery<Long> sqAnyProgram = query.subquery(Long.class);
                    var paRoot2 = sqAnyProgram.from(PartnershipAgreement.class);
                    
                    sqAnyProgram.select(cb.count(paRoot2));
                    sqAnyProgram.where(
                        cb.equal(paRoot2.get("legalEntity"), root),
                        cb.equal(paRoot2.get("status"), AgreementStatus.ACTIVE)
                    );
                    
                    predicates.add(cb.greaterThan(sqAnyProgram, 0L));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

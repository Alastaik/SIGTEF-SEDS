package br.gov.go.seds.sigtef.repository.specs;

import br.gov.go.seds.sigtef.dto.admin.ReportFilterDTO;
import br.gov.go.seds.sigtef.model.RelatorioEntidadeView;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RelatorioEntidadeViewSpecs {

    public static Specification<RelatorioEntidadeView> withFilters(ReportFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String search = "%" + filter.getSearch().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("razaoSocial")), search);
                Predicate cnpjLike = cb.like(root.get("cnpj"), search);
                predicates.add(cb.or(nameLike, cnpjLike));
            }

            if (filter.getEntityStatus() != null) {
                predicates.add(cb.equal(root.get("statusEntidade"), filter.getEntityStatus()));
            }

            if (filter.getCityId() != null) {
                predicates.add(cb.equal(root.get("municipioSedeId"), filter.getCityId()));
            }

            if (filter.getRegionId() != null) {
                predicates.add(cb.equal(root.get("regiaoId"), filter.getRegionId()));
            }

            if (filter.getRegioesIds() != null && !filter.getRegioesIds().isEmpty()) {
                predicates.add(root.get("regiaoId").in(filter.getRegioesIds()));
            }

            if (filter.getDataCadastroInicio() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dataCadastro"), filter.getDataCadastroInicio().atStartOfDay()));
            }
            if (filter.getDataCadastroFim() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dataCadastro"), filter.getDataCadastroFim().atTime(23, 59, 59)));
            }

            if (filter.getMinMensal() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalRecebidoMesAtual"), filter.getMinMensal()));
            }
            if (filter.getMaxMensal() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalRecebidoMesAtual"), filter.getMaxMensal()));
            }

            if (filter.getMinAnual() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalRecebidoAnoAtual"), filter.getMinAnual()));
            }
            if (filter.getMaxAnual() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalRecebidoAnoAtual"), filter.getMaxAnual()));
            }

            if (filter.getMinGlobal() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalRecebidoGlobal"), filter.getMinGlobal()));
            }
            if (filter.getMaxGlobal() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalRecebidoGlobal"), filter.getMaxGlobal()));
            }

            // Para os programas, na View eles estao numa string_agg "Programa X, Programa Y".
            // Para filtrar "Contém todos" ou "Qualquer um" em cima de string concatenada pode ser feito com LIKE
            // Porém, como temos os IDs no DTO e a view só tem a string, a maneira mais robusta 
            // no banco seria cruzar. Mas como a view tem os nomes dos programas:
            // Observação: Para evitar erro de ID vs Nome, a query da View deveria exportar os IDs dos programas num array.
            if (filter.getProgramIds() != null && !filter.getProgramIds().isEmpty()) {
                if (filter.getProgramMatchMode() == ReportFilterDTO.ProgramMatchMode.CONTAINS) {
                    jakarta.persistence.criteria.Subquery<Long> sq = query.subquery(Long.class);
                    var papRoot = sq.from(br.gov.go.seds.sigtef.model.PartnershipAgreementProgram.class);
                    var paJoin = papRoot.join("partnershipAgreement");
                    
                    sq.select(cb.count(papRoot));
                    sq.where(
                        cb.equal(paJoin.get("legalEntity").get("id"), root.get("entidadeId")),
                        cb.equal(paJoin.get("status"), br.gov.go.seds.sigtef.model.enums.AgreementStatus.ACTIVE),
                        papRoot.get("program").get("id").in(filter.getProgramIds())
                    );
                    
                    predicates.add(cb.greaterThan(sq, 0L));
                } else {
                    jakarta.persistence.criteria.Subquery<Long> sqOtherPrograms = query.subquery(Long.class);
                    var papRoot = sqOtherPrograms.from(br.gov.go.seds.sigtef.model.PartnershipAgreementProgram.class);
                    var paJoin = papRoot.join("partnershipAgreement");
                    
                    sqOtherPrograms.select(cb.count(papRoot));
                    sqOtherPrograms.where(
                        cb.equal(paJoin.get("legalEntity").get("id"), root.get("entidadeId")),
                        cb.equal(paJoin.get("status"), br.gov.go.seds.sigtef.model.enums.AgreementStatus.ACTIVE),
                        cb.not(papRoot.get("program").get("id").in(filter.getProgramIds()))
                    );
                    
                    predicates.add(cb.equal(sqOtherPrograms, 0L));
                    
                    jakarta.persistence.criteria.Subquery<Long> sqAnyProgram = query.subquery(Long.class);
                    var paRoot2 = sqAnyProgram.from(br.gov.go.seds.sigtef.model.PartnershipAgreement.class);
                    
                    sqAnyProgram.select(cb.count(paRoot2));
                    sqAnyProgram.where(
                        cb.equal(paRoot2.get("legalEntity").get("id"), root.get("entidadeId")),
                        cb.equal(paRoot2.get("status"), br.gov.go.seds.sigtef.model.enums.AgreementStatus.ACTIVE)
                    );
                    
                    predicates.add(cb.greaterThan(sqAnyProgram, 0L));
                }
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

package br.gov.go.seds.sigtef.model;

import br.gov.go.seds.sigtef.model.enums.EntityStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vw_relatorio_entidades")
@Immutable
@Getter
public class RelatorioEntidadeView {

    @Id
    @Column(name = "entidade_id")
    private UUID entidadeId;

    @Column(name = "razao_social")
    private String razaoSocial;

    @Column(name = "cnpj")
    private String cnpj;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_entidade")
    private EntityStatus statusEntidade;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "municipio_sede_id")
    private UUID municipioSedeId;

    @Column(name = "municipio_sede")
    private String municipioSede;

    @Column(name = "regiao_id")
    private UUID regiaoId;

    @Column(name = "regiao")
    private String regiao;

    @Column(name = "programas_ativos")
    private String programasAtivos;

    @Column(name = "total_recebido_mes_atual")
    private BigDecimal totalRecebidoMesAtual;

    @Column(name = "total_recebido_ano_atual")
    private BigDecimal totalRecebidoAnoAtual;

    @Column(name = "total_recebido_global")
    private BigDecimal totalRecebidoGlobal;

}

package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.ItemCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ItemCategoryRepository extends JpaRepository<ItemCategory, UUID> {
    List<ItemCategory> findAllByActiveTrueOrderByNameAsc();
}

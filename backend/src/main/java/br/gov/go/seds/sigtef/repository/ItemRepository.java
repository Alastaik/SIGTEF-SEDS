package br.gov.go.seds.sigtef.repository;

import br.gov.go.seds.sigtef.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID> {
    List<Item> findAllByCategoryIdAndActiveTrueOrderByNameAsc(UUID categoryId);
    List<Item> findAllByActiveTrueOrderByNameAsc();
}

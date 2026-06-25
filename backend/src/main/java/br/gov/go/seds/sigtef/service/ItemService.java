package br.gov.go.seds.sigtef.service;

import br.gov.go.seds.sigtef.model.Item;
import br.gov.go.seds.sigtef.model.ItemCategory;
import br.gov.go.seds.sigtef.repository.ItemCategoryRepository;
import br.gov.go.seds.sigtef.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ItemService {

    private final ItemCategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    public ItemService(ItemCategoryRepository categoryRepository, ItemRepository itemRepository) {
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
    }

    public List<ItemCategory> getCategories() {
        return categoryRepository.findAllByActiveTrueOrderByNameAsc();
    }

    public List<Item> getAllItems() {
        return itemRepository.findAllByActiveTrueOrderByNameAsc();
    }

    public List<Item> getItemsByCategory(UUID categoryId) {
        return itemRepository.findAllByCategoryIdAndActiveTrueOrderByNameAsc(categoryId);
    }

    @Transactional
    public Item createItem(UUID categoryId, String name, String unitOfMeasurement, UUID accountabilityId) {
        ItemCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Item item = Item.builder()
                .category(category)
                .name(name)
                .unitOfMeasurement(unitOfMeasurement)
                .createdInAccountabilityId(accountabilityId)
                .active(true)
                .build();

        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(UUID itemId, UUID accountabilityId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (item.getCreatedInAccountabilityId() == null || !item.getCreatedInAccountabilityId().equals(accountabilityId)) {
            throw new RuntimeException("You can only delete items that you created in this accountability session.");
        }

        // Deleting from DB. Cascade will handle if it's already detached.
        // If it's still attached to a FiscalDocumentItem, it might throw a foreign key constraint violation.
        // In practice, the frontend should delete the FiscalDocumentItem first, then delete the Item from the DB.
        itemRepository.delete(item);
    }
}

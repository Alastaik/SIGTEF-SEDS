package br.gov.go.seds.sigtef.controller;

import br.gov.go.seds.sigtef.model.Item;
import br.gov.go.seds.sigtef.model.ItemCategory;
import br.gov.go.seds.sigtef.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ItemCategory>> getCategories() {
        return ResponseEntity.ok(itemService.getCategories());
    }

    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<List<Item>> getItemsByCategory(@PathVariable UUID categoryId) {
        return ResponseEntity.ok(itemService.getItemsByCategory(categoryId));
    }

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Map<String, Object> payload) {
        UUID categoryId = UUID.fromString((String) payload.get("categoryId"));
        String name = (String) payload.get("name");
        String unitOfMeasurement = (String) payload.get("unitOfMeasurement");
        UUID accountabilityId = payload.get("accountabilityId") != null ? UUID.fromString((String) payload.get("accountabilityId")) : null;

        return ResponseEntity.ok(itemService.createItem(categoryId, name, unitOfMeasurement, accountabilityId));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable UUID itemId, @RequestParam UUID accountabilityId) {
        itemService.deleteItem(itemId, accountabilityId);
        return ResponseEntity.noContent().build();
    }
}

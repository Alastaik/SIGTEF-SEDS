package br.gov.go.seds.sigtef.mapper;

import br.gov.go.seds.sigtef.dto.AccountabilityIssueAttachmentDTO;
import br.gov.go.seds.sigtef.dto.AccountabilityIssueDTO;
import br.gov.go.seds.sigtef.dto.AccountabilityIssueResponseDTO;
import br.gov.go.seds.sigtef.model.AccountabilityIssue;
import br.gov.go.seds.sigtef.model.AccountabilityIssueAttachment;
import br.gov.go.seds.sigtef.model.AccountabilityIssueResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AccountabilityIssueMapper {

    private final UserMapper userMapper;

    public AccountabilityIssueMapper(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public AccountabilityIssueDTO toDto(AccountabilityIssue entity) {
        if (entity == null) return null;

        AccountabilityIssueDTO dto = new AccountabilityIssueDTO();
        dto.setId(entity.getId());
        dto.setAccountabilityId(entity.getAccountability().getId());
        dto.setCreatedBy(userMapper.toDto(entity.getCreatedBy()));
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setIssueType(entity.getIssueType());
        dto.setPriority(entity.getPriority());
        dto.setDescription(entity.getDescription());
        dto.setDeadline(entity.getDeadline());
        dto.setStatus(entity.getStatus());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCancellationReason(entity.getCancellationReason());
        dto.setResolvedAt(entity.getResolvedAt());

        if (entity.getResponses() != null) {
            dto.setResponses(entity.getResponses().stream()
                    .map(this::toResponseDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public AccountabilityIssueResponseDTO toResponseDto(AccountabilityIssueResponse entity) {
        if (entity == null) return null;

        AccountabilityIssueResponseDTO dto = new AccountabilityIssueResponseDTO();
        dto.setId(entity.getId());
        dto.setIssueId(entity.getIssue().getId());
        dto.setVersionNumber(entity.getVersionNumber());
        dto.setSubmittedBy(userMapper.toDto(entity.getSubmittedBy()));
        dto.setSubmittedAt(entity.getSubmittedAt());
        dto.setResponseText(entity.getResponseText());
        dto.setStatus(entity.getStatus());
        if (entity.getReviewedBy() != null) {
            dto.setReviewedBy(userMapper.toDto(entity.getReviewedBy()));
        }
        dto.setReviewedAt(entity.getReviewedAt());
        dto.setReviewNotes(entity.getReviewNotes());

        if (entity.getAttachments() != null) {
            dto.setAttachments(entity.getAttachments().stream()
                    .map(this::toAttachmentDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public AccountabilityIssueAttachmentDTO toAttachmentDto(AccountabilityIssueAttachment entity) {
        if (entity == null) return null;

        AccountabilityIssueAttachmentDTO dto = new AccountabilityIssueAttachmentDTO();
        dto.setId(entity.getId());
        dto.setFileName(entity.getFileName());
        dto.setFileUrl(entity.getFileUrl());
        dto.setContentType(entity.getContentType());
        dto.setFileSize(entity.getFileSize());
        dto.setUploadedAt(entity.getUploadedAt());
        return dto;
    }

    public List<AccountabilityIssueDTO> toDtoList(List<AccountabilityIssue> entities) {
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }
}

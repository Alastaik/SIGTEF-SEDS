export type EntityStatus = 'ATIVA' | 'INATIVA' | 'SUSPENSA' | 'ENCERRADA' | 'PENDENTE_VALIDACAO';

export interface LegalEntity {
  id: string;
  cnpj: string;
  corporateName: string;
  tradeName?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  addresses?: LegalEntityAddress[];
  contacts?: LegalEntityContact[];
  responsibles?: LegalEntityResponsible[];
  consumerUnits?: LegalEntityConsumerUnit[];
  history?: LegalEntityHistory[];
  notes?: LegalEntityNote[];
}

export type AddressType = 'SEDE' | 'FILIAL' | 'CORRESPONDENCIA' | 'OUTRO';
export interface LegalEntityAddress {
  id: string;
  addressType: AddressType;
  city?: any;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
  isMain: boolean;
  active: boolean;
}

export type ContactType = 'TELEFONE' | 'CELULAR' | 'WHATSAPP' | 'EMAIL' | 'OUTRO';
export interface LegalEntityContact {
  id: string;
  contactType: ContactType;
  value: string;
  description?: string;
  isMain: boolean;
  active: boolean;
}

export interface LegalEntityResponsible {
  id: string;
  name: string;
  cpf: string;
  role: string;
  email: string;
  phone: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export type UtilityType = 'ENERGIA' | 'AGUA' | 'GAS' | 'OUTRO';
export interface LegalEntityConsumerUnit {
  id: string;
  utilityType: UtilityType;
  provider?: any;
  unitNumber: string;
  active: boolean;
}

export interface LegalEntityHistory {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  createdBy?: any;
}

export interface LegalEntityNote {
  id: string;
  note: string;
  createdAt: string;
  createdBy?: any;
}

export interface AddressRequestDTO {
  addressType: AddressType;
  cityId: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
  isMain: boolean;
}

export interface ContactRequestDTO {
  contactType: ContactType;
  value: string;
  description?: string;
  isMain: boolean;
}

export interface ResponsibleRequestDTO {
  name: string;
  cpf: string;
  role: string;
  email: string;
  phone: string;
  startDate: string;
  endDate?: string;
}

export interface ConsumerUnitRequestDTO {
  utilityType: UtilityType;
  providerId: string;
  unitNumber: string;
}

export interface NoteRequestDTO {
  note: string;
}

export interface LegalEntityCreateDTO {
  cnpj: string;
  corporateName: string;
  tradeName?: string;
  // Outros campos essenciais podem ser adicionados aqui depois
}

export interface LegalEntityUpdateStatusDTO {
  status: EntityStatus;
  reason: string;
}

// --- REPRESENTANTES E CONVITES (MÓDULO 05) ---

export type RepresentativeRole = 'ADMINISTRADOR' | 'OPERADOR' | 'LEITOR';
export type RepresentativeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export interface RepresentativeResponseDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: RepresentativeRole;
  permissions: string[];
  status: RepresentativeStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface InvitationResponseDTO {
  id: string;
  name: string;
  email: string;
  status: InvitationStatus;
  role: RepresentativeRole;
  permissions: string[];
  expiresAt: string;
  createdAt: string;
}

export interface InviteRequestDTO {
  name: string;
  email: string;
  role: RepresentativeRole;
  permissions: string[];
}

export interface AcceptInvitationRequestDTO {
  token: string;
  password?: string; // Optional depending on if user needs to create one
  acceptedTerms: boolean;
}

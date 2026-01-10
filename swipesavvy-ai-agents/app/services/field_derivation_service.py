"""
Field Derivation Service for Merchant Onboarding

Transforms minimal user-provided fields (26 essential fields) into the complete
180+ field set required by Fiserv AccessOne API for merchant boarding.

Three-Tier Architecture:
- Tier 1: User-provided essential fields (input)
- Tier 2: Auto-derived fields (computed from Tier 1)
- Tier 3: System defaults (standard values for initial boarding)
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from pydantic import BaseModel
from enum import Enum

logger = logging.getLogger(__name__)


# =============================================================================
# TIER 1: INPUT MODELS (User-provided essential fields)
# =============================================================================

class BusinessAddress(BaseModel):
    """Parsed business address"""
    street: str
    city: str
    state: str
    zip: str
    country: str = "US"


class OwnerAddress(BaseModel):
    """Parsed owner address"""
    street: str
    city: str
    state: str
    zip: str
    country: str = "US"


class OwnerInfo(BaseModel):
    """Owner/Principal information"""
    first_name: str
    last_name: str
    middle_name: Optional[str] = ""
    title: str = "Owner"
    ssn: str  # Full SSN for Fiserv
    dob: str  # YYYY-MM-DD
    email: str
    phone: str
    address: OwnerAddress
    ownership_percent: float = 100.0
    is_guarantor: bool = True
    sequence_number: int = 1


class BankInfo(BaseModel):
    """Bank account information"""
    bank_name: str
    routing_number: str
    account_number: str
    account_type: str = "C"  # C=Checking, S=Savings


class ProcessingInfo(BaseModel):
    """Processing configuration"""
    monthly_volume: float
    avg_ticket: float
    high_ticket: float
    processing_type: str = "RETAIL"  # RETAIL, ECOM, MOTO, MIXED


class EssentialFields(BaseModel):
    """Tier 1: Essential fields collected from user (26 fields)"""
    # Business (8 fields)
    legal_name: str
    dba_name: str
    tax_id: str
    business_type: str  # S, L, C, P, T, G
    mcc_code: str
    business_address: BusinessAddress
    website: Optional[str] = None
    customer_service_phone: str

    # Owner (9 fields - can have multiple)
    owners: List[OwnerInfo]

    # Bank (3 fields)
    bank_info: BankInfo

    # Processing (4 fields)
    processing_info: ProcessingInfo

    # Documents (2 required)
    has_government_id: bool = False
    has_voided_check: bool = False


# =============================================================================
# MAPPING TABLES
# =============================================================================

# Entity Type Mapping
ENTITY_TYPE_MAP = {
    "S": {"code": "1", "description": "Sole Proprietor"},
    "L": {"code": "2", "description": "LLC"},
    "C": {"code": "3", "description": "Corporation"},
    "P": {"code": "4", "description": "Partnership"},
    "T": {"code": "5", "description": "Tax Exempt"},
    "G": {"code": "6", "description": "Government"},
}

# Tax ID Type based on entity
TAX_ID_TYPE_MAP = {
    "S": "1",  # SSN for Sole Proprietor
    "L": "3",  # EIN for LLC
    "C": "3",  # EIN for Corporation
    "P": "3",  # EIN for Partnership
    "T": "3",  # EIN for Tax Exempt
    "G": "3",  # EIN for Government
}

# IRS Payee Code based on entity type
IRS_PAYEE_CODE_MAP = {
    "S": "I",  # Individual
    "L": "L",  # LLC
    "C": "C",  # Corporation
    "P": "P",  # Partnership
    "T": "E",  # Exempt
    "G": "G",  # Government
}

# MCC to SIC Code mapping (partial list - most common)
MCC_TO_SIC_MAP = {
    "5411": "5411",  # Grocery Stores
    "5812": "5812",  # Eating Places
    "5814": "5812",  # Fast Food
    "5999": "5999",  # Misc Retail
    "7299": "7999",  # Recreation Services
    "5734": "5734",  # Computer Software
    "5945": "5945",  # Hobby/Toy Shops
    "5541": "5541",  # Service Stations
    "5462": "5461",  # Bakeries
    "5691": "5651",  # Clothing Stores
    "7230": "7231",  # Beauty Shops
    "8011": "8011",  # Doctors
    "8021": "8021",  # Dentists
    "8099": "8099",  # Health Practitioners
    "5912": "5912",  # Drug Stores
    "5311": "5311",  # Department Stores
    "5712": "5712",  # Furniture
    "5947": "5947",  # Gift Shops
    "7011": "7011",  # Hotels
    "7512": "7514",  # Auto Rental
}

# Processing type to MOTO/E-commerce code
PROCESSING_TYPE_MAP = {
    "RETAIL": {"code": "R", "keyed_percent": 10},
    "ECOM": {"code": "E", "keyed_percent": 100},
    "MOTO": {"code": "M", "keyed_percent": 100},
    "MIXED": {"code": "X", "keyed_percent": 50},
}


# =============================================================================
# TIER 3: SYSTEM DEFAULTS
# =============================================================================

class SystemDefaults:
    """Standard default values for initial merchant boarding"""

    # Authorization & Processing Defaults
    AUTH_DEFAULTS = {
        "authPrimaryNetworkCode": "A",
        "authSecondaryNetworkCode": "A",
        "authTypeCode": "1",
        "encryptServiceLevelCode": "01",
        "encryptTokenHierarchyCode": "00",
        "encryptTokenCode": "0001",
        "encryptTypeCode": "06",
        "etcOptionCode": "1",
        "etcBypassEditsIndicator": "Y",
    }

    # Funding Defaults
    FUNDING_DEFAULTS = {
        "fundingBankCode": "999",
        "fundingMethodCode": "25",  # ACH
        "fundingCurrencyCode": "840",  # USD
        "fundingRunCode": "2",  # Daily
        "fundingRollupCode": "2",  # Merchant level
        "fundingDepositCode": "1",
        "fundingAchUsageCode": "1",
        "fundingAchDelayDays": 2,
        "fundingAchHoldIndicator": "N",
        "fundingExcludeCode": "N",
        "fundingExcludeDailyLimitAmount": 99999,
        "fundingExclude30DayLimitAmount": 99999,
        "fundingRppDelayDays": 0,
        "fundingRppMinimumAmount": 0,
        "fundingRppMinimumReserveAmount": 0,
        "fundingRppPercent": 0,
    }

    # AVS (Address Verification Service) Defaults
    AVS_DEFAULTS = {
        "avsServiceIndicator": "Y",
        "avsAddressIndicator": "Y",
        "avsZipIndicator": "Y",
        "avsWholeZipIndicator": "N",
        "avsExactIndicator": "N",
        "avsNoIndicator": "N",
        "avsRetryIndicator": "N",
        "avsUnavailableIndicator": "N",
        "avsYesIndicator": "Y",
    }

    # Card Network Defaults
    CARD_NETWORK_DEFAULTS = {
        "visaDebitAcceptIndicator": "Y",
        "visaRelationshipIndicator": "N",
        "visaIramIndicator": "N",
        "mastercardIramIndicator": "N",
        "commercialCardInterchangeServiceCode": "Y",
        "emvIndicator": "Y",
    }

    # Statement & Reporting Defaults
    STATEMENT_DEFAULTS = {
        "statementTypeCode": "F",
        "statementDeliveryCode": "O",  # Online
        "statementMailToCode": "19",
        "statementHoldIndicator": "N",
        "icplusStatementFormatCode": "1",
        "enhancedReportingIndicator": "Y",
    }

    # Chargeback Defaults
    CHARGEBACK_DEFAULTS = {
        "chargebackAddressCode": "0",
        "chargebackPrenoteIndicator": "N",
        "chargebackPrenoteDays": 0,
        "holdChargebackIndicator": "0",
        "mediaRetrievalCode": "2",
    }

    # Settlement & Processing Defaults
    SETTLEMENT_DEFAULTS = {
        "alliancePlatformCode": "X",
        "markerBankCode": "999",
        "clearingBankCode": "999",
        "processingTypeCode": "9",
        "settleFrequencyCode": "00",
        "billbackCode": "P",
        "billbackHierarchyCode": "C",
        "billbackSurchargeCode": "N",
        "billbackRoundingIndicator": "N",
        "multiCurrencyIndicator": "N",
    }

    # Limits Defaults
    LIMITS_DEFAULTS = {
        "creditBinInclusionIndicator": "Y",
        "ptsLimitsIndicator": "Y",
        "adrpLimitAmount": 0,
        "adrpCumulativeLimitCount": 0,
        "adrpCumulativeLimitAmount": 0,
    }

    # Additional Merchant Defaults
    MERCHANT_DEFAULTS = {
        "franchiseIndicator": "0",
        "seasonalIndicator": "E",  # Not seasonal
        "aggregatorMerchantIndicator": "N",
        "billSuppliesIndicator": "N",
        "salesTaxExemptIndicator": "N",
        "languageCode": "EN",
        "boardingOriginCode": "API",
        "boardingTypeCode": "NEW",
    }

    # IRS/Tax Defaults
    IRS_DEFAULTS = {
        "irsSparkExclusionCode": "",
        "irsTinValidationCode": "",
        "irsWithholdingCode": "",
        "irsWithholdingReasonCode": "",
        "irsFederalWithholdingPercent": 0,
        "irsStateWithholdingPercent": 0,
        "irsFormCertStatusCode": "",
        "irsTurfReasonCode": "",
        "irsPayeeDefaultIndicator": "N",
    }

    # Addendum Field Defaults (Most important for Fiserv submission)
    ADDENDUM_DEFAULTS = {
        # American Express (disabled by default - requires separate setup)
        "americanExpressStatusCode": "N",
        "americanExpressMerchantId": "",
        "americanExpressOwnerCode": "",
        "americanExpressProcessingCenterCode": "",

        # Discover (enabled by default)
        "discoverNetworkIndicator": "Y",

        # Visa specific
        "visaTechnologyMigrationProgramRequestCode": "Y",
        "visaTechnologyMigrationProgramServiceLevelCode": "1",
        "visaTechnologyMigrationProgramEntryMode": "05",
        "visaTechnologyMigrationProgramPointofsaleCapabilityCode": "5",
        "visaTechnologyMigrationProgramCardholderIdCode": "S",
        "visaTechnologyMigrationProgramAuthSourceCode": "E",

        # Fraud & Security
        "efraudServiceCode": "0",
        "fraudFlexIndicator": "N",
        "trustkeeperIndicator": "N",
        "caseManagementIndicator": "Y",

        # Misc
        "recurringPaymentsIndicator": "N",
        "quasiCashIndicator": "N",
        "largeTicketPurchaseIndicator": "N",
        "convenienceFeeCode": "N",
        "surchargeExceptionCode": "N",
        "loyaltyProcessingCode": "0",
        "paymentEssentialsCode": "0",
        "rawDataAddendumIndicator": "N",
        "signatureCaptureIndicator": "N",
        "electronicSignatureIndicator": "Y",
        "reversal24HourProcessIndicator": "Y",
        "reversalDaylightSavingsIndicator": "Y",
        "reversalTimeZoneCode": "ET",
        "zeroInterchangeIndicator": "N",
        "volumeTierIndicator": "N",
        "volumeTierInterchangeFeeIndicator": "N",
        "splitFundingParticipationCode": "N",
        "indemnificationIndicator": "N",
        "periodicReviewIndicator": "N",
        "excessiveChargebackIndicator": "N",
        "descriptorEntitledIndicator": "Y",
        "branchDepositorIndicator": "N",
        "batchCaptureIndicator": "Y",
        "agentBankSplitIndicator": "N",
        "xrefIndicator": "N",
        "taxPayIndicator": "N",
        "specialNationalAccountIndicator": "N",
        "internationalTaxExemptIndicator": "N",
        "fireSafetyActIndicator": "N",
        "convertedAccountIndicator": "N",
        "cashManagementIndicator": "N",
        "internetCode": "0",
    }


# =============================================================================
# FIELD DERIVATION SERVICE
# =============================================================================

class FieldDerivationService:
    """
    Derives complete MPA field set from essential user inputs.

    Takes 26 essential fields and generates 180+ fields for Fiserv submission.
    """

    def __init__(self):
        self.defaults = SystemDefaults()

    def derive_all_fields(self, essential: EssentialFields) -> Dict[str, Any]:
        """
        Generate complete field set from essential inputs.

        Args:
            essential: User-provided essential fields

        Returns:
            Complete dictionary of all fields for MPA submission
        """
        result = {}

        # Tier 2: Derived fields
        result.update(self._derive_business_fields(essential))
        result.update(self._derive_owner_fields(essential))
        result.update(self._derive_bank_fields(essential))
        result.update(self._derive_processing_fields(essential))
        result.update(self._derive_tax_fields(essential))
        result.update(self._derive_card_descriptor_fields(essential))

        # Tier 3: System defaults
        result.update(self._apply_system_defaults())

        # Add hierarchy information
        result.update(self._build_hierarchy(essential))

        # Add email configuration
        result.update(self._build_email_config(essential))

        # Add card/product entitlements
        result.update(self._build_card_entitlements(essential))

        # Calculate limits based on volume
        result.update(self._calculate_limits(essential))

        return result

    def _derive_business_fields(self, essential: EssentialFields) -> Dict[str, Any]:
        """Derive business-related fields"""
        entity_info = ENTITY_TYPE_MAP.get(essential.business_type, {"code": "3", "description": "Corporation"})
        sic_code = MCC_TO_SIC_MAP.get(essential.mcc_code, essential.mcc_code)

        return {
            "legalBusinessName": essential.legal_name.upper()[:40],
            "dbaName": essential.dba_name.upper()[:40] if essential.dba_name else essential.legal_name.upper()[:40],
            "entityTypeCode": entity_info["code"],
            "primaryMccCode": essential.mcc_code,
            "sicCode": sic_code,
            "websiteUrlText": essential.website or "",
            "customerServicePhoneNumber": self._clean_phone(essential.customer_service_phone),

            # Business address
            "businessStreet": essential.business_address.street.upper()[:40],
            "businessCity": essential.business_address.city.upper()[:25],
            "businessState": essential.business_address.state.upper(),
            "businessZip": essential.business_address.zip[:10],
            "businessCountry": essential.business_address.country.upper(),
        }

    def _derive_owner_fields(self, essential: EssentialFields) -> Dict[str, Any]:
        """Derive owner/principal fields"""
        owners_data = []

        for owner in essential.owners:
            full_name = f"{owner.first_name} {owner.middle_name} {owner.last_name}".replace("  ", " ").strip()

            owner_data = {
                "ownerSequenceNumber": owner.sequence_number,
                "ownerFirstName": owner.first_name.upper()[:25],
                "ownerMiddleName": (owner.middle_name or "").upper()[:25],
                "ownerLastName": owner.last_name.upper()[:25],
                "ownerTitle": owner.title.upper()[:20],
                "ownerTaxId": self._mask_ssn(owner.ssn),  # Masked for storage
                "ownerFullSsn": self._clean_ssn(owner.ssn),  # Full for submission
                "ownerBirthDate": owner.dob,
                "ownerPhoneNumber": self._clean_phone(owner.phone),
                "ownerEmail": owner.email.lower(),
                "ownerAddress": owner.address.street.upper()[:40],
                "ownerCityName": owner.address.city.upper()[:25],
                "ownerStateCode": owner.address.state.upper(),
                "ownerPostalCode": owner.address.zip[:10],
                "ownerCountryCode": owner.address.country.upper(),
                "ownerPercent": int(owner.ownership_percent),
                "ownerGuarenteeIndicator": "Y" if owner.is_guarantor or owner.ownership_percent >= 25 else "N",
                "ownerSignerIndicator": "Y" if owner.sequence_number == 1 else "N",
            }
            owners_data.append(owner_data)

        # Primary owner for legacy fields
        primary_owner = essential.owners[0] if essential.owners else None

        result = {
            "merchantOwners": owners_data,
            "ownerCount": len(owners_data),
        }

        if primary_owner:
            # Legacy single-owner fields
            result["legalContactName"] = f"{primary_owner.first_name} {primary_owner.last_name}".upper()[:40]
            result["legalContactTitle"] = primary_owner.title.upper()[:20]

            # Sole proprietor specific
            if essential.business_type == "S":
                result["soleProprietorFirstName"] = primary_owner.first_name.upper()[:25]
                result["soleProprietorMiddleName"] = (primary_owner.middle_name or "").upper()[:25]
                result["soleProprietorLastName"] = primary_owner.last_name.upper()[:25]

        return result

    def _derive_bank_fields(self, essential: EssentialFields) -> Dict[str, Any]:
        """Derive bank account fields"""
        bank = essential.bank_info

        return {
            "bankName": bank.bank_name.upper()[:30],
            "bankRoutingNumber": self._clean_routing(bank.routing_number),
            "bankAccountNumber": bank.account_number,  # Will be encrypted before storage
            "bankAccountTypeCode": bank.account_type.upper(),
            "bankSequenceNumber": 1,
            "bankFundingFileCode": "1",

            # Merchant bank accounts structure
            "merchantBankAccounts": [{
                "bankSequenceNumber": 1,
                "bankRoutingNumber": self._clean_routing(bank.routing_number),
                "bankAccountNumber": bank.account_number,
                "bankAccountTypeCode": bank.account_type.upper(),
                "bankAccountEffectiveDate": datetime.now().strftime("%Y-%m-%d"),
                "bankFundingFileCode": "1",
            }],

            # Funding accounts for each category
            "merchantFundingAccounts": self._build_funding_accounts(),
        }

    def _derive_processing_fields(self, essential: EssentialFields) -> Dict[str, Any]:
        """Derive processing-related fields"""
        proc = essential.processing_info
        proc_config = PROCESSING_TYPE_MAP.get(proc.processing_type, PROCESSING_TYPE_MAP["RETAIL"])

        return {
            "signedVolumeAmount": int(proc.monthly_volume),
            "averageTicketAmount": int(proc.avg_ticket),
            "highTicketAmount": int(proc.high_ticket),
            "monthlyVolume": int(proc.monthly_volume),
            "avgTicket": int(proc.avg_ticket),
            "highTicket": int(proc.high_ticket),
            "keyedPercent": proc_config["keyed_percent"],
            "motoEcommerceCode": proc_config["code"],
            "processingTypeCode": proc.processing_type,
            "pricingTypeCode": "IC+",  # Always Interchange Plus for new merchants

            # E-commerce specific
            "internetSalesPercent": 100 if proc.processing_type == "ECOM" else (
                50 if proc.processing_type == "MIXED" else 0
            ),
        }

    def _derive_tax_fields(self, essential: EssentialFields) -> Dict[str, Any]:
        """Derive IRS/tax-related fields"""
        tax_id_type = TAX_ID_TYPE_MAP.get(essential.business_type, "3")
        payee_code = IRS_PAYEE_CODE_MAP.get(essential.business_type, "C")

        return {
            "taxId": self._clean_tax_id(essential.tax_id),
            "taxIdTypeCode": tax_id_type,
            "taxFilingName": essential.legal_name.upper()[:40],
            "irsPayeeCode": payee_code,
            "irsTaxEffectiveYear": str(datetime.now().year),
        }

    def _derive_card_descriptor_fields(self, essential: EssentialFields) -> Dict[str, Any]:
        """Derive card statement descriptor fields"""
        dba = essential.dba_name or essential.legal_name

        return {
            "cardAlternateName": dba.upper()[:25],
            "cardAlternateCity": essential.business_address.city.upper()[:13],
            "cardAlternateStateCode": essential.business_address.state.upper(),
            "cardAlternateUserDefinedText": "",
            "cardDescriptorCode": "2",  # Standard descriptor

            # MSIP fields
            "msipAlternateCityName": essential.business_address.city.upper()[:13],
            "msipAlternateMerchantName": dba.upper()[:25],
        }

    def _apply_system_defaults(self) -> Dict[str, Any]:
        """Apply all Tier 3 system defaults"""
        result = {}
        result.update(self.defaults.AUTH_DEFAULTS)
        result.update(self.defaults.FUNDING_DEFAULTS)
        result.update(self.defaults.AVS_DEFAULTS)
        result.update(self.defaults.CARD_NETWORK_DEFAULTS)
        result.update(self.defaults.STATEMENT_DEFAULTS)
        result.update(self.defaults.CHARGEBACK_DEFAULTS)
        result.update(self.defaults.SETTLEMENT_DEFAULTS)
        result.update(self.defaults.LIMITS_DEFAULTS)
        result.update(self.defaults.MERCHANT_DEFAULTS)
        result.update(self.defaults.IRS_DEFAULTS)
        result.update(self.defaults.ADDENDUM_DEFAULTS)

        # Add timestamps
        result["openDate"] = datetime.now().strftime("%Y-%m-%d")
        result["statusCode"] = "02"  # Pending
        result["statusDate"] = datetime.now().strftime("%Y-%m-%d")

        return result

    def _build_hierarchy(self, essential: EssentialFields) -> Dict[str, Any]:
        """Build merchant hierarchy structure"""
        addr = essential.business_address
        dba = essential.dba_name or essential.legal_name

        # Level 010 = Corporate/Legal
        # Level 019 = DBA/Outlet
        hierarchy = [
            {
                "levelCode": "010",
                "merchantName": essential.legal_name.upper()[:40],
                "addressAttentionText": essential.owners[0].first_name.upper() if essential.owners else "",
                "address1Text": addr.street.upper()[:40],
                "cityName": addr.city.upper()[:25],
                "stateCode": addr.state.upper(),
                "countryCode": addr.country.upper(),
                "postalCode": addr.zip[:10],
                "phoneNumber": self._clean_phone(essential.customer_service_phone),
            },
            {
                "levelCode": "019",
                "merchantName": dba.upper()[:40],
                "addressAttentionText": "",
                "address1Text": addr.street.upper()[:40],
                "cityName": addr.city.upper()[:25],
                "stateCode": addr.state.upper(),
                "countryCode": addr.country.upper(),
                "postalCode": addr.zip[:10],
                "phoneNumber": self._clean_phone(essential.customer_service_phone),
            },
        ]

        return {"merchantHierarchies": hierarchy}

    def _build_email_config(self, essential: EssentialFields) -> Dict[str, Any]:
        """Build email configuration"""
        primary_email = essential.owners[0].email if essential.owners else ""

        emails = [
            {
                "emailTypeCode": "001",  # Primary
                "emailText": primary_email.lower(),
                "emailContactName": f"{essential.owners[0].first_name} {essential.owners[0].last_name}" if essential.owners else "",
            },
            {
                "emailTypeCode": "003",  # Statements
                "emailText": primary_email.lower(),
            },
        ]

        return {"merchantEmails": emails}

    def _build_card_entitlements(self, essential: EssentialFields) -> Dict[str, Any]:
        """Build card/product entitlements"""
        mcc = essential.mcc_code

        # Default card products (Visa, MC, Discover, Amex)
        cards = [
            {
                "productCode": 1,  # Visa
                "cardTypeCode": "V",
                "effectiveDate": datetime.now().strftime("%Y-%m-%d"),
                "mccCode": mcc,
                "categoryCode": "11",
                "serviceTypeCode": "F",
                "clearingPlanCode": "000",
                "pricingPlanCode": "000",
                "edcCode": "0",
                "discountMethodCode": "A",
            },
            {
                "productCode": 2,  # Mastercard
                "cardTypeCode": "M",
                "effectiveDate": datetime.now().strftime("%Y-%m-%d"),
                "mccCode": mcc,
                "categoryCode": "11",
                "serviceTypeCode": "F",
                "clearingPlanCode": "000",
                "pricingPlanCode": "000",
                "edcCode": "0",
                "discountMethodCode": "A",
            },
            {
                "productCode": 3,  # Discover
                "cardTypeCode": "D",
                "effectiveDate": datetime.now().strftime("%Y-%m-%d"),
                "mccCode": mcc,
                "categoryCode": "11",
                "serviceTypeCode": "F",
                "clearingPlanCode": "000",
                "pricingPlanCode": "000",
                "edcCode": "0",
                "discountMethodCode": "A",
            },
        ]

        return {"merchantCards": cards}

    def _build_funding_accounts(self) -> List[Dict[str, Any]]:
        """Build funding account configuration for each category"""
        categories = [
            ("12", "Visa Credit"),
            ("13", "Visa Debit"),
            ("15", "Mastercard Credit"),
            ("16", "Mastercard Debit"),
            ("17", "Discover"),
            ("23", "Amex"),
            ("27", "Adjustments"),
            ("30", "Fees"),
            ("33", "Chargebacks"),
        ]

        return [
            {
                "fundingCategoryCode": code,
                "bankSequenceNumber": "01",
                "fundingRollupCode": "2",
                "fundingDivertCode": "N",
            }
            for code, _ in categories
        ]

    def _calculate_limits(self, essential: EssentialFields) -> Dict[str, Any]:
        """Calculate authorization and funding limits based on volume"""
        monthly = essential.processing_info.monthly_volume
        avg = essential.processing_info.avg_ticket
        high = essential.processing_info.high_ticket

        # Daily limit = monthly / 22 business days * 1.5 buffer
        daily_limit = int((monthly / 22) * 1.5)

        # Single transaction limit = high ticket * 1.2 buffer
        single_limit = int(high * 1.2)

        return {
            "salesLimitAmount": single_limit,
            "creditLimitAmount": int(single_limit * 0.5),
            "cumulativeSalesLimitAmount": daily_limit,
            "cumulativeCreditLimitAmount": int(daily_limit * 0.5),
            "fundingExcludeDailyLimitAmount": daily_limit,
            "fundingExclude30DayLimitAmount": int(monthly * 1.5),
            "cashAdvanceLimitAmount": 0,  # Disabled by default
        }

    # =============================================================================
    # HELPER METHODS
    # =============================================================================

    @staticmethod
    def _clean_phone(phone: str) -> str:
        """Clean phone number to digits only"""
        return "".join(filter(str.isdigit, phone))[:10]

    @staticmethod
    def _clean_ssn(ssn: str) -> str:
        """Clean SSN to digits only"""
        return "".join(filter(str.isdigit, ssn))[:9]

    @staticmethod
    def _mask_ssn(ssn: str) -> str:
        """Mask SSN for display/storage"""
        clean = "".join(filter(str.isdigit, ssn))[:9]
        if len(clean) >= 4:
            return f"*****{clean[-4:]}"
        return "*****"

    @staticmethod
    def _clean_tax_id(tax_id: str) -> str:
        """Clean tax ID to digits only"""
        return "".join(filter(str.isdigit, tax_id))[:9]

    @staticmethod
    def _clean_routing(routing: str) -> str:
        """Clean routing number to digits only"""
        return "".join(filter(str.isdigit, routing))[:9]


# =============================================================================
# VALIDATION SERVICE
# =============================================================================

class ValidationService:
    """Validates essential fields before derivation"""

    @staticmethod
    def validate_essential_fields(essential: EssentialFields) -> List[str]:
        """
        Validate essential fields and return list of errors.

        Returns empty list if all valid.
        """
        errors = []

        # Business validations
        if not essential.legal_name or len(essential.legal_name) < 2:
            errors.append("Legal business name is required")

        if not essential.tax_id or len(essential.tax_id.replace("-", "").replace(" ", "")) != 9:
            errors.append("Valid 9-digit Tax ID (EIN) is required")

        if essential.business_type not in ENTITY_TYPE_MAP:
            errors.append("Invalid business type")

        if not essential.mcc_code or len(essential.mcc_code) != 4:
            errors.append("Valid 4-digit MCC code is required")

        # Address validations
        addr = essential.business_address
        if not addr.street:
            errors.append("Business street address is required")
        if not addr.city:
            errors.append("Business city is required")
        if not addr.state or len(addr.state) != 2:
            errors.append("Valid 2-letter state code is required")
        if not addr.zip or len(addr.zip) < 5:
            errors.append("Valid ZIP code is required")

        # Owner validations
        if not essential.owners or len(essential.owners) == 0:
            errors.append("At least one owner/principal is required")
        else:
            total_ownership = sum(o.ownership_percent for o in essential.owners)
            if total_ownership < 75:
                errors.append("Total ownership must be at least 75%")

            for i, owner in enumerate(essential.owners):
                prefix = f"Owner {i + 1}: "
                if not owner.first_name:
                    errors.append(f"{prefix}First name is required")
                if not owner.last_name:
                    errors.append(f"{prefix}Last name is required")
                if not owner.ssn or len(owner.ssn.replace("-", "").replace(" ", "")) != 9:
                    errors.append(f"{prefix}Valid 9-digit SSN is required")
                if not owner.dob:
                    errors.append(f"{prefix}Date of birth is required")
                if not owner.email or "@" not in owner.email:
                    errors.append(f"{prefix}Valid email is required")
                if not owner.phone or len(owner.phone.replace("-", "").replace(" ", "").replace("(", "").replace(")", "")) < 10:
                    errors.append(f"{prefix}Valid phone number is required")

        # Bank validations
        bank = essential.bank_info
        if not bank.routing_number or len(bank.routing_number.replace("-", "").replace(" ", "")) != 9:
            errors.append("Valid 9-digit routing number is required")
        if not bank.account_number:
            errors.append("Bank account number is required")
        if bank.account_type not in ["C", "S"]:
            errors.append("Invalid account type (must be C or S)")

        # Processing validations
        proc = essential.processing_info
        if proc.monthly_volume <= 0:
            errors.append("Monthly volume must be greater than 0")
        if proc.avg_ticket <= 0:
            errors.append("Average ticket must be greater than 0")
        if proc.high_ticket < proc.avg_ticket:
            errors.append("High ticket must be greater than or equal to average ticket")
        if proc.processing_type not in PROCESSING_TYPE_MAP:
            errors.append("Invalid processing type")

        # Document validations
        if not essential.has_government_id:
            errors.append("Government-issued ID document is required")
        if not essential.has_voided_check:
            errors.append("Voided check or bank letter is required")

        return errors


# =============================================================================
# FACTORY FUNCTION
# =============================================================================

def create_derivation_service() -> FieldDerivationService:
    """Factory function to create derivation service instance"""
    return FieldDerivationService()


def create_validation_service() -> ValidationService:
    """Factory function to create validation service instance"""
    return ValidationService()

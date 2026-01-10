"""
Fiserv AccessOne North Boarding API Service

Integration service for merchant onboarding through Fiserv's AccessOne North Boarding API.
Supports MPA submission, status tracking, and resubmission workflows.

API Documentation: AccessOne North REST-Based Boarding API
Base URL: https://lsuat-api.fdportfoliomanager.com/boarding/north/NorthAsBoardingAPIService.svc/rest
"""

import hashlib
import httpx
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

logger = logging.getLogger(__name__)


class FiservChannel(str, Enum):
    """Available boarding channels"""
    FACS = "FACS"
    ITS = "ITS"


class FiservStatus(str, Enum):
    """MPA status codes returned by Fiserv"""
    SUBMITTED = "Submitted"
    PENDING_CREDIT = "Pending Credit Review"
    PENDING_BOS = "Pending BOS"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    ERROR = "Error"


class FiservAttachment(BaseModel):
    """Document attachment for credit resubmission"""
    ext_ref_id: str
    description: str
    file_type: str
    file_name: str
    file_content_base64: str


class MPASubmitResponse(BaseModel):
    """Response from MPA submission"""
    success: bool
    mpa_id: Optional[str] = None
    north_number: Optional[str] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    response_xml: Optional[str] = None


class MPAStatusResponse(BaseModel):
    """Response from status query"""
    success: bool
    mpa_id: Optional[str] = None
    ext_ref_id: Optional[str] = None
    status: Optional[str] = None
    north_number: Optional[str] = None
    status_message: Optional[str] = None
    error_message: Optional[str] = None


class FiservBoardingService:
    """
    Service for interacting with Fiserv AccessOne North Boarding API.

    Handles merchant onboarding through REST endpoints including:
    - MPA submission (new applications)
    - MPA resubmission (corrections)
    - Status tracking
    - Credit underwriting resubmission
    - BOS resubmission
    """

    def __init__(
        self,
        api_user: str,
        api_password: str,
        base_url: str = "https://lsuat-api.fdportfoliomanager.com/boarding/north/NorthAsBoardingAPIService.svc/rest",
        channel: str = "FACS"
    ):
        """
        Initialize the Fiserv Boarding Service.

        Args:
            api_user: API username provided by Fiserv
            api_password: Plain text password (will be SHA-256 hashed)
            base_url: API base URL (default is UAT environment)
            channel: Boarding channel (FACS or ITS)
        """
        self.api_user = api_user
        self.api_token = self._hash_password(api_password)
        self.base_url = base_url.rstrip('/')
        self.channel = channel

        self.headers = {
            "user": self.api_user,
            "token": self.api_token,
            "Content-Type": "application/xml"
        }

    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password using SHA-256 as required by Fiserv API"""
        return hashlib.sha256(password.encode()).hexdigest()

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, str]] = None,
        data: Optional[str] = None,
        timeout: float = 60.0
    ) -> Dict[str, Any]:
        """
        Make an HTTP request to the Fiserv API.

        Args:
            method: HTTP method (GET, POST, PUT)
            endpoint: API endpoint (appended to base_url)
            params: Query parameters
            data: Request body (XML content)
            timeout: Request timeout in seconds

        Returns:
            Dict with response data or error info
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    params=params,
                    content=data
                )

                logger.info(f"Fiserv API {method} {endpoint}: {response.status_code}")

                if response.status_code == 200:
                    return {
                        "success": True,
                        "status_code": response.status_code,
                        "content": response.text
                    }
                else:
                    logger.error(f"Fiserv API error: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "status_code": response.status_code,
                        "error": response.text
                    }

        except httpx.TimeoutException:
            logger.error(f"Fiserv API timeout: {endpoint}")
            return {"success": False, "error": "Request timeout"}
        except Exception as e:
            logger.error(f"Fiserv API exception: {str(e)}")
            return {"success": False, "error": str(e)}

    async def submit_mpa(
        self,
        xml_content: str,
        ext_ref_id: str,
        channel: Optional[str] = None
    ) -> MPASubmitResponse:
        """
        Submit a new Merchant Processing Agreement (MPA).

        Args:
            xml_content: Complete MPA XML document
            ext_ref_id: External reference ID (your unique identifier)
            channel: Override default channel (FACS or ITS)

        Returns:
            MPASubmitResponse with MPA ID and status
        """
        endpoint = "SubmitMPA"
        params = {
            "extRefId": ext_ref_id,
            "channel": channel or self.channel
        }

        result = await self._make_request("POST", endpoint, params=params, data=xml_content)

        if result.get("success"):
            # Parse XML response to extract MPA ID and status
            response_xml = result.get("content", "")
            mpa_id = self._extract_xml_value(response_xml, "MPAId")
            north_number = self._extract_xml_value(response_xml, "NorthNumber")
            status = self._extract_xml_value(response_xml, "Status")

            return MPASubmitResponse(
                success=True,
                mpa_id=mpa_id,
                north_number=north_number,
                status=status,
                response_xml=response_xml
            )
        else:
            return MPASubmitResponse(
                success=False,
                error_message=result.get("error")
            )

    async def resubmit_mpa(
        self,
        xml_content: str,
        ext_ref_id: str,
        north_number: str
    ) -> MPASubmitResponse:
        """
        Resubmit a corrected MPA (for rejected applications).

        Args:
            xml_content: Complete corrected MPA XML document
            ext_ref_id: External reference ID
            north_number: North number from original submission

        Returns:
            MPASubmitResponse with updated status
        """
        endpoint = "ReSubmitMPA"
        params = {
            "extRefId": ext_ref_id,
            "northNumber": north_number
        }

        result = await self._make_request("PUT", endpoint, params=params, data=xml_content)

        if result.get("success"):
            response_xml = result.get("content", "")
            mpa_id = self._extract_xml_value(response_xml, "MPAId")
            status = self._extract_xml_value(response_xml, "Status")

            return MPASubmitResponse(
                success=True,
                mpa_id=mpa_id,
                north_number=north_number,
                status=status,
                response_xml=response_xml
            )
        else:
            return MPASubmitResponse(
                success=False,
                error_message=result.get("error")
            )

    async def get_status_by_mpa_id(
        self,
        mpa_id: str,
        ext_ref_id: str
    ) -> MPAStatusResponse:
        """
        Get MPA status by MPA ID.

        Args:
            mpa_id: The MPA ID returned from submission
            ext_ref_id: External reference ID

        Returns:
            MPAStatusResponse with current status
        """
        endpoint = "GetStatusByMPAID"
        params = {
            "mpaId": mpa_id,
            "extRefId": ext_ref_id
        }

        result = await self._make_request("GET", endpoint, params=params)

        if result.get("success"):
            response_xml = result.get("content", "")
            status = self._extract_xml_value(response_xml, "Status")
            north_number = self._extract_xml_value(response_xml, "NorthNumber")
            status_message = self._extract_xml_value(response_xml, "StatusMessage")

            return MPAStatusResponse(
                success=True,
                mpa_id=mpa_id,
                ext_ref_id=ext_ref_id,
                status=status,
                north_number=north_number,
                status_message=status_message
            )
        else:
            return MPAStatusResponse(
                success=False,
                error_message=result.get("error")
            )

    async def search_by_ext_ref_id(self, ext_ref_id: str) -> MPAStatusResponse:
        """
        Search for an MPA by external reference ID.

        Args:
            ext_ref_id: External reference ID

        Returns:
            MPAStatusResponse with MPA details
        """
        endpoint = "SearchByExtRefID"
        params = {"extRefId": ext_ref_id}

        result = await self._make_request("GET", endpoint, params=params)

        if result.get("success"):
            response_xml = result.get("content", "")
            mpa_id = self._extract_xml_value(response_xml, "MPAId")
            status = self._extract_xml_value(response_xml, "Status")
            north_number = self._extract_xml_value(response_xml, "NorthNumber")

            return MPAStatusResponse(
                success=True,
                mpa_id=mpa_id,
                ext_ref_id=ext_ref_id,
                status=status,
                north_number=north_number
            )
        else:
            return MPAStatusResponse(
                success=False,
                error_message=result.get("error")
            )

    async def retrieve_mpa_xml(
        self,
        mpa_id: str,
        ext_ref_id: str
    ) -> Dict[str, Any]:
        """
        Retrieve the original MPA XML document.

        Args:
            mpa_id: The MPA ID
            ext_ref_id: External reference ID

        Returns:
            Dict with success status and XML content
        """
        endpoint = "RetrieveMpaXml"
        params = {
            "mpaId": mpa_id,
            "extRefId": ext_ref_id
        }

        result = await self._make_request("GET", endpoint, params=params)

        return {
            "success": result.get("success", False),
            "xml_content": result.get("content") if result.get("success") else None,
            "error": result.get("error") if not result.get("success") else None
        }

    async def get_status_by_timespan(
        self,
        from_timestamp: datetime,
        to_timestamp: datetime
    ) -> List[MPAStatusResponse]:
        """
        Get all MPA statuses within a time range.

        Args:
            from_timestamp: Start of time range
            to_timestamp: End of time range

        Returns:
            List of MPAStatusResponse for all MPAs in range
        """
        endpoint = "GetStatusByTimeSpan"
        params = {
            "fromTimeStamp": from_timestamp.strftime("%Y-%m-%dT%H:%M:%S"),
            "toTimeStamp": to_timestamp.strftime("%Y-%m-%dT%H:%M:%S")
        }

        result = await self._make_request("GET", endpoint, params=params)

        if result.get("success"):
            # Parse XML to extract multiple MPA records
            response_xml = result.get("content", "")
            mpas = self._parse_mpa_list(response_xml)
            return mpas
        else:
            return []

    async def resubmit_to_credit_underwriting(
        self,
        mpa_id: str,
        ext_ref_id: str,
        attachments: List[FiservAttachment]
    ) -> MPASubmitResponse:
        """
        Resubmit MPA to credit underwriting with additional documents.

        Args:
            mpa_id: The MPA ID
            ext_ref_id: External reference ID
            attachments: List of document attachments

        Returns:
            MPASubmitResponse with updated status
        """
        endpoint = "ReSubmitToCreditUnderwriting"
        params = {
            "mpaId": mpa_id,
            "extRefId": ext_ref_id
        }

        # Build XML for attachments
        attachments_xml = self._build_attachments_xml(attachments)

        result = await self._make_request("PUT", endpoint, params=params, data=attachments_xml)

        if result.get("success"):
            response_xml = result.get("content", "")
            status = self._extract_xml_value(response_xml, "Status")

            return MPASubmitResponse(
                success=True,
                mpa_id=mpa_id,
                status=status,
                response_xml=response_xml
            )
        else:
            return MPASubmitResponse(
                success=False,
                error_message=result.get("error")
            )

    async def resubmit_to_bos(
        self,
        mpa_id: str,
        ext_ref_id: str,
        xml_content: str
    ) -> MPASubmitResponse:
        """
        Resubmit MPA to BOS (Back Office System) after credit approval.

        Args:
            mpa_id: The MPA ID
            ext_ref_id: External reference ID
            xml_content: Updated MPA XML (if changes needed)

        Returns:
            MPASubmitResponse with updated status
        """
        endpoint = "ReSubmitToBOS"
        params = {
            "mpaId": mpa_id,
            "extRefId": ext_ref_id
        }

        result = await self._make_request("PUT", endpoint, params=params, data=xml_content)

        if result.get("success"):
            response_xml = result.get("content", "")
            status = self._extract_xml_value(response_xml, "Status")
            north_number = self._extract_xml_value(response_xml, "NorthNumber")

            return MPASubmitResponse(
                success=True,
                mpa_id=mpa_id,
                north_number=north_number,
                status=status,
                response_xml=response_xml
            )
        else:
            return MPASubmitResponse(
                success=False,
                error_message=result.get("error")
            )

    @staticmethod
    def _extract_xml_value(xml_content: str, tag: str) -> Optional[str]:
        """Extract a value from XML by tag name (simple regex-based parsing)"""
        import re
        pattern = f"<{tag}>([^<]*)</{tag}>"
        match = re.search(pattern, xml_content, re.IGNORECASE)
        return match.group(1) if match else None

    def _parse_mpa_list(self, xml_content: str) -> List[MPAStatusResponse]:
        """Parse XML containing multiple MPA records"""
        import re
        mpas = []

        # Find all MPA elements
        mpa_pattern = r"<MPA>(.*?)</MPA>"
        mpa_matches = re.findall(mpa_pattern, xml_content, re.DOTALL | re.IGNORECASE)

        for mpa_xml in mpa_matches:
            mpa_id = self._extract_xml_value(mpa_xml, "MPAId")
            ext_ref_id = self._extract_xml_value(mpa_xml, "ExtRefId")
            status = self._extract_xml_value(mpa_xml, "Status")
            north_number = self._extract_xml_value(mpa_xml, "NorthNumber")

            mpas.append(MPAStatusResponse(
                success=True,
                mpa_id=mpa_id,
                ext_ref_id=ext_ref_id,
                status=status,
                north_number=north_number
            ))

        return mpas

    def _build_attachments_xml(self, attachments: List[FiservAttachment]) -> str:
        """Build XML for document attachments"""
        attachment_elements = []

        for att in attachments:
            attachment_elements.append(f"""
            <Attachment>
                <ExtRefId>{att.ext_ref_id}</ExtRefId>
                <Description>{att.description}</Description>
                <FileType>{att.file_type}</FileType>
                <FileName>{att.file_name}</FileName>
                <FileContent>{att.file_content_base64}</FileContent>
            </Attachment>
            """)

        return f"""<?xml version="1.0" encoding="utf-8"?>
        <Attachments>
            {''.join(attachment_elements)}
        </Attachments>
        """


class MPAXmlBuilder:
    """
    Helper class to build MPA XML documents for Fiserv submission.

    This creates the complete XML structure required by AccessOne North API
    including all addendum fields for successful merchant boarding.
    """

    @staticmethod
    def build_mpa_xml(derived_fields: Dict[str, Any]) -> str:
        """
        Build a complete MPA XML document from derived fields.

        Args:
            derived_fields: Complete field dictionary from FieldDerivationService

        Returns:
            XML string ready for Fiserv submission
        """
        # Extract commonly used fields
        f = derived_fields

        # Build owners XML
        owners_xml = MPAXmlBuilder._build_owners_xml(f.get("merchantOwners", []))

        # Build bank accounts XML
        bank_accounts_xml = MPAXmlBuilder._build_bank_accounts_xml(f.get("merchantBankAccounts", []))

        # Build funding accounts XML
        funding_accounts_xml = MPAXmlBuilder._build_funding_accounts_xml(f.get("merchantFundingAccounts", []))

        # Build card entitlements XML
        cards_xml = MPAXmlBuilder._build_cards_xml(f.get("merchantCards", []))

        # Build hierarchy XML
        hierarchy_xml = MPAXmlBuilder._build_hierarchy_xml(f.get("merchantHierarchies", []))

        # Build emails XML
        emails_xml = MPAXmlBuilder._build_emails_xml(f.get("merchantEmails", []))

        return f"""<?xml version="1.0" encoding="utf-8"?>
<MerchantApplication xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <!-- ============================================== -->
    <!-- BUSINESS INFORMATION -->
    <!-- ============================================== -->
    <BusinessInfo>
        <LegalBusinessName>{f.get('legalBusinessName', '')}</LegalBusinessName>
        <DBAName>{f.get('dbaName', '')}</DBAName>
        <LegalContactName>{f.get('legalContactName', '')}</LegalContactName>
        <LegalContactTitle>{f.get('legalContactTitle', '')}</LegalContactTitle>
        <SoleProprietorFirstName>{f.get('soleProprietorFirstName', '')}</SoleProprietorFirstName>
        <SoleProprietorMiddleName>{f.get('soleProprietorMiddleName', '')}</SoleProprietorMiddleName>
        <SoleProprietorLastName>{f.get('soleProprietorLastName', '')}</SoleProprietorLastName>
        <WebsiteUrlText>{f.get('websiteUrlText', '')}</WebsiteUrlText>
        <CustomerServicePhoneNumber>{f.get('customerServicePhoneNumber', '')}</CustomerServicePhoneNumber>
        <EntityTypeCode>{f.get('entityTypeCode', '3')}</EntityTypeCode>
        <PrimaryMccCode>{f.get('primaryMccCode', '')}</PrimaryMccCode>
        <SicCode>{f.get('sicCode', '')}</SicCode>
        <FranchiseIndicator>{f.get('franchiseIndicator', '0')}</FranchiseIndicator>
        <SeasonalIndicator>{f.get('seasonalIndicator', 'E')}</SeasonalIndicator>
        <AggregatorMerchantIndicator>{f.get('aggregatorMerchantIndicator', 'N')}</AggregatorMerchantIndicator>
        <LanguageCode>{f.get('languageCode', 'EN')}</LanguageCode>
        <BoardingOriginCode>{f.get('boardingOriginCode', 'API')}</BoardingOriginCode>
        <BoardingTypeCode>{f.get('boardingTypeCode', 'NEW')}</BoardingTypeCode>
        <StatusCode>{f.get('statusCode', '02')}</StatusCode>
        <StatusDate>{f.get('statusDate', '')}</StatusDate>
        <OpenDate>{f.get('openDate', '')}</OpenDate>
        <Address>
            <Street>{f.get('businessStreet', '')}</Street>
            <City>{f.get('businessCity', '')}</City>
            <State>{f.get('businessState', '')}</State>
            <ZipCode>{f.get('businessZip', '')}</ZipCode>
            <Country>{f.get('businessCountry', 'US')}</Country>
        </Address>
    </BusinessInfo>

    <!-- ============================================== -->
    <!-- TAX / IRS INFORMATION -->
    <!-- ============================================== -->
    <TaxInfo>
        <TaxId>{f.get('taxId', '')}</TaxId>
        <TaxIdTypeCode>{f.get('taxIdTypeCode', '3')}</TaxIdTypeCode>
        <TaxFilingName>{f.get('taxFilingName', '')}</TaxFilingName>
        <IrsPayeeCode>{f.get('irsPayeeCode', 'C')}</IrsPayeeCode>
        <IrsTaxEffectiveYear>{f.get('irsTaxEffectiveYear', '')}</IrsTaxEffectiveYear>
        <IrsSparkExclusionCode>{f.get('irsSparkExclusionCode', '')}</IrsSparkExclusionCode>
        <IrsTinValidationCode>{f.get('irsTinValidationCode', '')}</IrsTinValidationCode>
        <IrsWithholdingCode>{f.get('irsWithholdingCode', '')}</IrsWithholdingCode>
        <IrsFederalWithholdingPercent>{f.get('irsFederalWithholdingPercent', '0')}</IrsFederalWithholdingPercent>
        <IrsStateWithholdingPercent>{f.get('irsStateWithholdingPercent', '0')}</IrsStateWithholdingPercent>
        <IrsPayeeDefaultIndicator>{f.get('irsPayeeDefaultIndicator', 'N')}</IrsPayeeDefaultIndicator>
        <SalesTaxExemptIndicator>{f.get('salesTaxExemptIndicator', 'N')}</SalesTaxExemptIndicator>
        <InternationalTaxExemptIndicator>{f.get('internationalTaxExemptIndicator', 'N')}</InternationalTaxExemptIndicator>
    </TaxInfo>

    <!-- ============================================== -->
    <!-- CARD DESCRIPTOR INFORMATION -->
    <!-- ============================================== -->
    <CardDescriptor>
        <CardAlternateName>{f.get('cardAlternateName', '')}</CardAlternateName>
        <CardAlternateCity>{f.get('cardAlternateCity', '')}</CardAlternateCity>
        <CardAlternateStateCode>{f.get('cardAlternateStateCode', '')}</CardAlternateStateCode>
        <CardAlternateUserDefinedText>{f.get('cardAlternateUserDefinedText', '')}</CardAlternateUserDefinedText>
        <CardDescriptorCode>{f.get('cardDescriptorCode', '2')}</CardDescriptorCode>
        <DescriptorEntitledIndicator>{f.get('descriptorEntitledIndicator', 'Y')}</DescriptorEntitledIndicator>
    </CardDescriptor>

    <!-- ============================================== -->
    <!-- PRINCIPAL / OWNER INFORMATION -->
    <!-- ============================================== -->
    <PrincipalInfo>
        <OwnerCount>{f.get('ownerCount', 1)}</OwnerCount>
        {owners_xml}
    </PrincipalInfo>

    <!-- ============================================== -->
    <!-- BANK ACCOUNT INFORMATION -->
    <!-- ============================================== -->
    <BankInfo>
        <BankName>{f.get('bankName', '')}</BankName>
        <BankRoutingNumber>{f.get('bankRoutingNumber', '')}</BankRoutingNumber>
        <BankAccountNumber>{f.get('bankAccountNumber', '')}</BankAccountNumber>
        <BankAccountTypeCode>{f.get('bankAccountTypeCode', 'C')}</BankAccountTypeCode>
        {bank_accounts_xml}
    </BankInfo>

    <!-- ============================================== -->
    <!-- FUNDING CONFIGURATION -->
    <!-- ============================================== -->
    <FundingInfo>
        <FundingBankCode>{f.get('fundingBankCode', '999')}</FundingBankCode>
        <FundingMethodCode>{f.get('fundingMethodCode', '25')}</FundingMethodCode>
        <FundingCurrencyCode>{f.get('fundingCurrencyCode', '840')}</FundingCurrencyCode>
        <FundingRunCode>{f.get('fundingRunCode', '2')}</FundingRunCode>
        <FundingRollupCode>{f.get('fundingRollupCode', '2')}</FundingRollupCode>
        <FundingDepositCode>{f.get('fundingDepositCode', '1')}</FundingDepositCode>
        <FundingAchUsageCode>{f.get('fundingAchUsageCode', '1')}</FundingAchUsageCode>
        <FundingAchDelayDays>{f.get('fundingAchDelayDays', '2')}</FundingAchDelayDays>
        <FundingAchHoldIndicator>{f.get('fundingAchHoldIndicator', 'N')}</FundingAchHoldIndicator>
        <FundingExcludeCode>{f.get('fundingExcludeCode', 'N')}</FundingExcludeCode>
        <FundingExcludeDailyLimitAmount>{f.get('fundingExcludeDailyLimitAmount', '99999')}</FundingExcludeDailyLimitAmount>
        <FundingExclude30DayLimitAmount>{f.get('fundingExclude30DayLimitAmount', '99999')}</FundingExclude30DayLimitAmount>
        <FundingRppDelayDays>{f.get('fundingRppDelayDays', '0')}</FundingRppDelayDays>
        <FundingRppMinimumAmount>{f.get('fundingRppMinimumAmount', '0')}</FundingRppMinimumAmount>
        <FundingRppPercent>{f.get('fundingRppPercent', '0')}</FundingRppPercent>
        {funding_accounts_xml}
    </FundingInfo>

    <!-- ============================================== -->
    <!-- PROCESSING CONFIGURATION -->
    <!-- ============================================== -->
    <ProcessingInfo>
        <MonthlyVolume>{f.get('monthlyVolume', '0')}</MonthlyVolume>
        <SignedVolumeAmount>{f.get('signedVolumeAmount', '0')}</SignedVolumeAmount>
        <AverageTicket>{f.get('avgTicket', '0')}</AverageTicket>
        <HighTicket>{f.get('highTicket', '0')}</HighTicket>
        <KeyedPercent>{f.get('keyedPercent', '10')}</KeyedPercent>
        <MotoEcommerceCode>{f.get('motoEcommerceCode', 'R')}</MotoEcommerceCode>
        <InternetSalesPercent>{f.get('internetSalesPercent', '0')}</InternetSalesPercent>
        <PricingTypeCode>{f.get('pricingTypeCode', 'IC+')}</PricingTypeCode>
        <ProcessingTypeCode>{f.get('processingTypeCode', 'RETAIL')}</ProcessingTypeCode>
    </ProcessingInfo>

    <!-- ============================================== -->
    <!-- AUTHORIZATION CONFIGURATION -->
    <!-- ============================================== -->
    <AuthorizationInfo>
        <AuthPrimaryNetworkCode>{f.get('authPrimaryNetworkCode', 'A')}</AuthPrimaryNetworkCode>
        <AuthSecondaryNetworkCode>{f.get('authSecondaryNetworkCode', 'A')}</AuthSecondaryNetworkCode>
        <AuthTypeCode>{f.get('authTypeCode', '1')}</AuthTypeCode>
        <EncryptServiceLevelCode>{f.get('encryptServiceLevelCode', '01')}</EncryptServiceLevelCode>
        <EncryptTokenHierarchyCode>{f.get('encryptTokenHierarchyCode', '00')}</EncryptTokenHierarchyCode>
        <EncryptTokenCode>{f.get('encryptTokenCode', '0001')}</EncryptTokenCode>
        <EncryptTypeCode>{f.get('encryptTypeCode', '06')}</EncryptTypeCode>
        <EtcOptionCode>{f.get('etcOptionCode', '1')}</EtcOptionCode>
        <EtcBypassEditsIndicator>{f.get('etcBypassEditsIndicator', 'Y')}</EtcBypassEditsIndicator>
    </AuthorizationInfo>

    <!-- ============================================== -->
    <!-- AVS CONFIGURATION -->
    <!-- ============================================== -->
    <AvsInfo>
        <AvsServiceIndicator>{f.get('avsServiceIndicator', 'Y')}</AvsServiceIndicator>
        <AvsAddressIndicator>{f.get('avsAddressIndicator', 'Y')}</AvsAddressIndicator>
        <AvsZipIndicator>{f.get('avsZipIndicator', 'Y')}</AvsZipIndicator>
        <AvsWholeZipIndicator>{f.get('avsWholeZipIndicator', 'N')}</AvsWholeZipIndicator>
        <AvsExactIndicator>{f.get('avsExactIndicator', 'N')}</AvsExactIndicator>
        <AvsNoIndicator>{f.get('avsNoIndicator', 'N')}</AvsNoIndicator>
        <AvsRetryIndicator>{f.get('avsRetryIndicator', 'N')}</AvsRetryIndicator>
        <AvsUnavailableIndicator>{f.get('avsUnavailableIndicator', 'N')}</AvsUnavailableIndicator>
        <AvsYesIndicator>{f.get('avsYesIndicator', 'Y')}</AvsYesIndicator>
    </AvsInfo>

    <!-- ============================================== -->
    <!-- LIMITS CONFIGURATION -->
    <!-- ============================================== -->
    <LimitsInfo>
        <SalesLimitAmount>{f.get('salesLimitAmount', '0')}</SalesLimitAmount>
        <CreditLimitAmount>{f.get('creditLimitAmount', '0')}</CreditLimitAmount>
        <CumulativeSalesLimitAmount>{f.get('cumulativeSalesLimitAmount', '0')}</CumulativeSalesLimitAmount>
        <CumulativeCreditLimitAmount>{f.get('cumulativeCreditLimitAmount', '0')}</CumulativeCreditLimitAmount>
        <CashAdvanceLimitAmount>{f.get('cashAdvanceLimitAmount', '0')}</CashAdvanceLimitAmount>
        <CreditBinInclusionIndicator>{f.get('creditBinInclusionIndicator', 'Y')}</CreditBinInclusionIndicator>
        <PtsLimitsIndicator>{f.get('ptsLimitsIndicator', 'Y')}</PtsLimitsIndicator>
        <AdrpLimitAmount>{f.get('adrpLimitAmount', '0')}</AdrpLimitAmount>
    </LimitsInfo>

    <!-- ============================================== -->
    <!-- CARD NETWORK CONFIGURATION -->
    <!-- ============================================== -->
    <CardNetworkInfo>
        <VisaDebitAcceptIndicator>{f.get('visaDebitAcceptIndicator', 'Y')}</VisaDebitAcceptIndicator>
        <VisaRelationshipIndicator>{f.get('visaRelationshipIndicator', 'N')}</VisaRelationshipIndicator>
        <VisaIramIndicator>{f.get('visaIramIndicator', 'N')}</VisaIramIndicator>
        <MastercardIramIndicator>{f.get('mastercardIramIndicator', 'N')}</MastercardIramIndicator>
        <CommercialCardInterchangeServiceCode>{f.get('commercialCardInterchangeServiceCode', 'Y')}</CommercialCardInterchangeServiceCode>
        <EmvIndicator>{f.get('emvIndicator', 'Y')}</EmvIndicator>
        <VisaTechnologyMigrationProgramRequestCode>{f.get('visaTechnologyMigrationProgramRequestCode', 'Y')}</VisaTechnologyMigrationProgramRequestCode>
        <VisaTechnologyMigrationProgramServiceLevelCode>{f.get('visaTechnologyMigrationProgramServiceLevelCode', '1')}</VisaTechnologyMigrationProgramServiceLevelCode>
        <VisaTechnologyMigrationProgramEntryMode>{f.get('visaTechnologyMigrationProgramEntryMode', '05')}</VisaTechnologyMigrationProgramEntryMode>
    </CardNetworkInfo>

    <!-- ============================================== -->
    <!-- STATEMENT & REPORTING CONFIGURATION -->
    <!-- ============================================== -->
    <StatementInfo>
        <StatementTypeCode>{f.get('statementTypeCode', 'F')}</StatementTypeCode>
        <StatementDeliveryCode>{f.get('statementDeliveryCode', 'O')}</StatementDeliveryCode>
        <StatementMailToCode>{f.get('statementMailToCode', '19')}</StatementMailToCode>
        <StatementHoldIndicator>{f.get('statementHoldIndicator', 'N')}</StatementHoldIndicator>
        <EnhancedReportingIndicator>{f.get('enhancedReportingIndicator', 'Y')}</EnhancedReportingIndicator>
    </StatementInfo>

    <!-- ============================================== -->
    <!-- CHARGEBACK CONFIGURATION -->
    <!-- ============================================== -->
    <ChargebackInfo>
        <ChargebackAddressCode>{f.get('chargebackAddressCode', '0')}</ChargebackAddressCode>
        <ChargebackPrenoteIndicator>{f.get('chargebackPrenoteIndicator', 'N')}</ChargebackPrenoteIndicator>
        <ChargebackPrenoteDays>{f.get('chargebackPrenoteDays', '0')}</ChargebackPrenoteDays>
        <HoldChargebackIndicator>{f.get('holdChargebackIndicator', '0')}</HoldChargebackIndicator>
        <MediaRetrievalCode>{f.get('mediaRetrievalCode', '2')}</MediaRetrievalCode>
        <CaseManagementIndicator>{f.get('caseManagementIndicator', 'Y')}</CaseManagementIndicator>
    </ChargebackInfo>

    <!-- ============================================== -->
    <!-- SETTLEMENT CONFIGURATION -->
    <!-- ============================================== -->
    <SettlementInfo>
        <AlliancePlatformCode>{f.get('alliancePlatformCode', 'X')}</AlliancePlatformCode>
        <MarkerBankCode>{f.get('markerBankCode', '999')}</MarkerBankCode>
        <ClearingBankCode>{f.get('clearingBankCode', '999')}</ClearingBankCode>
        <ProcessingTypeCode>{f.get('processingTypeCode', '9')}</ProcessingTypeCode>
        <SettleFrequencyCode>{f.get('settleFrequencyCode', '00')}</SettleFrequencyCode>
        <BillbackCode>{f.get('billbackCode', 'P')}</BillbackCode>
        <BillbackHierarchyCode>{f.get('billbackHierarchyCode', 'C')}</BillbackHierarchyCode>
        <BillbackSurchargeCode>{f.get('billbackSurchargeCode', 'N')}</BillbackSurchargeCode>
        <BillSuppliesIndicator>{f.get('billSuppliesIndicator', 'N')}</BillSuppliesIndicator>
        <MultiCurrencyIndicator>{f.get('multiCurrencyIndicator', 'N')}</MultiCurrencyIndicator>
    </SettlementInfo>

    <!-- ============================================== -->
    <!-- ADDENDUM FIELDS -->
    <!-- ============================================== -->
    <AddendumFields>
        <RecurringPaymentsIndicator>{f.get('recurringPaymentsIndicator', 'N')}</RecurringPaymentsIndicator>
        <QuasiCashIndicator>{f.get('quasiCashIndicator', 'N')}</QuasiCashIndicator>
        <LargeTicketPurchaseIndicator>{f.get('largeTicketPurchaseIndicator', 'N')}</LargeTicketPurchaseIndicator>
        <ConvenienceFeeCode>{f.get('convenienceFeeCode', 'N')}</ConvenienceFeeCode>
        <SurchargeExceptionCode>{f.get('surchargeExceptionCode', 'N')}</SurchargeExceptionCode>
        <LoyaltyProcessingCode>{f.get('loyaltyProcessingCode', '0')}</LoyaltyProcessingCode>
        <PaymentEssentialsCode>{f.get('paymentEssentialsCode', '0')}</PaymentEssentialsCode>
        <EfraudServiceCode>{f.get('efraudServiceCode', '0')}</EfraudServiceCode>
        <FraudFlexIndicator>{f.get('fraudFlexIndicator', 'N')}</FraudFlexIndicator>
        <TrustkeeperIndicator>{f.get('trustkeeperIndicator', 'N')}</TrustkeeperIndicator>
        <ElectronicSignatureIndicator>{f.get('electronicSignatureIndicator', 'Y')}</ElectronicSignatureIndicator>
        <SignatureCaptureIndicator>{f.get('signatureCaptureIndicator', 'N')}</SignatureCaptureIndicator>
        <BatchCaptureIndicator>{f.get('batchCaptureIndicator', 'Y')}</BatchCaptureIndicator>
        <Reversal24HourProcessIndicator>{f.get('reversal24HourProcessIndicator', 'Y')}</Reversal24HourProcessIndicator>
        <ReversalDaylightSavingsIndicator>{f.get('reversalDaylightSavingsIndicator', 'Y')}</ReversalDaylightSavingsIndicator>
        <ReversalTimeZoneCode>{f.get('reversalTimeZoneCode', 'ET')}</ReversalTimeZoneCode>
        <InternetCode>{f.get('internetCode', '0')}</InternetCode>
        <ZeroInterchangeIndicator>{f.get('zeroInterchangeIndicator', 'N')}</ZeroInterchangeIndicator>
        <VolumeTierIndicator>{f.get('volumeTierIndicator', 'N')}</VolumeTierIndicator>
        <SplitFundingParticipationCode>{f.get('splitFundingParticipationCode', 'N')}</SplitFundingParticipationCode>
        <IndemnificationIndicator>{f.get('indemnificationIndicator', 'N')}</IndemnificationIndicator>
        <PeriodicReviewIndicator>{f.get('periodicReviewIndicator', 'N')}</PeriodicReviewIndicator>
        <ExcessiveChargebackIndicator>{f.get('excessiveChargebackIndicator', 'N')}</ExcessiveChargebackIndicator>
        <BranchDepositorIndicator>{f.get('branchDepositorIndicator', 'N')}</BranchDepositorIndicator>
        <AgentBankSplitIndicator>{f.get('agentBankSplitIndicator', 'N')}</AgentBankSplitIndicator>
        <XrefIndicator>{f.get('xrefIndicator', 'N')}</XrefIndicator>
        <TaxPayIndicator>{f.get('taxPayIndicator', 'N')}</TaxPayIndicator>
        <SpecialNationalAccountIndicator>{f.get('specialNationalAccountIndicator', 'N')}</SpecialNationalAccountIndicator>
        <FireSafetyActIndicator>{f.get('fireSafetyActIndicator', 'N')}</FireSafetyActIndicator>
        <ConvertedAccountIndicator>{f.get('convertedAccountIndicator', 'N')}</ConvertedAccountIndicator>
        <CashManagementIndicator>{f.get('cashManagementIndicator', 'N')}</CashManagementIndicator>
    </AddendumFields>

    <!-- ============================================== -->
    <!-- CARD ENTITLEMENTS -->
    <!-- ============================================== -->
    <CardEntitlements>
        {cards_xml}
    </CardEntitlements>

    <!-- ============================================== -->
    <!-- MERCHANT HIERARCHY -->
    <!-- ============================================== -->
    <MerchantHierarchy>
        {hierarchy_xml}
    </MerchantHierarchy>

    <!-- ============================================== -->
    <!-- EMAIL CONFIGURATION -->
    <!-- ============================================== -->
    <EmailConfiguration>
        {emails_xml}
    </EmailConfiguration>

</MerchantApplication>
"""

    @staticmethod
    def _build_owners_xml(owners: List[Dict[str, Any]]) -> str:
        """Build XML for merchant owners"""
        if not owners:
            return ""

        owner_elements = []
        for owner in owners:
            owner_elements.append(f"""
        <Owner>
            <OwnerSequenceNumber>{owner.get('ownerSequenceNumber', 1)}</OwnerSequenceNumber>
            <OwnerFirstName>{owner.get('ownerFirstName', '')}</OwnerFirstName>
            <OwnerMiddleName>{owner.get('ownerMiddleName', '')}</OwnerMiddleName>
            <OwnerLastName>{owner.get('ownerLastName', '')}</OwnerLastName>
            <OwnerTitle>{owner.get('ownerTitle', '')}</OwnerTitle>
            <OwnerTaxId>{owner.get('ownerFullSsn', owner.get('ownerTaxId', ''))}</OwnerTaxId>
            <OwnerBirthDate>{owner.get('ownerBirthDate', '')}</OwnerBirthDate>
            <OwnerPhoneNumber>{owner.get('ownerPhoneNumber', '')}</OwnerPhoneNumber>
            <OwnerEmail>{owner.get('ownerEmail', '')}</OwnerEmail>
            <OwnerAddress>{owner.get('ownerAddress', '')}</OwnerAddress>
            <OwnerCityName>{owner.get('ownerCityName', '')}</OwnerCityName>
            <OwnerStateCode>{owner.get('ownerStateCode', '')}</OwnerStateCode>
            <OwnerPostalCode>{owner.get('ownerPostalCode', '')}</OwnerPostalCode>
            <OwnerCountryCode>{owner.get('ownerCountryCode', 'US')}</OwnerCountryCode>
            <OwnerPercent>{owner.get('ownerPercent', 100)}</OwnerPercent>
            <OwnerGuarenteeIndicator>{owner.get('ownerGuarenteeIndicator', 'Y')}</OwnerGuarenteeIndicator>
            <OwnerSignerIndicator>{owner.get('ownerSignerIndicator', 'N')}</OwnerSignerIndicator>
        </Owner>""")

        return "\n".join(owner_elements)

    @staticmethod
    def _build_bank_accounts_xml(accounts: List[Dict[str, Any]]) -> str:
        """Build XML for bank accounts"""
        if not accounts:
            return ""

        account_elements = []
        for account in accounts:
            account_elements.append(f"""
        <BankAccount>
            <BankSequenceNumber>{account.get('bankSequenceNumber', 1)}</BankSequenceNumber>
            <BankRoutingNumber>{account.get('bankRoutingNumber', '')}</BankRoutingNumber>
            <BankAccountNumber>{account.get('bankAccountNumber', '')}</BankAccountNumber>
            <BankAccountTypeCode>{account.get('bankAccountTypeCode', 'C')}</BankAccountTypeCode>
            <BankAccountEffectiveDate>{account.get('bankAccountEffectiveDate', '')}</BankAccountEffectiveDate>
            <BankFundingFileCode>{account.get('bankFundingFileCode', '1')}</BankFundingFileCode>
        </BankAccount>""")

        return "\n".join(account_elements)

    @staticmethod
    def _build_funding_accounts_xml(accounts: List[Dict[str, Any]]) -> str:
        """Build XML for funding accounts"""
        if not accounts:
            return ""

        account_elements = []
        for account in accounts:
            account_elements.append(f"""
        <FundingAccount>
            <FundingCategoryCode>{account.get('fundingCategoryCode', '')}</FundingCategoryCode>
            <BankSequenceNumber>{account.get('bankSequenceNumber', '01')}</BankSequenceNumber>
            <FundingRollupCode>{account.get('fundingRollupCode', '2')}</FundingRollupCode>
            <FundingDivertCode>{account.get('fundingDivertCode', 'N')}</FundingDivertCode>
        </FundingAccount>""")

        return "\n".join(account_elements)

    @staticmethod
    def _build_cards_xml(cards: List[Dict[str, Any]]) -> str:
        """Build XML for card entitlements"""
        if not cards:
            return ""

        card_elements = []
        for card in cards:
            card_elements.append(f"""
        <Card>
            <ProductCode>{card.get('productCode', '')}</ProductCode>
            <CardTypeCode>{card.get('cardTypeCode', '')}</CardTypeCode>
            <EffectiveDate>{card.get('effectiveDate', '')}</EffectiveDate>
            <MccCode>{card.get('mccCode', '')}</MccCode>
            <CategoryCode>{card.get('categoryCode', '11')}</CategoryCode>
            <ServiceTypeCode>{card.get('serviceTypeCode', 'F')}</ServiceTypeCode>
            <ClearingPlanCode>{card.get('clearingPlanCode', '000')}</ClearingPlanCode>
            <PricingPlanCode>{card.get('pricingPlanCode', '000')}</PricingPlanCode>
            <EdcCode>{card.get('edcCode', '0')}</EdcCode>
            <DiscountMethodCode>{card.get('discountMethodCode', 'A')}</DiscountMethodCode>
        </Card>""")

        return "\n".join(card_elements)

    @staticmethod
    def _build_hierarchy_xml(hierarchy: List[Dict[str, Any]]) -> str:
        """Build XML for merchant hierarchy"""
        if not hierarchy:
            return ""

        level_elements = []
        for level in hierarchy:
            level_elements.append(f"""
        <HierarchyLevel>
            <LevelCode>{level.get('levelCode', '')}</LevelCode>
            <MerchantName>{level.get('merchantName', '')}</MerchantName>
            <AddressAttentionText>{level.get('addressAttentionText', '')}</AddressAttentionText>
            <Address1Text>{level.get('address1Text', '')}</Address1Text>
            <CityName>{level.get('cityName', '')}</CityName>
            <StateCode>{level.get('stateCode', '')}</StateCode>
            <CountryCode>{level.get('countryCode', 'US')}</CountryCode>
            <PostalCode>{level.get('postalCode', '')}</PostalCode>
            <PhoneNumber>{level.get('phoneNumber', '')}</PhoneNumber>
        </HierarchyLevel>""")

        return "\n".join(level_elements)

    @staticmethod
    def _build_emails_xml(emails: List[Dict[str, Any]]) -> str:
        """Build XML for email configuration"""
        if not emails:
            return ""

        email_elements = []
        for email in emails:
            email_elements.append(f"""
        <Email>
            <EmailTypeCode>{email.get('emailTypeCode', '001')}</EmailTypeCode>
            <EmailText>{email.get('emailText', '')}</EmailText>
            <EmailContactName>{email.get('emailContactName', '')}</EmailContactName>
        </Email>""")

        return "\n".join(email_elements)

    @staticmethod
    def build_mpa_xml_legacy(
        # Business Information
        legal_name: str,
        dba_name: str,
        tax_id: str,
        business_type: str,
        mcc_code: str,
        business_address: Dict[str, str],

        # Owner/Principal Information
        owner_name: str,
        owner_ssn_last4: str,
        owner_dob: str,
        owner_address: Dict[str, str],
        owner_phone: str,
        owner_email: str,

        # Bank Information
        bank_name: str,
        routing_number: str,
        account_number: str,

        # Processing Information
        monthly_volume: float,
        avg_ticket: float,
        high_ticket: float,

        # Optional fields
        website: Optional[str] = None,
        customer_service_phone: Optional[str] = None
    ) -> str:
        """
        Legacy method for backwards compatibility.

        Build a simplified MPA XML document using individual parameters.
        Use build_mpa_xml() with derived_fields for complete submissions.
        """

        return f"""<?xml version="1.0" encoding="utf-8"?>
<MerchantApplication xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <BusinessInfo>
        <LegalName>{legal_name}</LegalName>
        <DBAName>{dba_name}</DBAName>
        <TaxId>{tax_id}</TaxId>
        <BusinessType>{business_type}</BusinessType>
        <MCC>{mcc_code}</MCC>
        <Address>
            <Street>{business_address.get('street', '')}</Street>
            <City>{business_address.get('city', '')}</City>
            <State>{business_address.get('state', '')}</State>
            <ZipCode>{business_address.get('zip', '')}</ZipCode>
            <Country>{business_address.get('country', 'US')}</Country>
        </Address>
        <Website>{website or ''}</Website>
        <CustomerServicePhone>{customer_service_phone or ''}</CustomerServicePhone>
    </BusinessInfo>

    <PrincipalInfo>
        <Name>{owner_name}</Name>
        <SSNLast4>{owner_ssn_last4}</SSNLast4>
        <DateOfBirth>{owner_dob}</DateOfBirth>
        <Phone>{owner_phone}</Phone>
        <Email>{owner_email}</Email>
        <Address>
            <Street>{owner_address.get('street', '')}</Street>
            <City>{owner_address.get('city', '')}</City>
            <State>{owner_address.get('state', '')}</State>
            <ZipCode>{owner_address.get('zip', '')}</ZipCode>
            <Country>{owner_address.get('country', 'US')}</Country>
        </Address>
    </PrincipalInfo>

    <BankInfo>
        <BankName>{bank_name}</BankName>
        <RoutingNumber>{routing_number}</RoutingNumber>
        <AccountNumber>{account_number}</AccountNumber>
    </BankInfo>

    <ProcessingInfo>
        <MonthlyVolume>{monthly_volume}</MonthlyVolume>
        <AverageTicket>{avg_ticket}</AverageTicket>
        <HighTicket>{high_ticket}</HighTicket>
    </ProcessingInfo>
</MerchantApplication>
"""


# Factory function to create service instance from settings
def create_fiserv_service() -> Optional[FiservBoardingService]:
    """
    Create a FiservBoardingService instance using environment settings.

    Returns None if credentials are not configured.
    """
    import os

    api_user = os.getenv("FISERV_API_USER", "")
    api_password = os.getenv("FISERV_API_PASSWORD", "")
    api_url = os.getenv("FISERV_API_URL", "https://lsuat-api.fdportfoliomanager.com/boarding/north/NorthAsBoardingAPIService.svc/rest")
    channel = os.getenv("FISERV_NORTH_CHANNEL", "FACS")

    if not api_user or not api_password:
        logger.warning("Fiserv API credentials not configured")
        return None

    return FiservBoardingService(
        api_user=api_user,
        api_password=api_password,
        base_url=api_url,
        channel=channel
    )

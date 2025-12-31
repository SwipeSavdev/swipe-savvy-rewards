// Fintech Icon Set
// 30 professional fintech and financial technology SVG icons
// Imported as raw SVG so we can render inline and inherit currentColor.

import apiIntegration from './API Integration.svg?raw'
import bigDataAnalytics from './Big Data Analytics.svg?raw'
import biometricAuthentication from './Biometric Authentication.svg?raw'
import blockchain from './Blockchain.svg?raw'
import cashlessTransactions from './Cashless Transactions.svg?raw'
import cloudInvoice from './Cloud Invoice.svg?raw'
import contactlessPayments from './Contactless Payments.svg?raw'
import crowdfunding from './Crowdfunding.svg?raw'
import cryptocurrency from './Cryptocurrency.svg?raw'
import digitalIdentity from './Digital Identity.svg?raw'
import digitalWallet from './Digital Wallet.svg?raw'
import eCommerce from './E-Commerce.svg?raw'
import financialApps from './Financial Apps.svg?raw'
import financialInclusion from './Financial Inclusion.svg?raw'
import financialSecurity from './Financial Security.svg?raw'
import fraudDetection from './Fraud Detection.svg?raw'
import insurance from './Insurance.svg?raw'
import investmentPlatforms from './Investment Platforms.svg?raw'
import mobileBanking from './Mobile Banking.svg?raw'
import moneyTransfer from './Money Transfer.svg?raw'
import onlinePayments from './Online Payments.svg?raw'
import openBanking from './Open Banking.svg?raw'
import peerToPeerLanding from './Peer-to-peer Landing.svg?raw'
import personalFinanceManagement from './Personal Finance Management.svg?raw'
import regulatoryTechnology from './Regulatory Technology.svg?raw'
import riskAssessment from './Risk Assessment.svg?raw'
import roboAdvisory from './Robo-Advisory.svg?raw'
import stockTrading from './Stock Trading.svg?raw'
import virtualCurrencies from './Virtual Currencies.svg?raw'
import wealthManagement from './Wealth management.svg?raw'

export const FINTECH_ICONS = {
  api_integration: apiIntegration,
  big_data_analytics: bigDataAnalytics,
  biometric_authentication: biometricAuthentication,
  blockchain,
  cashless_transactions: cashlessTransactions,
  cloud_invoice: cloudInvoice,
  contactless_payments: contactlessPayments,
  crowdfunding,
  cryptocurrency,
  digital_identity: digitalIdentity,
  digital_wallet: digitalWallet,
  ecommerce: eCommerce,
  financial_apps: financialApps,
  financial_inclusion: financialInclusion,
  financial_security: financialSecurity,
  fraud_detection: fraudDetection,
  insurance,
  investment_platforms: investmentPlatforms,
  mobile_banking: mobileBanking,
  money_transfer: moneyTransfer,
  online_payments: onlinePayments,
  open_banking: openBanking,
  peer_to_peer_landing: peerToPeerLanding,
  personal_finance_management: personalFinanceManagement,
  regulatory_technology: regulatoryTechnology,
  risk_assessment: riskAssessment,
  robo_advisory: roboAdvisory,
  stock_trading: stockTrading,
  virtual_currencies: virtualCurrencies,
  wealth_management: wealthManagement,
} as const

export type FintechIconName = keyof typeof FINTECH_ICONS

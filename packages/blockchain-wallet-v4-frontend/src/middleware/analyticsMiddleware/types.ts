import { Coin } from '@core'
import { BSPaymentTypes } from '@core/types'
import { RecurringBuyOrigins, RecurringBuyPeriods, SetPeriodPayload } from 'data/types'

enum AnalyticsKey {
  ADDRESS_VERIFY_MESSAGE_CLICKED = 'Address Verify Message Clicked',
  ADD_MOBILE_NUMBER_CLICKED = 'Add Mobile Number Clicked',
  AMOUNT_SWITCHED = 'Amount Switched',
  BUY_AMOUNT_ENTERED = 'Buy Amount Entered',
  BUY_AMOUNT_MAX_CLICKED = 'Buy Amount Max Clicked',
  BUY_AMOUNT_MIN_CLICKED = 'Buy Amount Min Clicked',
  BUY_PAYMENT_METHOD_SELECTED = 'Buy Payment Method Selected',
  BUY_SELL_CLICKED = 'Buy Sell Clicked',
  BUY_SELL_VIEWED = 'Buy Sell Viewed',
  CANCEL_RECURRING_BUY_CLICKED = 'Cancel Recurring Buy Clicked',
  CHANGE_MOBILE_NUMBER_CLICKED = 'Change Mobile Number Clicked',
  CLOUD_BACKUP_CODE_SCANNED = 'Cloud Backup Code Scanned',
  CRYPTO_LINK_HANDLING_CLICKED = 'Crypto Link Handling Clicked',
  DASHBOARD_CLICKED = 'Dashboard Clicked',
  DASHBOARD_VIEWED = 'Dashboard Viewed',
  DEPOSIT_AMOUNT_ENTERED = 'Deposit Amount Entered',
  DEPOSIT_CLICKED = 'Deposit Clicked',
  DEPOSIT_METHOD_SELECTED = 'Deposit Method Selected',
  DEPOSIT_VIEWED = 'Deposit Viewed',
  EMAIL_VERIFICATION_REQUESTED = 'Email Verification Requested',
  EMAIL_VERIFICATION_SKIPPED = 'Email Verification Skipped',
  IMPORT_ADDRESS_CLICKED = 'Import Address Clicked',
  INTEREST_CLICKED = 'Interest Clicked',
  INTEREST_DEPOSIT_CLICKED = 'Interest Deposit Clicked',
  INTEREST_DEPOSIT_VIEWED = 'Interest Deposit Viewed',
  INTEREST_VIEWED = 'Interest Viewed',
  INTEREST_WITHDRAWAL_CLICKED = 'Interest Withdrawal Clicked',
  INTEREST_WITHDRAWAL_VIEWED = 'Interest Withdrawal Viewed',
  LINK_BANK_CLICKED = 'Link Bank Clicked',
  LOGIN_VIEWED = 'Login Viewed',
  MANAGE_TAB_SELECTION_CLICKED = 'Manage Tab Selection Clicked',
  NEW_ACCOUNT_PASSWORD_ENTERED = 'New Account Password Entered',
  NFT_ORDER_CREATED = 'NFT Order Created',
  NOTIFICATION_PREFERENCES_UPDATED = 'Notification Preferences Updated',
  PRIVATE_KEYS_SHOWN = 'Private Keys Shown',
  RECEIVE_CURRENCY_SELECTED = 'Receive Currency Selected',
  RECEIVE_DETAILS_COPIED = 'Receive Details Copied',
  RECOVERY_PHRASE_ENTERED = 'Recovery Phrase Entered',
  RECURRING_BUY_ACTIVATED = 'Recurring Buy Activated',
  RECURRING_BUY_CANCELLED = 'Recurring Buy Cancelled',
  RECURRING_BUY_CLICKED = 'Recurring Buy Clicked',
  RECURRING_BUY_DETAILS_CLICKED = 'Recurring Buy Details Clicked',
  RECURRING_BUY_INFO_VIEWED = 'Recurring Buy Info Viewed',
  RECURRING_BUY_LEARN_MORE_CLICKED = 'Recurring Buy Learn More Clicked',
  RECURRING_BUY_PERIOD_SELECTED = 'Recurring Buy Period Selected',
  RECURRING_BUY_SUGGESTION_SKIPPED = 'Recurring Buy Suggestion Skipped',
  RECURRING_BUY_VIEWED = 'Recurring Buy Viewed',
  SELL_AMOUNT_ENTERED = 'Sell Amount Entered',
  SELL_AMOUNT_MAX_CLICKED = 'Sell Amount Max Clicked',
  SELL_AMOUNT_MIN_CLICKED = 'Sell Amount Min Clicked',
  SELL_FROM_SELECTED = 'Sell From Selected',
  SEND_AMOUNT_ENTERED = 'Send Amount Entered',
  SEND_RECEIVE_CLICKED = 'Send Receive Clicked',
  SEND_RECEIVE_VIEWED = 'Send Receive Viewed',
  SEND_SUBMITTED = 'Send Submitted',
  SETTINGS_CURRENCY_CLICKED = 'Settings Currency Clicked',
  SETTINGS_HYPERLINK_CLICKED = 'Settings Hyperlink Clicked',
  SETTINGS_TAB_CLICKED = 'Settings Tab Clicked',
  SWAP_ACCOUNTS_SELECTED = 'Swap Accounts Selected',
  SWAP_AMOUNT_ENTERED = 'Swap Amount Entered',
  SWAP_AMOUNT_MAX_CLICKED = 'Swap Amount Max Clicked',
  SWAP_AMOUNT_MIN_CLICKED = 'Swap Amount Min Clicked',
  SWAP_CLICKED = 'Swap Clicked',
  SWAP_FROM_SELECTED = 'Swap From Selected',
  SWAP_RECEIVE_SELECTED = 'Swap Receive Selected',
  SWAP_REQUESTED = 'Swap Requested',
  SWAP_VIEWED = 'Swap Viewed',
  UPGRADE_VERIFICATION_CLICKED = 'Upgrade Verification Clicked',
  WITHDRAWAL_CLICKED = 'Withdrawal Clicked',
  WITHDRAWAL_METHOD_SELECTED = 'Withdrawal Method Selected',
  WITHDRAWAL_VIEWED = 'Withdrawal Viewed'
}

type AnalyticsTraits = {
  email?: string
  nabuId: string
  tier?: number
}

type RawEvent = {
  key: AnalyticsKey
  payload: AnalyticsValue
}

enum AccountType {
  CUSTODIAL = 'CUSTODIAL',
  SAVINGS = 'SAVINGS',
  TRADING = 'TRADING',
  USERKEY = 'USERKEY'
}

enum Order {
  BUY = 'BUY',
  SELL = 'SELL'
}

enum PaymentType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FUNDS = 'FUNDS',
  PAYMENT_CARD = 'PAYMENT_CARD'
}

enum FeeRate {
  BACKEND = 'BACKEND',
  CUSTOM = 'CUSTOM',
  NORMAL = 'NORMAL',
  PRIORITY = 'PRIORITY'
}

enum DepositMethod {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

enum LoginHelpClickedOrigin {
  IDENTIFIER = 'IDENTIFIER',
  PASSWORD = 'PASSWORD',
  QR_CODE = 'QR_CODE',
  UPGRADE_ACCOUNT_NEW_PASSWORD = 'UPGRADE_ACCOUNT_NEW_PASSWORD'
}

enum SendReceive {
  RECEIVE = 'RECEIVE',
  SEND = 'SEND'
}

enum WithdrawalMethod {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

type BasePayload = {
  originalTimestamp: string
}

type PageViewPayload = {
  path: string
  referrer: string
  search: string
  title: string
  url: string
}

type PageName =
  | '/home'
  | '/earn'
  | '/login'
  | '/settings/addresses/btc'
  | '/settings/addresses/bch'
  | '/settings/addresses/eth'
  | '/settings/addresses/xlm'
// | '/settings/general'
// | '/settings/preferences'
//

type AddressVerifyMessageClickedPayload = BasePayload & { currency: string }

type AddMobileNumberClickedPayload = BasePayload

type AmountSwitchedPayload = BasePayload & {
  product: 'SAVINGS' | 'SIMPLEBUY' | 'SWAP'
  switch_to: Coin
}

type BuyAmountEnteredPayload = BasePayload & {
  input_amount: number
  input_currency: string
  max_card_limit: number
  output_currency: string
}

type BuyAmountMaxClickedPayload = BasePayload & {
  input_currency: string
  max_card_limit: number
  output_currency: string
}

type BuyAmountMinClickedPayload = BasePayload & {
  input_currency: string
  output_currency: string
}

type BuyPaymentMethodSelectedPayload = BasePayload & {
  payment_type: PaymentType
}

type BuySellClickedOrigin =
  | 'BUY_WIDGET'
  | 'CURRENCY_PAGE'
  | 'DASHBOARD_PROMO'
  | 'DEEP_LINK'
  | 'EMPTY_FEED'
  | 'LINK_BANK'
  | 'NAVIGATION'
  | 'PENDING_ORDER'
  | 'PRICE_CHART'
  | 'SAVINGS'
  | 'SAVINGS_CONFIRMATION'
  | 'SELL'
  | 'SEND'
  | 'SETTINGS'
  | 'SIMPLETRADE'
  | 'TRANSACTION_DETAILS'
  | 'TRANSACTION_LIST'
  | 'WELCOME'

type BuySellClickedPayload = BasePayload & {
  origin: BuySellClickedOrigin
  type: Order
}

type BuySellViewedPayload = BasePayload &
  PageViewPayload & {
    type: Order
  }

type ChangeMobileNumberClickedPayload = BasePayload

type CryptoLinkHandlingClickedPayload = BasePayload

type DashboardClickedOrigin = 'SIGN_IN'

type DashboardClickedPayload = BasePayload & {
  origin: DashboardClickedOrigin
}

type DashboardViewedPayload = BasePayload & PageViewPayload

type DepositAmountEnteredPayload = BasePayload & {
  amount: number
  currency: string
  deposit_method: DepositMethod
}

type DepositClickedOrigin = 'CURRENCY_PAGE'

type DepositClickedPayload = BasePayload & {
  origin: DepositClickedOrigin
}

type DepositMethodSelectedPayload = BasePayload & {
  currency: string
  deposit_method: DepositMethod
}

type DepositViewedPayload = BasePayload & PageViewPayload

type EmailVerificationSkippedPayload = BasePayload & {
  origin: 'SIGN_UP'
}

type EmailVerificationRequestedOrigin = 'SIGN_UP' | 'VERIFICATION'

type EmailVerificationRequestedPayload = BasePayload & {
  origin: EmailVerificationRequestedOrigin
}

type ImportAddressClickedPayload = BasePayload

type InterestClickedOrigin = 'NAVIGATION'

type InterestClickedPayload = BasePayload & {
  origin: InterestClickedOrigin
}

type InterestDepositAmountEnteredPayload = BasePayload & {
  amount: number
  amount_currency: string
  currency: string
  from_account_type: AccountType
  input_amount: number
  interest_rate: number
  output_amount: number
}

type InterestDepositClickedOrigin =
  | 'CURRENCY_PAGE'
  | 'SAVINGS_CONFIRMATION'
  | 'SAVINGS_PAGE'
  | 'SEND'

type InterestDepositClickedPayload = BasePayload & {
  currency: string
  origin: InterestDepositClickedOrigin
}

type InterestDepositMaxAmountClickedPayload = BasePayload & {
  amount_currency: string
  currency: string
  from_account_type: AccountType
}

type InterestDepositMinAmountClickedPayload = BasePayload & {
  amount_currency: string
  currency: string
  from_account_type: AccountType
}

type InterestDepositViewedPayload = BasePayload & PageViewPayload

type InterestSubmitInformationClickedOrigin = 'SAVINGS_CONFIRMATION' | 'SAVINGS_PAGE'

type InterestSubmitInformationClickedPayload = BasePayload & {
  origin: InterestSubmitInformationClickedOrigin
}

type InterestViewedPayload = BasePayload & PageViewPayload

type InterestWithdrawalClickedOrigin = 'CURRENCY_PAGE'

type InterestWithdrawalClickedPayload = BasePayload & {
  currency: string
  origin: InterestWithdrawalClickedOrigin
}

type InterestWithdrawalViewedPayload = BasePayload & PageViewPayload

type LinkBankClickedOrigin = 'BUY' | 'DEPOSIT' | 'SETTINGS' | 'WITHDRAW'

type LinkBankClickedPayload = BasePayload & {
  origin: LinkBankClickedOrigin
}

type LoginHelpClickedPayload = BasePayload & {
  origin: LoginHelpClickedOrigin
  site_redirect: 'WALLET' | 'EXCHANGE'
}

type LoginRequestApprovedOrFailedPayload = BasePayload & {
  error?: 'REJECTED' | 'EXPIRED' | 'TIMED_OUT' | 'UNKNOWN'
  method: 'SECURE_CHANNEL' | 'MAGIC_LINK'
}

type LoginViewed = BasePayload & {
  device_origin: string
}

type SignUpCountrySelectPayload = BasePayload & {
  country: string
}
type SignUpCountryStateSelectPayload = BasePayload & {
  country_state: string
}

type LoginIdentifierEnteredPayload = BasePayload & {
  identifier_type: 'EMAIL' | 'WALLET_ID'
}

type LoginIdentifierFailedPayload = BasePayload & {
  error_code: string
  error_message: string
}

type LoginMethodSelectedPayload = BasePayload & {
  login_method: 'PASSWORD' | 'SECURE_CHANNEL'
}
type ManageTabSelectionClickedSelection =
  | 'EDIT_WALLET_NAME'
  | 'RECOVER_FUNDS'
  | 'SHOW_CHANGE_ADDRESSES'
  | 'SHOW_XPUB'

type LoginRequestPayload = BasePayload & {
  request_platform: 'EXCHANGE' | 'WALLET'
}

type ManageTabSelectionClickedPayload = BasePayload & {
  currency: string
  selection: ManageTabSelectionClickedSelection
}

type NotificationPreferencesUpdatedPayload = BasePayload & {
  email_enabled: boolean
  sms_enabled: boolean
}

type PrivateKeysShownPayload = BasePayload & {
  currency: string
}

type ReceiveCurrencySelectedPayload = BasePayload & {
  account_type: AccountType
  currency: string
}

type ReceiveDetailsCopiedPayload = BasePayload & {
  account_type: AccountType
  currency: string
}

type RecoveryOptionSelectedPayload = BasePayload & {
  recovery_type: 'CLOUD_BACKUP' | 'RECOVERY_PHRASE'
}

type ResetAccountPayload = BasePayload & {
  origin: 'RESET_CONFIRMATION' | 'RESET_FINAL_WARNING' | 'RECOVERY_PHRASE' | 'RECOVERY_OPTIONS'
}

export type RecurringBuyPeriodSelectionPayload = BasePayload & SetPeriodPayload

export type RecurringBuyViewedPayload = BasePayload & {
  path: string
  referrer: string
  search: string
  title: string
  url: string
}

export type RecurringBuyLearnMoreClickPayload = BasePayload & {
  origin: RecurringBuyOrigins
}

export type RecurringBuySuggestionSkippedPayload = BasePayload & {
  origin: RecurringBuyOrigins
}

export type RecurringBuyInfoViewedPayload = BasePayload & {
  page: number
}

export type RecurringBuyCancelPayload = BasePayload & {
  frequency: RecurringBuyPeriods
  input_amount: number
  input_currency: string
  origin: 'TRANSACTION_DETAILS' | 'RECURRING_BUY_DETAILS'
  output_currency: string
  payment_method: BSPaymentTypes
}

export type RecurringBuyClickedPayload = BasePayload & {
  origin: keyof typeof RecurringBuyOrigins
}

export type RecurringBuyDetailsClickedPayload = BasePayload & {
  currency: string
  origin: 'CURRENCY_PAGE' | 'TRANSACTION_LIST'
}

type SellAmountEnteredPayload = BasePayload & {
  from_account_type: AccountType
  input_amount: number
  input_currency: string
  output_currency: string
}

type SellAmountMaxClickedPayload = BasePayload & {
  from_account_type: AccountType
  input_currency: string
  output_currency: string
}

type SellAmountMinClickedPayload = BasePayload & {
  from_account_type: AccountType
  input_currency: string
  output_currency: string
}

type SellFromSelectedPayload = BasePayload & {
  from_account_type: AccountType
  input_currency: string
}

type SendAmountEnteredPayload = BasePayload & {
  currency: string
  fee_rate: FeeRate
  from_account_type: AccountType
  to_account_type: AccountType
}

type SendAmountMaxClickedPayload = BasePayload & {
  currency: string
  from_account_type: AccountType
  to_account_type: AccountType
}

type SendFeeRateSelectedPayload = BasePayload & {
  currency: string
  fee_rate: FeeRate
  from_account_type: AccountType
  to_account_type: AccountType
}

type SendFromSelectedPayload = BasePayload & {
  currency: string
  from_account_type: AccountType
}

type SendReceiveClickedOrigin = 'CURRENCY_PAGE' | 'NAVIGATION' | 'NO_HOLDINGS' | 'TRANSACTIONS_PAGE'

type SendReceiveClickedPayload = BasePayload & {
  currency: string
  origin: SendReceiveClickedOrigin
  type: 'RECEIVE' | 'SEND'
}

type SendReceiveViewedPayload = BasePayload & {
  type: 'RECEIVE' | 'SEND'
}

type SendSubmittedPayload = BasePayload & {
  currency: string
  fee_rate: FeeRate
  from_account_type: AccountType
  to_account_type: AccountType
}

type SettingsCurrencyClickedPayload = BasePayload & {
  currency: string
}

type SettingsHyperlinkClickedDestination = 'ABOUT' | 'PRIVACY_POLICY' | 'TERMS_OF_SERVICE'

type SettingsHyperlinkClickedPayload = BasePayload & {
  destination: SettingsHyperlinkClickedDestination
}

type SettingsTabClickedDestination =
  | 'GENERAL'
  | 'PREFERENCES'
  | 'TRADING_LIMITS'
  | 'WALLETS&ADDRESSES'

type SettingsTabClickedPayload = BasePayload & {
  settings_tab: SettingsTabClickedDestination
}

type SignedUpPayload = BasePayload

type SignedInPayload = BasePayload

type SignedOutPayload = BasePayload

type SwapClickedOrigin =
  | 'CURRENCY_PAGE'
  | 'DASHBOARD_PROMO'
  | 'DEEP_LINK'
  | 'NAVIGATION'
  | 'PRICES_PAGE'
  | 'SEND'
  | 'SETTINGS'

type SwapClickedPayload = BasePayload & {
  origin: SwapClickedOrigin
}

type SwapViewedPayload = BasePayload & PageViewPayload

type SwapAccountsSelectedPayload = BasePayload & {
  input_currency: string
  input_type: Omit<AccountType, AccountType.SAVINGS>
  output_currency: string
  output_type: Omit<AccountType, AccountType.SAVINGS>
}

type SwapAmountEnteredPayload = BasePayload & {
  input_amount: number
  input_currency: string
  input_type: Omit<AccountType, AccountType.SAVINGS>
  output_amount: number
  output_currency: string
  output_type: Omit<AccountType, AccountType.SAVINGS>
}

type SwapAmountMaxClickedPayload = BasePayload & {
  input_currency: string
  input_type: Omit<AccountType, AccountType.SAVINGS>
  output_currency: string
  output_type: Omit<AccountType, AccountType.SAVINGS>
}

type SwapAmountMinClickedPayload = BasePayload & {
  input_currency: string
  input_type: Omit<AccountType, AccountType.SAVINGS>
  output_currency: string
  output_type: Omit<AccountType, AccountType.SAVINGS>
}

type SwapFromSelectedPayload = BasePayload & {
  input_currency: string
  input_type: Omit<AccountType, AccountType.SAVINGS>
}

type SwapReceiveSelectedPayload = BasePayload & {
  input_currency: string
  input_type: Omit<AccountType, AccountType.SAVINGS>
}

type SwapRequestedPayload = BasePayload & {
  exchange_rate: number
  input_amount: number
  input_currency: string
  input_type: string
  network_fee_input_amount: number
  network_fee_input_currency: string
  network_fee_output_amount: number
  network_fee_output_currency: string
  output_amount: number
  output_currency: string
  output_type: string
}

type TransferImportedAddressesClickedPayload = BasePayload

type UpgradeVerificationClickedOrigin =
  | 'DASHBOARD_PROMO'
  | 'ONBOARDING'
  | 'DEEP_LINK'
  | 'INTEREST'
  | 'RESUBMISSION'
  | 'SETTINGS'
  | 'SIMPLEBUY'
  | 'SWAP'
  | 'UNKNOWN'

type UpgradeVerificationClickedPayload = BasePayload & {
  currency: string
  origin: UpgradeVerificationClickedOrigin
  tier: number
}

type WithdrawalAmountEnteredPayload = BasePayload & {
  currency: string
  input_amount: number
  output_amount: number
  withdrawal_method: WithdrawalMethod
}

type WithdrawalAmountMaxClickedPayload = BasePayload & {
  currency: string
  withdrawal_method: WithdrawalMethod
}
type WithdrawalAmountMinClickedPayload = BasePayload & {
  currency: string
  withdrawal_method: WithdrawalMethod
}

type WithdrawalClickedOrigin = 'CURRENCY_PAGE'

type WithdrawalClickedPayload = BasePayload & {
  origin: WithdrawalClickedOrigin
}

type WithdrawalMethodSelectedPayload = BasePayload & {
  currency: string
  withdrawal_method: WithdrawalMethod
}

type WithdrawalViewedPayload = BasePayload & PageViewPayload

type WrongChangeCachePayload = BasePayload

type WrongReceiveCachePayload = BasePayload

type PeekSheetPayload = BasePayload & {
  current_step_completed: string
}

type AnalyticsProperties =
  | AddressVerifyMessageClickedPayload
  | AddMobileNumberClickedPayload
  | AmountSwitchedPayload
  | BuyAmountEnteredPayload
  | BuyAmountMaxClickedPayload
  | BuyAmountMinClickedPayload
  | BuyPaymentMethodSelectedPayload
  | BuySellClickedPayload
  | BuySellViewedPayload
  | ChangeMobileNumberClickedPayload
  | CryptoLinkHandlingClickedPayload
  | DashboardClickedPayload
  | DashboardViewedPayload
  | DepositAmountEnteredPayload
  | DepositClickedPayload
  | DepositMethodSelectedPayload
  | DepositViewedPayload
  | EmailVerificationRequestedPayload
  | EmailVerificationSkippedPayload
  | ImportAddressClickedPayload
  | InterestClickedPayload
  | InterestDepositAmountEnteredPayload
  | InterestDepositClickedPayload
  | InterestDepositMaxAmountClickedPayload
  | InterestDepositMinAmountClickedPayload
  | InterestDepositViewedPayload
  | InterestSubmitInformationClickedPayload
  | InterestViewedPayload
  | InterestWithdrawalClickedPayload
  | InterestWithdrawalViewedPayload
  | LinkBankClickedPayload
  | LoginHelpClickedPayload
  | LoginIdentifierEnteredPayload
  | LoginIdentifierFailedPayload
  | LoginMethodSelectedPayload
  | LoginRequestPayload
  | LoginRequestApprovedOrFailedPayload
  | LoginViewed
  | ManageTabSelectionClickedPayload
  | NotificationPreferencesUpdatedPayload
  | PrivateKeysShownPayload
  | PeekSheetPayload
  | ReceiveCurrencySelectedPayload
  | ReceiveDetailsCopiedPayload
  | RecoveryOptionSelectedPayload
  | ResetAccountPayload
  | RecurringBuyViewedPayload
  | RecurringBuyLearnMoreClickPayload
  | RecurringBuySuggestionSkippedPayload
  | RecurringBuyInfoViewedPayload
  | RecurringBuyCancelPayload
  | RecurringBuyClickedPayload
  | RecurringBuyDetailsClickedPayload
  | RecurringBuyPeriodSelectionPayload
  | SellAmountEnteredPayload
  | SellAmountMaxClickedPayload
  | SellAmountMinClickedPayload
  | SellFromSelectedPayload
  | SendAmountEnteredPayload
  | SendAmountMaxClickedPayload
  | SendFeeRateSelectedPayload
  | SendFromSelectedPayload
  | SendReceiveClickedPayload
  | SendReceiveViewedPayload
  | SendSubmittedPayload
  | SettingsCurrencyClickedPayload
  | SettingsHyperlinkClickedPayload
  | SettingsTabClickedPayload
  | SignedInPayload
  | SignedOutPayload
  | SignedUpPayload
  | SignUpCountrySelectPayload
  | SignUpCountryStateSelectPayload
  | SwapClickedPayload
  | SwapViewedPayload
  | SwapAccountsSelectedPayload
  | SwapAmountEnteredPayload
  | SwapAmountMaxClickedPayload
  | SwapAmountMinClickedPayload
  | SwapFromSelectedPayload
  | SwapReceiveSelectedPayload
  | SwapRequestedPayload
  | TransferImportedAddressesClickedPayload
  | UpgradeVerificationClickedPayload
  | WithdrawalAmountEnteredPayload
  | WithdrawalAmountMaxClickedPayload
  | WithdrawalAmountMinClickedPayload
  | WithdrawalClickedPayload
  | WithdrawalViewedPayload
  | WithdrawalMethodSelectedPayload
  | WrongChangeCachePayload
  | WrongReceiveCachePayload

type AnalyticsValue = {
  properties: AnalyticsProperties
  traits: AnalyticsTraits
}

export type {
  AnalyticsProperties,
  AnalyticsTraits,
  AnalyticsValue,
  BuySellClickedOrigin,
  DashboardClickedOrigin,
  DepositClickedOrigin,
  EmailVerificationRequestedOrigin,
  InterestDepositClickedOrigin,
  InterestSubmitInformationClickedOrigin,
  InterestWithdrawalClickedOrigin,
  LinkBankClickedOrigin,
  ManageTabSelectionClickedSelection,
  PageName,
  RawEvent,
  SendReceiveClickedOrigin,
  SettingsHyperlinkClickedDestination,
  SettingsTabClickedDestination,
  SwapClickedOrigin,
  UpgradeVerificationClickedOrigin,
  WithdrawalClickedOrigin
}

export interface TrackEventAction {
  key: AnalyticsKey
  properties: AnalyticsProperties
}

export {
  AccountType,
  AnalyticsKey,
  Coin,
  DepositMethod,
  FeeRate,
  Order,
  PaymentType,
  SendReceive,
  WithdrawalMethod
}

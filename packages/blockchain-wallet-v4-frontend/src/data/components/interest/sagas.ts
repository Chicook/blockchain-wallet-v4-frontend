import BigNumber from 'bignumber.js'
import { getUnixTime } from 'date-fns'
import { concat, isEmpty, isNil, last, prop } from 'ramda'
import { FormAction, initialize } from 'redux-form'
import { all, call, delay, put, select, take } from 'redux-saga/effects'

import { Exchange, Remote } from '@core'
import { APIType } from '@core/network/api'
import {
  AccountTypes,
  BSBalancesType,
  CoinType,
  EarnAccountBalanceType,
  EarnAccountType,
  EarnAfterTransactionType,
  EarnBondingDepositsResponseType,
  EarnBondingDepositsType,
  EarnTransactionResponseType,
  PaymentValue,
  Product,
  RatesType,
  RemoteDataType,
  TransactionType
} from '@core/types'
import { errorHandler, errorHandlerCode } from '@core/utils'
import { actions, selectors } from 'data'
import coinSagas from 'data/coins/sagas'
import { generateProvisionalPaymentAmount } from 'data/coins/utils'
import { CustodialSanctionsErrorCodeEnum, ModalName } from 'data/types'

import profileSagas from '../../modules/profile/sagas'
import { convertStandardToBase } from '../exchange/services'
import utils from './sagas.utils'
import * as S from './selectors'
import { actions as A } from './slice'
import {
  EarnInstrumentsType,
  EarnTransactionType,
  InterestWithdrawalFormType,
  PendingTransactionType,
  RewardsDepositFormType,
  StakingDepositFormType
} from './types'

const REWARDS_DEPOSIT_FORM = 'rewardsDepositForm'
const STAKING_DEPOSIT_FORM = 'stakingDepositForm'
const WITHDRAWAL_FORM = 'interestWithdrawalForm'
export const logLocation = 'components/interest/sagas'

export default ({ api, coreSagas, networks }: { api: APIType; coreSagas: any; networks: any }) => {
  const { isTier2 } = profileSagas({ api, coreSagas, networks })
  const {
    buildAndPublishPayment,
    createPayment,
    createRewardsLimits,
    createStakingLimits,
    getCustodialAccountForCoin
  } = utils({
    coreSagas,
    networks
  })

  const {
    getDefaultAccountForCoin,
    getNextReceiveAddressForCoin,
    getOrUpdateProvisionalPaymentForCoin
  } = coinSagas({
    api,
    coreSagas,
    networks
  })

  const getAccountIndexOrAccount = (coin: CoinType, account: AccountTypes) => {
    if (coin === 'BTC' || coin === 'BCH') {
      return account.index
    }
    return account.address
  }

  const fetchRewardsBalance = function* () {
    try {
      yield put(A.fetchRewardsBalanceLoading())
      if (!(yield call(isTier2))) return yield put(A.fetchRewardsBalanceSuccess({}))
      const response: ReturnType<typeof api.getEarnAccountBalance> = yield call(
        api.getEarnAccountBalance,
        { product: 'savings' } as EarnAccountBalanceType
      )
      yield put(A.fetchRewardsBalanceSuccess(response || {}))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchRewardsBalanceFailure(error))
    }
  }

  const fetchStakingBalance = function* () {
    try {
      yield put(A.fetchStakingBalanceLoading())
      if (!(yield call(isTier2))) return yield put(A.fetchStakingBalanceSuccess({}))
      const response: ReturnType<typeof api.getEarnAccountBalance> = yield call(
        api.getEarnAccountBalance,
        { product: 'staking' } as EarnAccountBalanceType
      )
      yield put(A.fetchStakingBalanceSuccess(response || {}))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchStakingBalanceFailure(error))
    }
  }

  const fetchInterestEligible = function* () {
    try {
      yield put(A.fetchInterestEligibleLoading())
      const response: ReturnType<typeof api.getInterestEligible> = yield call(
        api.getInterestEligible
      )
      yield put(A.fetchInterestEligibleSuccess(response))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchInterestEligibleFailure(error))
    }
  }

  const fetchStakingEligible = function* () {
    try {
      yield put(A.fetchStakingEligibleLoading())
      const response: ReturnType<typeof api.getStakingEligible> = yield call(api.getStakingEligible)
      yield put(A.fetchStakingEligibleSuccess(response))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchStakingEligibleFailure(error))
    }
  }

  const fetchEarnInstruments = function* () {
    try {
      yield put(A.fetchEarnInstrumentsLoading())

      const [stakingRates, rewardsRates] = yield all([
        call(api.getStakingRates),
        call(api.getRewardsRates)
      ])

      yield put(A.fetchStakingRatesSuccess(stakingRates))
      yield put(A.fetchInterestRatesSuccess(rewardsRates))

      const stakingCoins: Array<string> = Object.keys(stakingRates.rates)
      const rewardsCoins: Array<string> = Object.keys(rewardsRates.rates)

      const stakingInstruments: EarnInstrumentsType = stakingCoins.map((coin) => ({
        coin,
        product: 'Staking'
      }))
      const rewardsInstruments: EarnInstrumentsType = rewardsCoins.map((coin) => ({
        coin,
        product: 'Rewards'
      }))

      yield put(
        A.fetchEarnInstrumentsSuccess({
          earnInstruments: stakingInstruments.concat(rewardsInstruments)
        })
      )
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchEarnInstrumentsFailure(error))
    }
  }

  const fetchInterestLimits = function* ({ payload }: ReturnType<typeof A.fetchInterestLimits>) {
    const { coin, currency } = payload
    try {
      yield put(A.fetchInterestLimitsLoading())
      const response: ReturnType<typeof api.getInterestLimits> = yield call(
        api.getInterestLimits,
        coin,
        currency
      )
      yield put(A.fetchInterestLimitsSuccess(response.limits))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchInterestLimitsFailure(error))
    }
  }

  const fetchStakingLimits = function* () {
    try {
      yield put(A.fetchStakingLimitsLoading())
      const response: ReturnType<typeof api.getStakingLimits> = yield call(api.getStakingLimits)
      yield put(A.fetchStakingLimitsSuccess(response.limits))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchStakingLimitsFailure(error))
    }
  }

  const fetchRewardsAccount = function* ({ payload }: ReturnType<typeof A.fetchRewardsAccount>) {
    const { coin } = payload
    try {
      yield put(A.fetchRewardsAccountLoading())
      const paymentAccount: ReturnType<typeof api.getEarnAccount> = yield call(api.getEarnAccount, {
        coin,
        product: 'savings'
      } as EarnAccountType)
      yield put(A.fetchRewardsAccountSuccess({ ...paymentAccount }))
      yield put(A.setUnderSanctions({ message: null }))
    } catch (e) {
      const error = errorHandler(e)
      const errorCode: number | string = errorHandlerCode(e)
      if (errorCode === CustodialSanctionsErrorCodeEnum.EU_5_SANCTION_ERROR) {
        yield put(A.setUnderSanctions({ message: e?.ux?.message }))
      }
      yield put(A.fetchRewardsAccountFailure(error))
    }
  }

  const fetchStakingAccount = function* ({ payload }: ReturnType<typeof A.fetchStakingAccount>) {
    const { coin } = payload
    try {
      yield put(A.fetchStakingAccountLoading())
      const paymentAccount: ReturnType<typeof api.getEarnAccount> = yield call(api.getEarnAccount, {
        coin,
        product: 'staking'
      } as EarnAccountType)
      yield put(A.fetchStakingAccountSuccess({ ...paymentAccount }))
      yield put(A.setUnderSanctions({ message: null }))
    } catch (e) {
      const error = errorHandler(e)
      const errorCode: number | string = errorHandlerCode(e)
      if (errorCode === CustodialSanctionsErrorCodeEnum.EU_5_SANCTION_ERROR) {
        yield put(A.setUnderSanctions({ message: e?.ux?.message }))
      }
      yield put(A.fetchStakingAccountFailure(error))
    }
  }

  const fetchInterestRates = function* () {
    try {
      yield put(A.fetchInterestRatesLoading())
      const response: ReturnType<typeof api.getRewardsRates> = yield call(api.getRewardsRates)
      yield put(A.fetchInterestRatesSuccess(response))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchInterestRatesFailure(error))
    }
  }
  const fetchStakingRates = function* () {
    try {
      yield put(A.fetchStakingRatesLoading())
      const response: ReturnType<typeof api.getStakingRates> = yield call(api.getStakingRates)
      yield put(A.fetchStakingRatesSuccess(response))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchStakingRatesFailure(error))
    }
  }

  const fetchEarnTransactionsReport = function* () {
    const reportHeaders = [['Date', 'Type', 'Asset', 'Amount', 'Tx Hash', 'Product']]
    const formatRewardsTxData = (d) => [
      d.insertedAt,
      d.type,
      d.amount?.symbol,
      d.amount?.value,
      d.txHash,
      'Rewards'
    ]
    const formatStakingTxData = (d) => [
      d.insertedAt,
      d.type,
      d.amount?.symbol,
      d.amount?.value,
      d.txHash,
      'Staking'
    ]
    let txList = []
    let hasRewardsNext = true
    let nextRewardsPageUrl
    let hasStakingNext = true
    let nextStakingPageUrl
    const { coin } = yield select(selectors.form.getFormValues('interestHistoryCoin'))
    yield put(A.fetchEarnTransactionsReportLoading())
    try {
      while (hasRewardsNext) {
        const { items, next } = yield call(api.getEarnTransactions, {
          currency: coin === 'ALL' ? undefined : coin,
          nextPageUrl: nextRewardsPageUrl,
          product: 'SAVINGS'
        })
        txList = concat(txList, items.map(formatRewardsTxData))
        hasRewardsNext = next
        nextRewardsPageUrl = next
      }
      while (hasStakingNext) {
        const { items, next } = yield call(api.getEarnTransactions, {
          currency: coin === 'ALL' ? undefined : coin,
          nextPageUrl: nextStakingPageUrl,
          product: 'STAKING'
        })
        txList = concat(txList, items.map(formatStakingTxData))
        hasStakingNext = next
        nextStakingPageUrl = next
      }
      // sort txList by descending date
      txList.sort((a, b) => {
        const dateA = a[0]
        const dateB = b[0]
        if (!dateA || !dateB) return 0

        return getUnixTime(new Date(dateB)) - getUnixTime(new Date(dateA))
      })

      // TODO figure out any replacement type
      const report = concat(reportHeaders, txList) as any
      yield put(A.fetchEarnTransactionsReportSuccess(report))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchEarnTransactionsReportFailure(error))
    }
  }

  const fetchEarnTransactions = function* ({
    payload
  }: ReturnType<typeof A.fetchEarnTransactions>) {
    const { coin, reset } = payload

    try {
      const isStakingEnabled = selectors.core.walletOptions
        .getIsStakingEnabled(yield select())
        .getOrElse(false) as boolean
      const rewardsNextPageUrl = !reset ? yield select(S.getRewardsTransactionsNextPage) : undefined
      const stakingNextPageUrl = !reset ? yield select(S.getStakingTransactionsNextPage) : undefined

      // check if invoked from continuous scroll
      if (!reset) {
        const txList = yield select(S.getEarnTransactions)
        // return if next page is already being fetched or there is no next page
        if (Remote.Loading.is(last(txList)) || (!rewardsNextPageUrl && !stakingNextPageUrl)) return
      }
      yield put(A.fetchEarnTransactionsLoading({ reset }))
      let rewardsResponse: EarnTransactionResponseType = { items: [], next: null }
      let stakingResponse: EarnTransactionResponseType = { items: [], next: null }

      if (rewardsNextPageUrl !== '') {
        rewardsResponse = yield call(api.getEarnTransactions, {
          currency: coin,
          nextPageUrl: rewardsNextPageUrl,
          product: 'SAVINGS'
        })
      }

      if (stakingNextPageUrl !== '' && isStakingEnabled) {
        stakingResponse = yield call(api.getEarnTransactions, {
          currency: coin,
          nextPageUrl: stakingNextPageUrl,
          product: 'STAKING'
        })
      }

      const mapProductToItems = (items, product) => {
        return items.map((item) => ({ ...item, product }))
      }

      const transactions: Array<EarnTransactionType> = [
        ...mapProductToItems(rewardsResponse.items, 'Rewards'),
        ...mapProductToItems(stakingResponse.items, 'Staking')
      ]

      if (rewardsResponse.items.length > 0 && stakingResponse.items.length > 0) {
        transactions.sort((a, b) => {
          if (!a.insertedAt || !b.insertedAt) return 0

          return getUnixTime(new Date(b.insertedAt)) - getUnixTime(new Date(a.insertedAt))
        })
      }
      yield put(A.fetchEarnTransactionsSuccess({ reset, transactions }))
      yield put(A.setRewardsTransactionsNextPage({ nextPage: rewardsResponse.next || '' }))
      yield put(A.setStakingTransactionsNextPage({ nextPage: stakingResponse.next || '' }))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchEarnTransactionsFailure(error))
    }
  }

  const fetchPendingStakingTransactions = function* ({
    payload
  }: ReturnType<typeof A.fetchEarnTransactions>) {
    const { coin } = payload

    try {
      yield put(A.fetchPendingStakingTransactionsLoading())
      const transactionResponse: EarnTransactionResponseType = yield call(api.getEarnTransactions, {
        currency: coin,
        product: 'STAKING'
      })
      // can successfully return ''
      const earnBondingResponse: EarnBondingDepositsResponseType = yield call(
        api.getEarnBondingDeposits,
        {
          ccy: coin,
          product: 'STAKING'
        }
      )

      const bondingDeposits: EarnBondingDepositsType[] = earnBondingResponse?.bondingDeposits || []

      const filteredTransactions: TransactionType[] =
        transactionResponse?.items.filter(({ state }) => state.includes('PENDING')) || []

      const pendingTransactions: PendingTransactionType[] = []

      filteredTransactions.forEach(({ amount, insertedAt }) => {
        pendingTransactions.push({ amount: amount.value, date: insertedAt, type: 'TRANSACTIONS' })
      })

      bondingDeposits.forEach(({ amount, bondingDays, bondingStartDate }) => {
        pendingTransactions.push({ amount, bondingDays, date: bondingStartDate, type: 'BONDING' })
      })

      if (pendingTransactions.length > 0) {
        pendingTransactions.sort((a, b) => {
          if (!a.date || !b.date) return 0

          return getUnixTime(new Date(b.date)) - getUnixTime(new Date(a.date))
        })
      }
      yield put(A.fetchPendingStakingTransactionsSuccess(pendingTransactions))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchPendingStakingTransactionsFailure(error))
    }
  }

  const formChanged = function* (action: FormAction) {
    const { form } = action.meta
    const isStaking = form === STAKING_DEPOSIT_FORM
    if (!(form === REWARDS_DEPOSIT_FORM || isStaking)) return

    try {
      const formValues: RewardsDepositFormType | StakingDepositFormType = yield select(
        selectors.form.getFormValues(form)
      )
      const coin = S.getCoinType(yield select())
      const rates = S.getRates(yield select()).getOrElse({} as RatesType)
      const rate = rates.price
      const isNonCustodialAccountSelected =
        prop('type', formValues.earnDepositAccount) === 'ACCOUNT'

      switch (action.meta.field) {
        case 'depositAmount':
          if (!isNonCustodialAccountSelected) {
            return yield put(A.setPaymentSuccess({ payment: undefined }))
          }
          const isAmountDisplayedInCrypto = S.getIsAmountDisplayedInCrypto(yield select())
          const value = isAmountDisplayedInCrypto
            ? new BigNumber(action.payload).toNumber()
            : new BigNumber(action.payload).dividedBy(rate).toNumber()

          const paymentR = S.getPayment(yield select())
          if (paymentR) {
            let payment = yield getOrUpdateProvisionalPaymentForCoin(coin, paymentR)
            const paymentAmount = generateProvisionalPaymentAmount(coin, value)
            payment = yield payment.amount(paymentAmount || 0)
            if (formValues.earnDepositAccount.balance > 0) {
              payment = yield payment.build()
              yield put(A.setPaymentSuccess({ payment: payment.value() }))
            } else {
              yield put(A.setPaymentSuccess({ payment: payment.value() }))
            }
          }
          break
        case 'earnDepositAccount':
          // focus amount to ensure deposit amount validation will be triggered
          yield put(actions.form.focus(form, 'depositAmount'))
          const createLimits = isStaking ? createStakingLimits : createRewardsLimits
          // custodial account selected
          if (!isNonCustodialAccountSelected) {
            const custodialBalances: BSBalancesType = (yield select(
              selectors.components.buySell.getBSBalances
            )).getOrFail('Failed to get balance')

            yield call(createLimits, undefined, custodialBalances)
            yield put(A.setPaymentSuccess({ payment: undefined }))
          } else {
            // noncustodial account selected
            const depositPayment: PaymentValue = yield call(createPayment, {
              ...formValues.earnDepositAccount,
              address: getAccountIndexOrAccount(coin, formValues.earnDepositAccount)
            })
            yield call(createLimits, depositPayment)
            yield put(A.setPaymentSuccess({ payment: depositPayment }))
          }
          break
        default:
        // do nothing
      }
    } catch (e) {
      yield put(A.setPaymentFailure(e))
    }
  }

  const handleTransferMaxAmountClick = function* ({
    payload: { amount, formName }
  }: ReturnType<typeof A.handleTransferMaxAmountClick>) {
    yield put(actions.form.change(formName, 'depositAmount', amount))
  }

  const handleTransferMinAmountClick = function* ({
    payload: { amount, formName }
  }: ReturnType<typeof A.handleTransferMinAmountClick>) {
    yield put(actions.form.change(formName, 'depositAmount', amount))
  }

  const initializeCustodialAccountForm = function* (coin, createLimits) {
    // re-fetch the custodial balances to ensure we have the latest for proper form initialization
    yield put(actions.components.buySell.fetchBalance({ skipLoading: true }))
    // wait until balances are loaded we must have deep equal objects to initialize form correctly
    yield take([
      actions.components.buySell.fetchBalanceSuccess.type,
      actions.components.buySell.fetchBalanceFailure.type
    ])
    const custodialBalances = (yield select(selectors.components.buySell.getBSBalances)).getOrFail(
      'Failed to get balances'
    )
    const custodialAccount = (yield call(getCustodialAccountForCoin, coin)).getOrFail(
      'Failed to fetch account'
    )
    yield call(createLimits, undefined, custodialBalances)
    yield put(A.setPaymentSuccess({ payment: undefined }))

    return custodialAccount
  }

  const initializeNonCustodialAccountForm = function* (coin, createLimits, isStaking) {
    // fetch deposit address to build provisional payment
    const depositAddr = isStaking
      ? yield select(S.getStakingDepositAddress)
      : yield select(S.getRewardsDepositAddress)
    // abort if deposit address missing
    if (isEmpty(depositAddr) || isNil(depositAddr)) {
      throw new Error('Missing deposit address')
    }
    const depositAddress = depositAddr.split(':')[0]
    // fetch default account
    const noncustodialAccount = yield call(getDefaultAccountForCoin, coin)
    // create provisional payment
    const payment: PaymentValue = yield call(createPayment, {
      ...noncustodialAccount,
      address: getAccountIndexOrAccount(coin, noncustodialAccount)
    })
    let newPayment = yield getOrUpdateProvisionalPaymentForCoin(coin, Remote.of(payment))
    newPayment = yield newPayment.to(depositAddress, 'ADDRESS')
    newPayment = yield newPayment.value()
    yield call(createLimits, newPayment)
    yield put(A.setPaymentSuccess({ payment: newPayment }))

    return noncustodialAccount
  }
  const initializeInterestDepositForm = function* ({
    payload
  }: ReturnType<typeof A.initializeInterestDepositForm>) {
    const { coin, currency } = payload
    const { coinfig } = window.coins[coin]
    let initialAccount

    try {
      yield put(A.fetchRewardsAccount({ coin }))
      yield take([A.fetchRewardsAccountSuccess.type, A.fetchRewardsAccountFailure.type])
      yield put(A.setPaymentLoading())
      yield put(A.fetchInterestLimits({ coin, currency }))
      yield take([A.fetchInterestLimitsSuccess.type, A.fetchInterestLimitsFailure.type])

      // initialize the form depending upon account types for coin
      if (coinfig.products.includes('PrivateKey')) {
        initialAccount = yield call(
          initializeNonCustodialAccountForm,
          coin,
          createRewardsLimits,
          false
        )
      } else {
        initialAccount = yield call(initializeCustodialAccountForm, coin, createRewardsLimits)
      }

      // finally, initialize the form
      yield put(
        initialize(REWARDS_DEPOSIT_FORM, {
          coin,
          currency,
          earnDepositAccount: initialAccount
        })
      )
    } catch (e) {
      yield put(A.setPaymentFailure(e))
    }
  }

  const initializeStakingDepositForm = function* ({
    payload
  }: ReturnType<typeof A.initializeStakingDepositForm>) {
    const { coin, currency } = payload
    const { coinfig } = window.coins[coin]
    let initialAccount

    try {
      yield put(A.fetchStakingAccount({ coin }))
      yield take([A.fetchStakingAccountSuccess.type, A.fetchStakingAccountFailure.type])
      yield put(A.setPaymentLoading())
      yield put(A.fetchStakingLimits())
      yield take([A.fetchStakingLimitsSuccess.type, A.fetchStakingLimitsFailure.type])

      // initialize the form depending upon account types for coin
      if (coinfig.products.includes('PrivateKey')) {
        initialAccount = yield call(
          initializeNonCustodialAccountForm,
          coin,
          createStakingLimits,
          true
        )
      } else {
        initialAccount = yield call(initializeCustodialAccountForm, coin, createStakingLimits)
      }

      // finally, initialize the form
      yield put(
        initialize(STAKING_DEPOSIT_FORM, {
          coin,
          currency,
          earnDepositAccount: initialAccount
        })
      )
    } catch (e) {
      yield put(A.setPaymentFailure(e))
    }
  }

  const initializeWithdrawalForm = function* ({
    payload
  }: ReturnType<typeof A.initializeWithdrawalForm>) {
    const { coin, walletCurrency } = payload
    const { coinfig } = window.coins[coin]
    let defaultAccount
    try {
      yield put(A.setWithdrawalMinimumsLoading())
      const withdrawalMinimumsResponse: ReturnType<typeof api.getWithdrawalMinsAndFees> =
        yield call(api.getWithdrawalMinsAndFees)
      if (coinfig.products.includes('PrivateKey')) {
        defaultAccount = yield call(getDefaultAccountForCoin, coin)
      } else {
        defaultAccount = (yield call(getCustodialAccountForCoin, coin)).getOrFail(
          'Failed to fetch account'
        )
      }

      yield put(
        initialize(WITHDRAWAL_FORM, {
          coin,
          currency: walletCurrency,
          earnWithdrawalAccount: defaultAccount
        })
      )
      yield put(A.setWithdrawalMinimumsSuccess({ withdrawalMinimumsResponse }))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.setWithdrawalMinimumsFailure({ error }))
    }
  }

  const routeToTxHash = function* ({ payload }: ReturnType<typeof A.routeToTxHash>) {
    const { coin, txHash } = payload
    yield put(actions.router.push(`/coins/${coin}`))
    yield delay(1000)
    yield put(actions.form.change('walletTxSearch', 'search', txHash))
  }

  const sendDeposit = function* ({ payload }: ReturnType<typeof A.submitDepositForm>) {
    const { formName } = payload
    const isStaking = formName === STAKING_DEPOSIT_FORM

    try {
      yield put(actions.form.startSubmit(formName))
      const formValues: RewardsDepositFormType | StakingDepositFormType = yield select(
        selectors.form.getFormValues(formName)
      )
      const isCustodialDeposit = formValues.earnDepositAccount.type === 'CUSTODIAL'
      const coin = S.getCoinType(yield select())

      // custodial account deposit
      if (isCustodialDeposit) {
        const { depositAmount } = formValues
        const isAmountDisplayedInCrypto = S.getIsAmountDisplayedInCrypto(yield select())
        const rates = S.getRates(yield select()).getOrElse({} as RatesType)
        const rate = rates.price
        const baseCrypto = Exchange.convertCoinToCoin({
          baseToStandard: false,
          coin,
          value: isAmountDisplayedInCrypto
            ? new BigNumber(depositAmount).toNumber()
            : new BigNumber(depositAmount).dividedBy(rate).toNumber()
        })

        const amount = new BigNumber(baseCrypto).integerValue(BigNumber.ROUND_DOWN).toFixed()

        yield call(api.initiateCustodialTransfer, {
          amount,
          currency: coin,
          destination: isStaking ? 'STAKING' : 'SAVINGS',
          origin: 'SIMPLEBUY'
        })
      } else {
        // non-custodial account deposit
        // get payment
        const paymentR = S.getPayment(yield select())
        const payment = yield getOrUpdateProvisionalPaymentForCoin(
          coin,
          paymentR as RemoteDataType<string, any>
        )
        // fetch deposit address
        let depositAddress
        if (isStaking) {
          yield put(A.fetchStakingAccount({ coin }))
          yield take([A.fetchStakingAccountSuccess.type, A.fetchStakingAccountFailure.type])
          depositAddress = yield select(S.getStakingDepositAddress)
        } else {
          yield put(A.fetchRewardsAccount({ coin }))
          yield take([A.fetchRewardsAccountSuccess.type, A.fetchRewardsAccountFailure.type])
          depositAddress = yield select(S.getRewardsDepositAddress)
        }

        // abort if deposit address missing
        if (isEmpty(depositAddress) || isNil(depositAddress)) {
          throw new Error('Missing deposit address')
        }

        const hotWalletAddress = selectors.core.walletOptions
          .getHotWalletAddresses(yield select(), isStaking ? Product.STAKING : Product.REWARDS)
          .getOrElse(null)
        let transaction
        if (typeof hotWalletAddress !== 'string') {
          console.error('Unable to retreive hotwallet address; falling back to deposit and sweep.')
          transaction = yield call(buildAndPublishPayment, coin, payment, depositAddress)
        } else {
          // build and publish payment to network
          transaction = yield call(
            buildAndPublishPayment,
            coin,
            payment,
            depositAddress,
            hotWalletAddress
          )
        }

        // notify backend of incoming non-custodial deposit
        yield put(
          actions.components.send.notifyNonCustodialToCustodialTransfer(
            { ...transaction, fromType: 'ADDRESS' },
            isStaking ? 'STAKING' : 'SAVINGS'
          )
        )
      }

      // notify UI of success
      yield put(actions.form.stopSubmit(formName))

      if (isStaking) {
        yield put(A.setStakingStep({ name: 'DEPOSIT_SUCCESS' }))
      } else {
        yield put(A.setRewardsStep({ data: { depositSuccess: true }, name: 'ACCOUNT_SUMMARY' }))
      }

      const afterTransactionR = yield select(selectors.components.interest.getAfterTransaction)
      const afterTransaction = afterTransactionR.getOrElse({
        show: false
      } as EarnAfterTransactionType)
      if (afterTransaction?.show) {
        yield put(actions.components.interest.resetShowInterestCardAfterTransaction())
      }

      yield delay(3000)

      if (isStaking) {
        yield put(A.fetchStakingBalance())
      } else {
        yield put(A.fetchRewardsBalance())
      }

      yield put(A.fetchEDDStatus())
    } catch (e) {
      const error = errorHandler(e)
      if (isStaking) {
        yield put(actions.form.stopSubmit(STAKING_DEPOSIT_FORM, { _error: error }))
        yield put(
          A.setStakingStep({
            data: {
              depositSuccess: false,
              error
            },
            name: 'ACCOUNT_SUMMARY'
          })
        )
      } else {
        yield put(actions.form.stopSubmit(REWARDS_DEPOSIT_FORM, { _error: error }))
        yield put(
          A.setRewardsStep({
            data: {
              depositSuccess: false,
              error
            },
            name: 'ACCOUNT_SUMMARY'
          })
        )
      }
    }
  }

  const requestWithdrawal = function* ({ payload }: ReturnType<typeof A.requestWithdrawal>) {
    const { coin, withdrawalAmountCrypto, withdrawalAmountFiat } = payload
    try {
      yield put(actions.form.startSubmit(WITHDRAWAL_FORM))

      const formValues: InterestWithdrawalFormType = yield select(
        selectors.form.getFormValues(WITHDRAWAL_FORM)
      )
      const isCustodialWithdrawal = prop('type', formValues.earnWithdrawalAccount) === 'CUSTODIAL'
      const withdrawalAmountBase = convertStandardToBase(coin, withdrawalAmountCrypto)

      if (isCustodialWithdrawal) {
        yield call(api.initiateCustodialTransfer, {
          amount: withdrawalAmountBase,
          currency: coin,
          destination: 'SIMPLEBUY',
          origin: 'SAVINGS'
        })
      } else {
        const receiveAddress = yield call(getNextReceiveAddressForCoin, coin)
        yield call(api.initiateInterestWithdrawal, withdrawalAmountBase, coin, receiveAddress)
      }

      // notify success
      yield put(actions.form.stopSubmit(WITHDRAWAL_FORM))
      yield put(
        A.setRewardsStep({
          data: {
            withdrawSuccess: true,
            withdrawalAmount: withdrawalAmountFiat
          },
          name: 'ACCOUNT_SUMMARY'
        })
      )
      yield delay(3000)
      yield put(A.fetchRewardsBalance())
      yield put(A.fetchEDDStatus())
    } catch (e) {
      const error = errorHandler(e)
      yield put(actions.form.stopSubmit(WITHDRAWAL_FORM, { _error: error }))
      yield put(
        A.setRewardsStep({ data: { error, withdrawSuccess: false }, name: 'ACCOUNT_SUMMARY' })
      )
    }
  }

  const showInterestModal = function* ({ payload }: ReturnType<typeof A.showInterestModal>) {
    const { coin, step } = payload
    yield put(A.setRewardsStep({ name: step }))
    yield put(
      actions.modals.showModal(ModalName.INTEREST_MODAL, {
        coin,
        origin: 'EarnPage'
      })
    )
  }

  const showStakingModal = function* ({ payload }: ReturnType<typeof A.showStakingModal>) {
    const { coin, step } = payload
    yield put(A.setStakingModal({ name: step }))
    yield put(
      actions.modals.showModal(ModalName.STAKING_MODAL, {
        coin,
        origin: 'EarnPage'
      })
    )
  }

  const fetchShowInterestCardAfterTransaction = function* ({
    payload
  }: ReturnType<typeof A.fetchShowInterestCardAfterTransaction>) {
    try {
      yield put(A.fetchShowInterestCardAfterTransactionLoading())
      const afterTransaction: EarnAfterTransactionType = yield call(
        api.getInterestCtaAfterTransaction,
        payload.currency
      )
      yield put(A.fetchShowInterestCardAfterTransactionSuccess({ afterTransaction }))
    } catch (e) {
      // TODO: Make this error not break the order summary page. This is failing with the new card providers
      // const error = errorHandler(e)
      // yield put(A.fetchShowInterestCardAfterTransactionFailure({ error }))
      yield put(
        A.fetchShowInterestCardAfterTransactionSuccess({
          // @ts-ignore
          afterTransaction: {
            show: false
          }
        })
      )
    }
  }

  const stopShowingInterestModal = function* () {
    try {
      yield call(api.stopInterestCtaAfterTransaction, false)
    } catch (e) {
      yield put(actions.logs.logErrorMessage(logLocation, 'INTEREST_PROMO_MODAL', e))
    }
    yield put(actions.modals.closeModal(ModalName.INTEREST_PROMO_MODAL))
  }

  const fetchEDDStatus = function* () {
    try {
      yield put(A.fetchEDDStatusLoading())
      const eddStatus: ReturnType<typeof api.getSavingsEDDStatus> = yield call(
        api.getSavingsEDDStatus
      )
      yield put(A.fetchEDDStatusSuccess({ eddStatus }))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchEDDStatusFailure({ error }))
    }
  }
  const fetchEDDWithdrawLimits = function* ({
    payload
  }: ReturnType<typeof A.fetchEDDWithdrawLimits>) {
    try {
      yield put(A.fetchEDDWithdrawLimitsLoading())
      const earnEDDWithdrawLimits: ReturnType<typeof api.getSavingsEDDWithdrawLimits> = yield call(
        api.getSavingsEDDWithdrawLimits,
        payload.currency
      )
      yield put(A.fetchEDDWithdrawLimitsSuccess({ earnEDDWithdrawLimits }))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchEDDWithdrawLimitsFailure({ error }))
    }
  }
  const fetchEDDDepositLimits = function* ({
    payload
  }: ReturnType<typeof A.fetchEDDDepositLimits>) {
    try {
      yield put(A.fetchEDDDepositLimitsLoading())
      const rewardsEDDDepositLimits: ReturnType<typeof api.getSavingsEDDDepositLimits> = yield call(
        api.getSavingsEDDDepositLimits,
        payload.currency
      )
      yield put(A.fetchEDDDepositLimitsSuccess({ rewardsEDDDepositLimits }))
    } catch (e) {
      const error = errorHandler(e)
      yield put(A.fetchEDDWithdrawLimitsFailure({ error }))
    }
  }

  return {
    fetchEDDDepositLimits,
    fetchEDDStatus,
    fetchEDDWithdrawLimits,
    fetchEarnInstruments,
    fetchEarnTransactions,
    fetchEarnTransactionsReport,
    fetchInterestEligible,
    fetchInterestLimits,
    fetchInterestRates,
    fetchPendingStakingTransactions,
    fetchRewardsAccount,
    fetchRewardsBalance,
    fetchShowInterestCardAfterTransaction,
    fetchStakingAccount,
    fetchStakingBalance,
    fetchStakingEligible,
    fetchStakingLimits,
    fetchStakingRates,
    formChanged,
    handleTransferMaxAmountClick,
    handleTransferMinAmountClick,
    initializeInterestDepositForm,
    initializeStakingDepositForm,
    initializeWithdrawalForm,
    requestWithdrawal,
    routeToTxHash,
    sendDeposit,
    showInterestModal,
    showStakingModal,
    stopShowingInterestModal
  }
}

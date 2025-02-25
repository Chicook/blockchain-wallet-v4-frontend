import { PaletteColors, SemanticColors } from '@blockchain-com/constellation'
import styled from 'styled-components'

import { Button, Text } from 'blockchain-info-components'
import { FlyoutWrapper } from 'components/Flyout'

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
export const Top = styled(FlyoutWrapper)`
  padding-bottom: 0;
`
export const TopText = styled(Text)`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 38px;
`
export const Row = styled.div`
  display: flex;
`
export const Container = styled(Row)`
  flex-direction: column;
  min-height: 48px;
  justify-content: space-between;

  &:first-child {
    border-right: 1px solid ${PaletteColors['grey-000']};
    width: 199px;
  }

  &:last-child {
    margin-left: 32px;
  }
`
export const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 48px;
`
export const Bottom = styled(FlyoutWrapper)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  gap: 16px;
`
export const StatusWrapper = styled.div`
  display: flex;
  padding: 4px;
  margin-top: 20px;
  align-items: center;
`

export const StatusSupplyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  margin-top: 32px;
  border-radius: 8px;
  &.new {
    border: 1px solid ${PaletteColors['grey-100']};
  }
  &.old {
    background-color: ${PaletteColors['grey-000']};
  }
`
export const StatusIconWrapper = styled.div<{ color: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  background: ${(props) => props.theme[props.color]};
  border-radius: 20px;
  min-height: 38px;
  min-width: 38px;
  max-height: 38px;
`
export const WarningContainer = styled.div`
  background-color: ${PaletteColors['grey-000']};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: -2px;
  margin-top: 28px;
`
export const DetailsContainer = styled.div<{ $hasHandleClick: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  padding: 24px 24px 24px 0;
  border-bottom: 1px solid ${PaletteColors['grey-000']};

  & div:last-child {
    text-align: right;
  }

  ${({ $hasHandleClick }) => $hasHandleClick && `&:hover { cursor: pointer}`}
`
export const SubmitButton = styled(Button)`
  border-color: ${SemanticColors.medium};

  &:hover {
    background-color: ${PaletteColors['blue-000']};
    border-color: ${SemanticColors.primary};
  }
`

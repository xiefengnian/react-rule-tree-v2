import type { BaseDesignToken } from './TokenProvider';
import { cssEmotion } from './useStyle';

const techRuleTree = 'rule-tree';
export const { css, cx, keyframes } = cssEmotion(techRuleTree);
export const getRuleTreeToken = (token: BaseDesignToken) => css`
  position: relative;
  .relation-container {
    display: flex;
    gap: ${token.GapJustify}px;
  }
  .relation-node {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .relation-children {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${token.GapAlign}px;
    justify-content: center;
    .relation-line {
      position: absolute;
      left: -28px;
      border-left: solid 1px ${token.ColorBorder};
    }
  }
  .field {
    position: relative;
    display: flex;
    align-items: center;
    &::before {
      position: absolute;
      left: -${token.GapJustifyMid}px;
      width: ${token.GapJustifyMid}px;
      border-top: solid ${token.ColorBorder} 1px;
      content: '';
    }
  }
  .relation {
    position: relative;
    display: flex;
    align-items: center;
    &:not(.root-relation) {
      &::before {
        position: absolute;
        left: -${token.GapJustifyMid}px;
        width: ${token.GapJustifyMid}px;
        border-top: solid ${token.ColorBorder} 1px;
        content: '';
      }
    }

    &::after {
      position: absolute;
      right: -${token.GapJustifyMid}px;
      width: ${token.GapJustifyMid}px;
      border-top: solid ${token.ColorBorder} 1px;
      content: '';
    }
  }
  .button {
    position: relative;
    display: flex;
    gap: 2px;
    align-items: center;
    .button-add {
      padding: 4px 8px;
      color: rgba(0, 0, 0, 0.65);
      white-space: nowrap;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
      cursor: pointer;
      &.disabled {
        cursor: not-allowed;
      }
    }
    &::after {
      position: absolute;
      left: -${token.GapJustifyMid}px;
      width: ${token.GapJustifyMid}px;
      border-top: solid ${token.ColorBorder} 1px;
      content: '';
    }
  }
  .drop-inner {
    width: 100%;
    height: 10px;
  }
  .drag-container-field {
    padding: 4px 8px;
    background-color: ${token.BgcField};
    border-radius: 3px;
  }
  .drag-container-relation {
    box-sizing: border-box;
    padding: 0 3px; // 减去 border
    border: solid ${token.ColorBorder} 1px;
    border-radius: 3px;
  }
  .drag-container {
    display: flex;
    align-items: center;
  }
  .drop-placement {
    position: relative;
    width: 56px;
    border: dashed 1px ${token.ColorBorderDropPlacement};
    border-radius: 3px;
  }
  #svg-drag {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    opacity: 1;
    pointer-events: none;
  }
`;

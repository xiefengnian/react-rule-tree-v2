import React from 'react';
export type BaseDesignToken = {
  GapJustify: number;
  GapJustifyMid: number;
  GapAlign: number;
  BgcField: string;
  ColorBorder: string;
  ColorBorderDropPlacement: string;
};
export const baseDesignTokens: BaseDesignToken = {
  GapJustify: 56,
  GapJustifyMid: 28,
  GapAlign: 4,
  BgcField: 'rgba(0, 0, 0, 0.05)',
  ColorBorder: '#e6e6e6',
  ColorBorderDropPlacement: '#1890ff',
};
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const getDesignToken: (baseDesignTokens: DeepPartial<BaseDesignToken>) => BaseDesignToken = (
  designTokens,
) => {
  const finalDesignTokens = { ...baseDesignTokens, ...designTokens };
  return {
    ...designTokens,
    ...finalDesignTokens,
  } as BaseDesignToken;
};
const defaultToken = getDesignToken(baseDesignTokens);
export const RuleTreeContext = React.createContext<BaseDesignToken>(defaultToken);
export type TokenProviderProps = {
  token?: DeepPartial<BaseDesignToken>;
  children?: React.ReactNode;
};

export const RuleTreeProvider: React.FC<TokenProviderProps> = (props) => {
  return (
    <RuleTreeContext.Provider
      value={{
        ...getDesignToken(props?.token || {}),
      }}
    >
      {props.children}
    </RuleTreeContext.Provider>
  );
};

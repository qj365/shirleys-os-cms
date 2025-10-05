export type TCustomerTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TTokenExpires = {
  expireInSeconds: number;
  refreshTokenExpireIn: number;
};

export type TUserInfo = {
  id: number;
  displayName: string;
  userName: string;
};

export type TUserSignInPayload = {
  username: string;
  password: string;
};

export type TUserSignInSuccessResponse = {
  accessToken: string;
  refreshToken: string;
  agentUser: TUserInfo;
} & TTokenExpires;

export type TAuthSliceState = {
  user: TUserInfo | null;
  accessToken?: string;
  refreshToken?: string;
};

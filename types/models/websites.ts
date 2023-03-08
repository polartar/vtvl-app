export interface IWebsiteStyles {
  loginBgImage?: string;
  logoImage?: string;
  theme?: any;
}

export interface IWebsite {
  domain: string;
  organizationId: string;
  styles: IWebsiteStyles;
}

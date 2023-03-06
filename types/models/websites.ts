export interface IWebsiteStyles {
  loginBgImage?: string;
  logoImage?: string;
}

export interface IWebsite {
  domain: string;
  organizationId: string;
  styles: IWebsiteStyles;
}

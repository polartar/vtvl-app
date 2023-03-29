// A single asset file that contains basic properties.
// Will be used to all upcoming brand white-labelling in the future.
export interface IWebsiteAsset {
  src: string;
  animated?: boolean;
  animateOnHover?: boolean;
}

// Website styling should contain only specific styling for the white-label.
export interface IWebsiteStyles {
  emailTheme?: any;
  theme?: any;
  // May contain special styles aside from theme
}

// List of assets available through out the platform
export interface IWebsiteAssets {
  emailLogoImage?: string;
  loginBgImage?: IWebsiteAsset;
  logoImage?: IWebsiteAsset;
  logoIcon?: IWebsiteAsset;
  logoFavicon?: IWebsiteAsset;
  selectUserFounder?: IWebsiteAsset;
  selectUserRecipient?: IWebsiteAsset;
}

export interface IWebsiteLinks {
  twitter?: string;
  linkedIn?: string;
  terms?: string;
  privacy?: string;
}

export interface IWebsiteAuthFeatures {
  memberOnly?: boolean;
  organisationOnly?: boolean;
}

export interface IWebsiteFeatures {
  auth?: IWebsiteAuthFeatures;
}

export interface IWebsite {
  domain: string;
  name?: string;
  email?: string;
  organizationId: string;
  styles?: IWebsiteStyles;
  assets?: IWebsiteAssets;
  links?: IWebsiteLinks;
  features?: IWebsiteFeatures;
}

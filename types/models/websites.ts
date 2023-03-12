// A single asset file that contains basic properties.
// Will be used to all upcoming brand white-labelling in the future.
export interface IWebsiteAsset {
  src: string;
  animated?: boolean;
  animateOnHover?: boolean;
}

// Website styling should contain only specific styling for the white-label.
export interface IWebsiteStyles {
  theme?: any;
  // May contain special styles aside from theme
}

// List of assets available through out the platform
export interface IWebsiteAssets {
  loginBgImage?: IWebsiteAsset;
  logoImage?: IWebsiteAsset;
  logoIcon?: IWebsiteAsset;
  selectUserFounder?: IWebsiteAsset;
  selectUserRecipient?: IWebsiteAsset;
}

export interface IWebsite {
  domain: string;
  name?: string;
  organizationId: string;
  styles?: IWebsiteStyles;
  assets?: IWebsiteAssets;
}

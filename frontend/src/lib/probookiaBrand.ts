import logosData from './probookia_logos.json';

export const PROBOOKIA_BRAND = {
  primaryColor: logosData.primary_color || '#1d2b58',
  secondaryColor: logosData.secondary_color || '#FAF9F6',
  tertiaryColor: logosData.tertiary_color || '#ff7a00',
  logoSvg: logosData.logo_svg || null,
  logoFooterSvg: logosData.logo_footer_svg || null,
};

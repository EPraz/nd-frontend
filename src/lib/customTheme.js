// Helper first (so it's defined before we use it)
const withOpacity = (hex, opacity) => {
  const stripped = hex.replace("#", "");
  const bigint = parseInt(stripped, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Base palettes original pallete
const primary = {
  50: "#FFF5ED",
  100: "#FEE9D6",
  200: "#FCCFAC",
  300: "#FAAC77",
  400: "#F67F41",
  500: "#F46425", // main brand color
  600: "#E54411",
  700: "#BE3110",
  800: "#972815",
  900: "#792315",
  950: "#400E0A",
};

const secondary = {
  50: "#e7edf7",
  300: "#9BBADE",
  400: "#4178B6",
  700: "#284b7c",
  800: "#244168",
  900: "#1d2f49",
  950: "#111b2c",
};
// Base palettes marino / seacolor
// const primary = {
//   50: "#E6F3FF", // espuma muy clara
//   100: "#CCE5FF",
//   200: "#99CCFF",
//   300: "#66B2FF",
//   400: "#338DFF",
//   500: "#0066CC", // main brand color (azul océano)
//   600: "#0052A3",
//   700: "#003D7A",
//   800: "#002A52",
//   900: "#00152B",
//   950: "#000A16",
// };

// const secondary = {
//   50: "#E6FFFA", // aqua muy suave
//   300: "#6EE7D6",
//   400: "#22C7B8",
//   700: "#0F766E",
//   800: "#115E59",
//   900: "#064E3B",
//   950: "#022C22",
// };

const warning = {
  50: "#FFF7F6",
  100: "#FFEBE9",
  200: "#FFDBD6",
  300: "#FFCCC6",
  400: "#FFBCB5",
  500: "#F8A8A0",
  600: "#F08C84",
  700: "#EF4444",
  800: "#E13237",
  900: "#D3232C",
  950: "#661717",
};

const info = {
  50: "#F5F9FF",
  100: "#E9F3FF",
  200: "#DAECFF",
  300: "#C2E0FF",
  400: "#B3D6FE",
  500: "#98C4F8",
  600: "#70ADF3",
  700: "#1990FF",
  800: "#1184EC",
  900: "#0072DC",
  950: "#043463",
};

const neutral = {
  black1: "#ffffff",
  black2: "#f6f6f6",
  black3: "#E7E7E7",
  black4: "#D1D1D1",
  black5: "#B0B0B0",
  black6: "#888888",
  black7: "#6D6D6D",
  black8: "#5D5D5D",
  black9: "#4F4F4F",
  black10: "#454545",
  black11: "#1F1F1F",
  black12: "#121212",
  black13: "#000000",
};

const success = {
  50: "#F3FCF5",
  100: "#E3F9E9",
  200: "#D1F4DA",
  300: "#BBEDC9",
  400: "#9EE3B3",
  500: "#76D596",
  600: "#2CC974",
  700: "#1EC26D",
  800: "#12BD69",
  900: "#00843A",
  950: "#0E3F23",
};

const pending = {
  50: "#FFF9E6",
  100: "#FFF0C8",
  200: "#FFE7B1",
  300: "#FFDC95",
  400: "#FFCB66",
  500: "#FCB94C",
  600: "#FAAD14",
  700: "#EFA200",
  800: "#ECA000",
  // 900: "#A56900",
  900: "#453303",
  950: "#4C3717",
};

const error = {
  50: "#FEF2F2",
  500: "#EF4444",
  700: "#F87171",
  950: "#450A0A",
};

// Semantic surfaces / background
const surface = {
  // Light / dark
  main: neutral.black1,
  mainDark: neutral.black12,

  constant: neutral.black1,
  constantDark: neutral.black1,

  inputField: withOpacity(neutral.black1, 0.4),
  inputFieldDark: withOpacity(neutral.black1, 0.05),

  pale: neutral.black2,
  paleDark: neutral.black13,

  gentle: neutral.black4,
  gentleDark: neutral.black10,

  sheen: neutral.black5,
  sheenDark: neutral.black9,

  bold: neutral.black12,
  boldDark: neutral.black2,

  disabled: neutral.black3,
  disabledDark: neutral.black10,

  // Primary
  primaryPale: primary[50],
  primaryPaleDark: primary[950],

  primarySheen: primary[100],
  primarySheenDark: primary[900],

  primaryNormal: primary[500],
  // primaryNormalDark: primary[700],
  primaryNormalDark: primary[400],

  primaryNormalConstant: primary[500],
  primaryNormalConstantDark: primary[500],

  primaryBold: primary[600],
  primaryBoldDark: primary[800],

  primaryExtraBold: primary[800],
  primaryExtraBoldDark: primary[900],

  // Secondary
  secondaryPale: secondary[50],
  secondaryPaleDark: secondary[950],

  secondaryBold: secondary[900],
  secondaryBoldDark: secondary[700],

  secondaryConstant: secondary[900],
  secondaryConstantDark: secondary[900],

  // Success
  successPale: success[50],
  successPaleDark: success[950],

  successBold: success[500],
  successBoldDark: success[700],

  // Pending
  pendingScale: pending[50],
  pendingScaleDark: pending[950],

  pendingPale: pending[50],
  pendingPaleDark: pending[900],

  pendingBold: pending[500],
  pendingBoldDark: pending[700],

  // Warning / error
  warningPale: error[50],
  warningPaleDark: error[950],

  warningBold: error[500],
  warningBoldDark: error[700],

  // Info
  infoPale: info[50],
  infoPaleDark: info[100],

  infoBold: info[500],
  infoBoldDark: info[700],

  // Buttons
  buttonPrimary: secondary[900],
  buttonPrimaryDark: primary[700],

  buttonPrimaryBold: secondary[800],
  buttonPrimaryBoldDark: primary[800],

  buttonSecondary: primary[50],
  buttonSecondaryDark: primary[900],

  buttonSecondaryBold: primary[100],
  buttonSecondaryBoldDark: primary[800],

  whiteCard: neutral.black1,
  whiteCardDark: neutral.black11,
};

// Semantic text
const ink = {
  main: neutral.black1,
  mainDark: neutral.black12,

  constant: neutral.black1,
  constantDark: neutral.black1,

  pale: neutral.black3,
  paleDark: neutral.black11,

  gentle: neutral.black4,
  gentleDark: neutral.black10,

  sheen: neutral.black6,
  sheenDark: neutral.black5,

  bold: secondary[900],
  boldDark: neutral.black1,

  boldConstant: secondary[900],
  boldConstantDark: neutral.black1,

  disabled: neutral.black5,
  disabledDark: neutral.black7,

  placeholder: neutral.black4,
  placeholderDark: neutral.black6,

  primaryBold: primary[500],
  primaryBoldDark: primary[400],

  primaryPale: primary[100],
  primaryPaleDark: primary[900],

  primarySheen: primary[200],
  primarySheenDark: primary[800],

  secondaryPale: secondary[300],
  secondaryPaleDark: secondary[400],

  secondarySheen: secondary[400],
  secondarySheenDark: secondary[800],

  secondaryBold: secondary[900],
  secondaryBoldDark: secondary[400],

  secondaryBoldConstant: secondary[900],
  secondaryBoldConstantDark: secondary[900],

  successBold: success[500],
  successBoldDark: success[300],

  successBoldConstant: success[500],
  successBoldConstantDark: success[500],

  pendingBold: pending[500],
  pendingBoldDark: pending[300],

  pendingBoldConstant: pending[500],
  pendingBoldConstantDark: pending[500],

  warningBold: warning[700],
  warningBoldDark: warning[300],

  warningBoldConstant: warning[500],
  warningBoldConstantDark: warning[500],

  infoBold: info[500],
  infoBoldDark: info[300],

  infoBoldConstant: info[500],
  infoBoldConstantDark: info[500],
};

// Stroke / borders
const stroke = {
  main: neutral.black1,
  mainDark: neutral.black11,

  pale: neutral.black3,
  paleDark: neutral.black11,

  gentle: neutral.black4,
  gentleDark: neutral.black10,

  sheen: neutral.black6,
  sheenDark: neutral.black9,

  bold: secondary[900],
  boldDark: neutral.black2,

  disabled: neutral.black5,
  disabledDark: neutral.black7,

  primaryPale: primary[100],
  primaryPaleDark: primary[900],

  primaryNormal: primary[500],
  primaryNormalDark: primary[400],

  primaryNormalConstant: primary[500],
  primaryNormalConstantDark: primary[500],

  successPale: success[100],
  successPaleDark: success[900],

  successBold: success[500],
  successBoldDark: success[400],

  successBoldConstant: success[500],
  successBoldConstantDark: success[500],

  pendingPale: pending[100],
  pendingPaleDark: pending[900],

  pendingBold: pending[500],
  pendingBoldDark: pending[400],

  pendingBoldConstant: pending[500],
  pendingBoldConstantDark: pending[500],

  warningPale: warning[100],
  warningPaleDark: warning[900],

  warningBold: warning[500],
  warningBoldDark: warning[500],

  warningBoldConstant: warning[500],
  warningBoldConstantDark: warning[500],

  infoPale: info[100],
  infoPaleDark: info[900],

  infoBold: info[500],
  infoBoldDark: info[900],

  infoBoldConstant: info[500],
  infoBoldConstantDark: info[500],
};

// Icons
const icon = {
  main: neutral.black1,
  mainDark: neutral.black12,

  lightConstant: neutral.black1,
  lightConstantDark: neutral.black1,

  pale: neutral.black3,
  paleDark: neutral.black11,

  gentle: neutral.black4,
  gentleDark: neutral.black4,

  sheen: neutral.black6,
  sheenDark: neutral.black5,

  bold: secondary[900],
  boldDark: neutral.black1,

  boldConstant: secondary[900],
  boldConstantDark: secondary[900],

  disabled: neutral.black5,
  disabledDark: neutral.black7,

  placeholder: neutral.black4,
  placeholderDark: neutral.black6,

  primaryPale: primary[100],
  primaryPaleDark: primary[900],

  primarySheen: primary[200],
  primarySheenDark: primary[800],

  primaryBold: primary[600],
  primaryBoldDark: primary[400],

  primaryBoldConstant: primary[600],
  primaryBoldConstantDark: primary[600],

  secondaryPale: secondary[300],
  secondaryPaleDark: secondary[400],

  secondarySheen: secondary[400],
  secondarySheenDark: secondary[800],

  secondaryBold: secondary[900],
  secondaryBoldDark: secondary[400],

  secondaryBoldConstant: secondary[900],
  secondaryBoldConstantDark: secondary[900],

  successBold: success[500],
  successBoldDark: success[300],

  successBoldConstant: success[500],
  successBoldConstantDark: success[500],

  pendingBold: pending[500],
  pendingBoldDark: pending[300],

  pendingBoldConstant: pending[500],
  pendingBoldConstantDark: pending[500],

  warningBold: warning[700],
  warningBoldDark: warning[300],

  warningBoldConstant: warning[500],
  warningBoldConstantDark: warning[500],

  infoBold: info[500],
  infoBoldDark: info[300],

  infoBoldConstant: info[500],
  infoBoldConstantDark: info[500],
};

module.exports = {
  primary,
  secondary,
  warning,
  info,
  neutral,
  success,
  pending,
  error,
  surface,
  ink,
  stroke,
  icon,
};

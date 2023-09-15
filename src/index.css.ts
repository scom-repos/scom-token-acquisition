import { Styles } from "@ijstech/components";

const Theme = Styles.Theme.ThemeVars;

export const customStyles = Styles.style({
  $nest: {
  }
})

const spin = Styles.keyframes({
  "to": {
    "-webkit-transform": "rotate(360deg)"
  }
});

export const spinnerStyle = Styles.style({
  display: "inline-block",
  width: "50px",
  height: "50px",
  border: "3px solid rgba(255,255,255,.3)",
  borderRadius: "50%",
  borderTopColor: Theme.colors.primary.main,
  "animation": `${spin} 1s ease-in-out infinite`,
  "-webkit-animation": `${spin} 1s ease-in-out infinite`
});

export const expandablePanelStyle = Styles.style({
  $nest: {
    'i-panel': {
      border: 'none'
    },
    '#comboEmbedType .icon-btn': {
      opacity: 0.5
    }
  }
})
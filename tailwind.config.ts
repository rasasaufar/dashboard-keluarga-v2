import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				'surface-variant': '#e1e3e4',
				'on-primary-container': '#86af99',
				'on-error-container': '#93000a',
				'on-tertiary-fixed': '#241a00',
				'on-secondary-container': '#536478',
				background: '#f8f9fa',
				error: '#ba1a1a',
				'surface-bright': '#f8f9fa',
				'outline-variant': '#c1c8c2',
				'secondary-container': '#cfe1f8',
				'on-tertiary-container': '#4e3d00',
				'on-secondary-fixed': '#0a1d2d',
				surface: '#f8f9fa',
				outline: '#717973',
				'tertiary-fixed': '#ffe088',
				'surface-container-high': '#e7e8e9',
				'error-container': '#ffdad6',
				tertiary: '#735c00',
				'primary-fixed-dim': '#a5d0b9',
				'primary-fixed': '#c1ecd4',
				'secondary-fixed': '#d2e4fb',
				'on-primary': '#ffffff',
				'on-secondary': '#ffffff',
				primary: '#012d1d',
				'surface-dim': '#d9dadb',
				'on-primary-fixed': '#002114',
				'on-surface': '#191c1d',
				'on-error': '#ffffff',
				secondary: '#4f6073',
				'surface-container-lowest': '#ffffff',
				'on-background': '#191c1d',
				'surface-tint': '#3f6653',
				'surface-container-highest': '#e1e3e4',
				'on-tertiary-fixed-variant': '#574500',
				'tertiary-container': '#cba72f',
				'inverse-on-surface': '#f0f1f2',
				'secondary-fixed-dim': '#b6c8df',
				'inverse-primary': '#a5d0b9',
				'inverse-surface': '#2e3132',
				'on-secondary-fixed-variant': '#37485b',
				'surface-container-low': '#f3f4f5',
				'surface-container': '#edeeef',
				'on-tertiary': '#ffffff',
				'on-primary-fixed-variant': '#274e3d',
				'tertiary-fixed-dim': '#e9c349',
				'on-surface-variant': '#414844',
				'primary-container': '#1b4332'
			},
			fontFamily: {
				headline: ['Manrope', 'sans-serif'],
				body: ['Inter', 'sans-serif'],
				label: ['Inter', 'sans-serif']
			},
			borderRadius: {
				DEFAULT: '0.125rem',
				lg: '0.25rem',
				xl: '0.5rem',
				full: '0.75rem'
			}
		}
	},
	plugins: [forms, containerQueries]
} as Config;

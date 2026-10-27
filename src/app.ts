import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App'; // Trỏ vào file App của bạn
import 'zmp-ui/zaui.css';
import './css/app.scss';
import appConfig from '../app-config.json';

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig;
}

const root = createRoot(document.getElementById('app')!);
root.render(React.createElement(App));
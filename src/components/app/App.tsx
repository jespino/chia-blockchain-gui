import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { I18nProvider } from '@lingui/react';
import { i18n } from "@lingui/core"
import useDarkMode from 'use-dark-mode';
import isElectron from 'is-electron';
import { en, fi, it, ru, sk, zh } from 'make-plural/plurals';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from '@chia/core';
import AppRouter from './AppRouter';
import darkTheme from '../../theme/dark';
import lightTheme from '../../theme/light';
import WebSocketConnection from '../../hocs/WebsocketConnection';
import store, { history } from '../../modules/store';
import { exit_and_close } from '../../modules/message';
import catalogEn from '../../locales/en/messages';
import catalogFi from '../../locales/fi/messages';
import catalogIt from '../../locales/it/messages';
import catalogRu from '../../locales/ru/messages';
import catalogSk from '../../locales/sk/messages';
import catalogZhCN from '../../locales/zh-CN/messages';
import useLocale from '../../hooks/useLocale';
import './App.css';
import AppModalDialogs from './AppModalDialogs';
import AppLoading from './AppLoading';

i18n.loadLocaleData('en', { plurals: en });
i18n.loadLocaleData('fi', { plurals: fi });
i18n.loadLocaleData('it', { plurals: it });
i18n.loadLocaleData('ru', { plurals: ru });
i18n.loadLocaleData('sk', { plurals: sk });
i18n.loadLocaleData('zh-CN', { plurals: zh });

// @ts-ignore
i18n.load('en', catalogEn.messages);
// @ts-ignore
i18n.load('fi', catalogFi.messages);
// @ts-ignore
i18n.load('it', catalogIt.messages);
// @ts-ignore
i18n.load('ru', catalogRu.messages);
// @ts-ignore
i18n.load('sk', catalogSk.messages);
// @ts-ignore
i18n.load('zh-CN', catalogZhCN.messages);

i18n.activate('en');

export default function App() {
  const { value: darkMode } = useDarkMode();
  const [locale] = useLocale('en');

  // get the daemon's uri from global storage (put there by loadConfig)
  let daemon_uri = null;
  if (isElectron()) {
    const electron = window.require('electron');
    const { remote : r } = electron;
    daemon_uri = r.getGlobal('daemon_rpc_ws');
  }

  useEffect(() => {
    i18n.activate(locale);
  }, [locale]);

  useEffect(() => {
    window.addEventListener('load', () => {
      if (isElectron()) {
        // @ts-ignore
        window.ipcRenderer.on('exit-daemon', (event) => {
          store.dispatch(exit_and_close(event));
        });
      }
    });
  }, []);

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <I18nProvider i18n={i18n}>
          <WebSocketConnection host={daemon_uri}>
            <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
              <AppRouter />
              <AppModalDialogs />
              <AppLoading />
            </ThemeProvider>
          </WebSocketConnection>
        </I18nProvider>
      </ConnectedRouter>
    </Provider>
  );
}

import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { AlertProvider } from './src/context/AlertContext';
import { ThemeProvider } from './src/context/ThemeContext';

import AppNavigator from './src/routes/AppNavigator';
import UsageTracker from './src/components/UsageTracker';
import { useFirebaseNotifications } from './src/hooks/useFirebaseNotifications';

function NotificationWrapper({ children }) {
  useFirebaseNotifications();
  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AlertProvider>
          <NotificationWrapper>
            <UsageTracker />
            <AppNavigator />
          </NotificationWrapper>
        </AlertProvider>
      </ThemeProvider>
    </Provider>
  );
}
